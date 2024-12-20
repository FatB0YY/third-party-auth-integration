import {
	getTokenExpiry,
	loginInTM,
	NAME_ACCESS_TOKEN,
	NAME_EXPIRES_ACCESS,
	NAME_REFRESH_TOKEN,
	NAME_SESSION,
	ResponseServerWithSessionType,
	ResponseServerWithTokensType,
	ResponseTokensType,
	SessionType,
	updateTokens,
} from '@auth';
import { NextFetchEvent, type NextRequest, NextResponse } from 'next/server';

import { authRoutes, publicRoutes } from '@/shared/constants';

import { locales } from '../config/i18n';

import { CustomMiddlewareType } from './chain';

type SessionAndTokensType = {
	accessToken?: string;
	refreshToken?: string;
	sessionToken?: string;
};

const publicPagesPathnameRegex = RegExp(
	`^(/(${locales.join('|')}))?(${[...publicRoutes, ...authRoutes]
		.flatMap((p) => (p === '/' ? ['', '/'] : p))
		.join('|')})/?$`,
	'i',
);

const authPagesPathnameRegex = RegExp(
	`^(/(${locales.join('|')}))?(${authRoutes.flatMap((p) => (p === '/' ? ['', '/'] : p)).join('|')})/?$`,
	'i',
);

const checkInTM = ({ accessToken, refreshToken, sessionToken }: SessionAndTokensType) => {
	if ((!accessToken && refreshToken) || (refreshToken && !sessionToken)) {
		return false;
	}

	// Пример более детализированных проверок:

	// 1. Проверка валидности токенов
	// isAccessTokenValid(accessToken) && isRefreshTokenValid(refreshToken)

	// 2. Проверка истечения срока действия
	// (!accessToken || isAccessTokenExpired(accessToken)) && !isRefreshTokenExpired(refreshToken)

	// 3. Проверка на наличие данных сессии
	// JSON.parse(sessionToken)
	// refreshToken && (!sessionToken || !isSessionDataComplete(sessionToken))

	return true;
};

export function authMiddleware(middleware: CustomMiddlewareType) {
	return async (request: NextRequest, event: NextFetchEvent) => {
		const accessTokenCopy = request.cookies.get(NAME_ACCESS_TOKEN);
		const refreshTokenCopy = request.cookies.get(NAME_REFRESH_TOKEN);
		const sessionTokenCopy = request.cookies.get(NAME_SESSION);

		const finishResponse = NextResponse.next({
			request,
		});

		if (accessTokenCopy) {
			finishResponse.cookies.set(accessTokenCopy.name, accessTokenCopy.value);
		}
		if (refreshTokenCopy) {
			finishResponse.cookies.set(refreshTokenCopy.name, refreshTokenCopy.value);
		}
		if (sessionTokenCopy) {
			finishResponse.cookies.set(sessionTokenCopy.name, sessionTokenCopy.value);
		}

		const responseUnmodified = finishResponse;

		const accessToken = responseUnmodified.cookies.get(NAME_ACCESS_TOKEN)?.value;
		const refreshToken = responseUnmodified.cookies.get(NAME_REFRESH_TOKEN)?.value;
		const sessionToken = responseUnmodified.cookies.get(NAME_SESSION)?.value;

		const { session, tokens } = await check({ accessToken, refreshToken, sessionToken });

		if (tokens && tokens.token_type === 'Bearer' && session) {
			responseUnmodified.cookies.set(NAME_ACCESS_TOKEN, tokens.access_token, {
				maxAge: tokens.expires_in,
				path: '/',
			});

			responseUnmodified.cookies.set(NAME_REFRESH_TOKEN, tokens.refresh_token, {
				httpOnly: true,
				maxAge: 1209600,
				path: '/',
			});

			responseUnmodified.cookies.set(NAME_SESSION, JSON.stringify(session), {
				maxAge: tokens.expires_in,
				path: '/',
			});

			const { expires_at } = await getTokenExpiry(tokens.expires_in);

			responseUnmodified.cookies.set(NAME_EXPIRES_ACCESS, expires_at, {
				path: '/',
			});
		} else {
			const responseUnmodified2 = clearCookies(responseUnmodified);
			return middleware(request, event, responseUnmodified2);
		}

		// const isAuthenticated = Boolean(tokens?.refresh_token) && Boolean(session);
		// const isPublicPage = publicPagesPathnameRegex.test(request.nextUrl.pathname);
		// const isAuthPage = authPagesPathnameRegex.test(request.nextUrl.pathname);

		// if (isAuthenticated && isAuthPage) {
		// 	const redirectResponse = NextResponse.redirect(new URL(EAppRoute.TEMPLATES_ORDER, request.url));
		// 	redirectResponse.headers.set('x-middleware-cache', 'no-cache');
		// 	return middleware(request, event, redirectResponse);
		// }

		// if (!isAuthenticated && !isPublicPage) {
		// 	let redirectResponse = NextResponse.redirect(new URL(EAppRoute.AUTH_LOGIN, request.url));
		// 	redirectResponse = clearCookies(redirectResponse);
		// 	redirectResponse.headers.set('x-middleware-cache', 'no-cache');
		// 	return middleware(request, event, redirectResponse);
		// }

		return middleware(request, event, responseUnmodified);
	};
}

function clearCookies(response: NextResponse) {
	response.cookies.delete(NAME_ACCESS_TOKEN);
	response.cookies.delete(NAME_REFRESH_TOKEN);
	response.cookies.delete(NAME_SESSION);
	response.cookies.delete(NAME_EXPIRES_ACCESS);
	return response;
}

async function check({ accessToken, refreshToken, sessionToken }: SessionAndTokensType): Promise<
	| {
			session: null;
			tokens: null;
	  }
	| {
			tokens: ResponseTokensType;
			session: SessionType;
	  }
> {
	if (!refreshToken) return { session: null, tokens: null };

	const isValid = checkInTM({ accessToken, refreshToken, sessionToken });

	if (!isValid) {
		try {
			// Update 3rd party auth
			const { success, tokens, error }: ResponseServerWithTokensType = await updateTokens({ refreshToken });

			if (success && tokens && tokens.token_type === 'Bearer') {
				const { expires_at } = await getTokenExpiry(tokens.expires_in);

				// Update 1rd party auth TM
				const { success, error, session }: ResponseServerWithSessionType = await loginInTM({
					accessToken: tokens.access_token,
					expiresAt: expires_at,
				});

				if (success && session) {
					return { tokens, session };
				} else {
					console.error('Ошибка при обновлении сессии:', error);
					return { session: null, tokens: null };
				}
			} else {
				console.error('Ошибка при обновлении токенов:', error);
				return { session: null, tokens: null };
			}
		} catch (error) {
			console.error('Непредвиденная ошибка:', error);
			return { session: null, tokens: null };
		}
	}

	return {
		tokens: {
			access_token: accessToken,
			refresh_token: refreshToken,
			token_type: 'Bearer',
			expires_in: 3600,
		} as ResponseTokensType,
		session: JSON.parse(sessionToken!),
	};
}

'use server';

import { v4 as uuidv4 } from 'uuid';

import { clearAllCookiesForHost, getCookie, getTokenExpiry, saveCookie } from '../../lib';
import {
	AUTH_PREFIX,
	BASE_HOST,
	CLIENT_ID,
	NAME_ACCESS_TOKEN,
	NAME_EXPIRES_ACCESS,
	NAME_REFRESH_TOKEN,
	NAME_TOKEN_AUTH_CODE,
	ResponseServerType,
} from '../../model';

type ResponseType = {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
};

export const getTokens = async (): Promise<ResponseServerType> => {
	try {
		const authCodeCookie = await getCookie(NAME_TOKEN_AUTH_CODE);

		const url = `${AUTH_PREFIX}${BASE_HOST}/oauth/access_token`;
		const clientSecret = process.env.CLIENT_SECRET;
		const postmanToken = uuidv4();

		if (!clientSecret) {
			return { success: false, error: `Error in get-tokens: process.env.CLIENT_SECRET not found` };
		}

		const body = new URLSearchParams({
			grant_type: 'authorization_code',
			code: authCodeCookie.value,
			client_id: CLIENT_ID,
			client_secret: clientSecret,
		}).toString();

		const response = await fetch(url, {
			cache: 'no-store',
			method: 'POST',
			headers: {
				'Cache-Control': 'no-cache',
				'Postman-Token': postmanToken,
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': '145',
				Host: new URL(url).hostname,
				Accept: '*/*',
				'Accept-Encoding': 'gzip, deflate, br',
				Connection: 'keep-alive',
			},
			credentials: 'include',
			body,
		});

		const tokens: ResponseType = await response.json();

		if (!tokens) {
			return { success: false, error: `Error in get-tokens: error getting access and refresh tokens` };
		}
		// TODO: maybe don't need to delete everything
		await clearAllCookiesForHost(undefined);

		await saveCookie({
			name: NAME_ACCESS_TOKEN,
			value: tokens.access_token,
			httpOnly: false,
			maxAge: tokens.expires_in,
			path: '/',
		});

		await saveCookie({
			name: NAME_REFRESH_TOKEN,
			value: tokens.refresh_token,
			httpOnly: true,
			maxAge: 1209600,
			path: '/',
		});

		const { expires_at } = await getTokenExpiry(tokens.expires_in);

		await saveCookie({
			name: NAME_EXPIRES_ACCESS,
			value: expires_at,
			path: '/',
		});

		return { success: true };
	} catch (error) {
		return { success: false, error: `Error in get-tokens: ${error}` };
	}
};

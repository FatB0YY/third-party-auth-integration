'use server';

import { createCookieHeader, getCookie, saveAllCookies } from '../../lib';
import {
	AUTH_PREFIX,
	BASE_HOST,
	NAME_TOKEN_AUTH_SESSION,
	NAME_TOKEN_LOGIN,
	NAME_TOKEN_PHPSESSID,
	ResponseServerType,
} from '../../model';

type CityAdsServerResponseError = {
	error: string[];
	show_captcha: boolean;
};

type CityAdsServerResponse = { url: string; status: string };

function isServerResponseError(
	response: CityAdsServerResponse | CityAdsServerResponseError,
): response is CityAdsServerResponseError {
	return (
		(response as CityAdsServerResponseError).error !== undefined &&
		(response as CityAdsServerResponseError).show_captcha !== undefined
	);
}

export const requestConfirmation = async (formData: FormData): Promise<ResponseServerType> => {
	try {
		const { email, password } = Object.fromEntries(formData) as Record<string, string>;

		if (!email || !password) {
			return { success: false, error: `Error in request-confirmation: email or password is missing` };
		}

		const url = `${AUTH_PREFIX}${BASE_HOST}/login?lang=ru&redirect_uri=&theme=material`;

		const [loginTokenCookie, authSessionCookie, phpsessidCookie] = await Promise.all([
			getCookie(NAME_TOKEN_LOGIN),
			getCookie(NAME_TOKEN_AUTH_SESSION),
			getCookie(NAME_TOKEN_PHPSESSID),
		]);

		const body = new URLSearchParams({
			username: email,
			password,
			remember: '1',
			grant_type: 'password',
			captcha: '',
			_token: loginTokenCookie.value,
		}).toString();

		const cookieHeader = await createCookieHeader([phpsessidCookie, authSessionCookie]);

		const response = await fetch(url, {
			cache: 'no-store',
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
				Connection: 'keep-alive',
				DNT: '1',
				'Sec-Fetch-Dest': 'empty',
				'Sec-Fetch-Mode': 'cors',
				'Sec-Fetch-Site': 'same-origin',
				'X-JSON': 'true',
				Cookie: cookieHeader,
			},
			credentials: 'include',
			body,
		});

		const data: CityAdsServerResponse | CityAdsServerResponseError = await response.json();

		if (isServerResponseError(data)) {
			const errorMessages = data.error.join(', ');
			return { success: false, error: `Error in request-confirmation: ${errorMessages}` };
		}

		if (!data?.status) {
			return { success: false, error: `Error in request-confirmation: status not success: ${JSON.stringify(data)}` };
		}

		await saveAllCookies(response);
		return { success: true };
	} catch (error) {
		return { success: false, error: `Error in request-confirmation: ${error}` };
	}
};

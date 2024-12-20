'use server';

import { v4 as uuidv4 } from 'uuid';

import { createCookieHeader, getCookie, saveCookie } from '../../lib';
import {
	AUTH_PREFIX,
	BASE_HOST,
	CLIENT_ID,
	NAME_TOKEN_AUTH_,
	NAME_TOKEN_AUTH_CODE,
	NAME_TOKEN_AUTH_SESSION,
	NAME_TOKEN_PHPSESSID,
	NAME_TOKEN_REMEMBER_FC,
	NAME_TOKEN_XSRF,
	ResponseServerType,
} from '../../model';

import { fetchWithRedirects } from './fetchWithRedirects';

export const manageRedirect = async (): Promise<ResponseServerType> => {
	try {
		const uniqueValue = uuidv4();

		const url = `${AUTH_PREFIX}${BASE_HOST}/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri&state=${uniqueValue}`;

		const [authCookie, rememberCookie, phpsessidCookie, xsrfTokenCookie, authSessionCookie] = await Promise.all([
			getCookie(NAME_TOKEN_AUTH_),
			getCookie(NAME_TOKEN_REMEMBER_FC),
			getCookie(NAME_TOKEN_PHPSESSID),
			getCookie(NAME_TOKEN_XSRF),
			getCookie(NAME_TOKEN_AUTH_SESSION),
		]);

		const cookieHeader = await createCookieHeader([
			authCookie,
			rememberCookie,
			phpsessidCookie,
			xsrfTokenCookie,
			authSessionCookie,
		]);

		const { authCode, finalResponse } = await fetchWithRedirects(url, cookieHeader);

		await saveCookie({
			name: NAME_TOKEN_AUTH_CODE,
			value: authCode,
		});

		return { success: true };
	} catch (error) {
		return { success: false, error: `Error in manage-redirect: ${error}` };
	}
};

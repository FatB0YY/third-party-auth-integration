'use server';

import { clearAllCookiesForHost, getLoginTokenFromResponseHtml, saveAllCookies, saveCookie } from '../../lib';
import { AUTH_PREFIX, BASE_HOST, NAME_TOKEN_LOGIN, ResponseServerType } from '../../model';

export const manageCookie = async (): Promise<ResponseServerType> => {
	try {
		await clearAllCookiesForHost(undefined);

		const url = `${AUTH_PREFIX}${BASE_HOST}/login?lang=ru&redirect_uri=&theme=material`;

		const response = await fetch(url, {
			cache: 'no-store',
			method: 'GET',
		});

		const loginTokenValue = await getLoginTokenFromResponseHtml(response);

		await saveCookie({ name: NAME_TOKEN_LOGIN, value: loginTokenValue });
		await saveAllCookies(response);

		return { success: true };
	} catch (error) {
		return { success: false, error: `Error in manage-cookie: ${error}` };
	}
};

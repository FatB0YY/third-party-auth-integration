'use server';

import { parseCookies } from './parseCookies';
import { saveCookie } from './saveCookie';

export async function saveAllCookies(response: Response) {
	try {
		const cookiesFromResponse = response.headers.get('set-cookie') || '';

		const parsedCookies = await parseCookies(cookiesFromResponse);

		for (let i = 0; i < parsedCookies.length; i++) {
			const { name, value, attributes } = parsedCookies[i];

			await saveCookie({
				name,
				value,
				expires: attributes.expires ? new Date(attributes.expires) : undefined,
				httpOnly: attributes.httponly || undefined,
				secure: attributes.secure || undefined,
				maxAge: attributes['max-age'] ? parseInt(attributes['max-age'], 10) : undefined,
			});
		}
	} catch (error) {
		throw error;
	}
}

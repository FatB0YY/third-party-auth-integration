'use server';

import { cookies } from 'next/headers';

export const clearAllCookiesForHost = async (host: string | undefined) => {
	try {
		const cookieStore = await cookies();
		const allCookies = cookieStore.getAll();

		for (const cookie of allCookies) {
			cookieStore.set(cookie.name, '', {
				domain: host,
				path: '/',
				expires: new Date(0),
				maxAge: 0,
			});
		}
	} catch (error) {
		throw error;
	}
};

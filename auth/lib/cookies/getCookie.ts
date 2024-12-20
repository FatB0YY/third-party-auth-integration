'use server';

import { cookies } from 'next/headers';

export async function getCookie(cookieName: string) {
	try {
		const cookieStore = await cookies();
		const cookie = cookieStore.get(cookieName);
		if (!cookie) throw new Error(`Cookie ${cookieName} not found`);
		return cookie;
	} catch (error) {
		throw error;
	}
}

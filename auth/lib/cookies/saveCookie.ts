'use server';

import { cookies } from 'next/headers';

type saveCookieProps = {
	name: string;
	value: string;
	hostOrDomain?: string;
	expires?: number | Date;
	httpOnly?: boolean;
	secure?: boolean;
	maxAge?: number;
	path?: string;
};

export async function saveCookie({
	name,
	value,
	hostOrDomain,
	expires,
	httpOnly,
	secure,
	maxAge,
	path,
}: saveCookieProps) {
	try {
		const cookieStore = await cookies();
		cookieStore.set({
			name,
			value,
			domain: hostOrDomain,
			expires,
			httpOnly,
			secure,
			maxAge,
			path,
		});
	} catch (error) {
		throw error;
	}
}

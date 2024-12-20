'use server';

type CookieType = {
	name: string;
	value: string;
};

export async function createCookieHeader(cookies: CookieType[]): Promise<string> {
	return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');
}

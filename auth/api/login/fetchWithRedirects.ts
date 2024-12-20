'use server';

import { v4 as uuidv4 } from 'uuid';

import { NAME_TOKEN_AUTH_CODE } from '../../model';

export async function fetchWithRedirects(url: string, cookieHeader: string, maxRedirects: number | undefined = 10) {
	const postmanToken = uuidv4();
	let currentUrl = url;
	let redirectCount = 0;
	let authCode: string | undefined;

	while (redirectCount < maxRedirects) {
		const response = await fetch(currentUrl, {
			method: 'GET',
			headers: {
				Cookie: cookieHeader,
				'Cache-Control': 'no-cache',
				'Accept-Encoding': 'gzip, deflate, br',
				Connection: 'keep-alive',
				'Postman-Token': postmanToken,
				Host: new URL(currentUrl).hostname,
				Accept: '*/*',
			},
			cache: 'no-store',
			credentials: 'include',
			redirect: 'manual',
		});

		if (response.status >= 300 && response.status < 400) {
			const location = response.headers.get('Location');
			if (!location) throw new Error('Redirect location header missing');

			currentUrl = new URL(location, currentUrl).toString();
			const code = new URL(currentUrl).searchParams.get('code');
			if (code) authCode = code;

			redirectCount++;
		} else {
			if (!authCode) throw new Error(`${NAME_TOKEN_AUTH_CODE} not found`);
			return { finalResponse: response, authCode };
		}
	}

	throw new Error(`Too many redirects (limit: ${maxRedirects})`);
}

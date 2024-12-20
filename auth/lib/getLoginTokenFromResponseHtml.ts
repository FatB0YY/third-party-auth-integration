'use server';

import * as cheerio from 'cheerio';

export async function getLoginTokenFromResponseHtml(response: Response) {
	try {
		const id = '#auth_content_login_token';

		const text = await response.text();
		if (!text) throw new Error('Failed to get html text');

		const $ = cheerio.load(text);

		const token = $(id).attr('value');
		if (!token) throw new Error(`${id} not found`);

		return token;
	} catch (error) {
		throw error;
	}
}

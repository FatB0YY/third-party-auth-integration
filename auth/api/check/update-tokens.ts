'use server';

import { AUTH_PREFIX, BASE_HOST, CLIENT_ID, ResponseServerWithTokensType, ResponseTokensType } from '../../model';

export const updateTokens = async ({
	refreshToken,
}: {
	refreshToken: string;
}): Promise<ResponseServerWithTokensType> => {
	try {
		const url = `${AUTH_PREFIX}${BASE_HOST}/oauth/access_token`;
		const clientSecret = process.env.CLIENT_SECRET;

		if (!clientSecret) {
			return { success: false, error: `Error in update-tokens: process.env.CLIENT_SECRET not found` };
		}

		const body = new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refreshToken,
			client_id: CLIENT_ID,
			client_secret: clientSecret,
		}).toString();

		const response = await fetch(url, {
			cache: 'no-store',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Cache-Control': 'no-cache',
				Accept: '*/*',
				'Accept-Encoding': 'gzip, deflate, br',
				Connection: 'keep-alive',
			},
			body,
		});

		const tokens: ResponseTokensType = await response.json();

		if (!tokens || tokens?.token_type !== 'Bearer') {
			return { success: false, error: `Error in update-tokens: error getting access and refresh tokens`, tokens };
		}

		return {
			success: true,
			tokens: tokens,
		};
	} catch (error) {
		return { success: false, error: `Error in update-tokens: ${error}` };
	}
};

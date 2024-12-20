'use server';

import { ResponseServerWithSessionType, SessionType } from '../../model';

export const loginInTM = async ({
	accessToken,
	expiresAt,
}: {
	accessToken: string;
	expiresAt: string;
}): Promise<ResponseServerWithSessionType> => {
	try {
		const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/check`;
		const body = JSON.stringify({ expires_at: expiresAt });

		const response = await fetch(url, {
			cache: 'no-store',
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body,
		});

		const session: SessionType = await response.json();

		return { success: true, session: session };
	} catch (error) {
		console.error('error-----------', error);
		return { success: false, error: `Error in loginInTM: ${error}` };
	}
};

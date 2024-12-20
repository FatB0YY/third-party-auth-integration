'use server';

import { cookies } from 'next/headers';

import {
	NAME_ACCESS_TOKEN,
	NAME_EXPIRES_ACCESS,
	NAME_REFRESH_TOKEN,
	NAME_SESSION,
	ResponseServerType,
} from '../../model';

export const logout = async (): Promise<ResponseServerType> => {
	try {
		const cookieStore = await cookies();

		await cookieStore.delete(NAME_ACCESS_TOKEN);
		await cookieStore.delete(NAME_REFRESH_TOKEN);
		await cookieStore.delete(NAME_EXPIRES_ACCESS);
		await cookieStore.delete(NAME_SESSION);

		return { success: true };
	} catch (error) {
		return { success: false, error: `Error in logout: ${error}` };
	}
};

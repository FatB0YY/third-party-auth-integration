'use server';

import { ResponseServerType } from '../../model';

import { getTokens } from './get-tokens';
import { manageCookie } from './manage-cookie';
import { manageRedirect } from './manage-redirect';
import { requestConfirmation } from './request-confirmation';

export const login = async (formData: FormData): Promise<ResponseServerType> => {
	try {
		const steps = [manageCookie, () => requestConfirmation(formData), manageRedirect, getTokens];

		for (const step of steps) {
			const result: ResponseServerType = await step();
			if (result.error) {
				return result;
			}
		}

		return { success: true };
	} catch (error) {
		return { success: false, error: `Error in login: ${error}` };
	}
};

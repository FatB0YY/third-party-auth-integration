'use server';

import { cookies } from 'next/headers';

import { NAME_SESSION, SessionType } from '../../model';

export async function getSession(): Promise<SessionType | null> {
	try {
		const cookieStore = await cookies();
		const session = cookieStore.get(NAME_SESSION)?.value;
		if (!session) return null;
		return JSON.parse(session);
	} catch (error) {
		throw error;
	}
}

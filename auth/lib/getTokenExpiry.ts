'use server';

import dayjs from 'dayjs';

export async function getTokenExpiry(expiresInSeconds: number): Promise<{ expires_at: string }> {
	const now = dayjs();
	const expiryDate = now.add(expiresInSeconds, 'second');
	const formattedExpiryDate = expiryDate.format('YYYY-MM-DD HH:mm:ss');

	return { expires_at: formattedExpiryDate };
}

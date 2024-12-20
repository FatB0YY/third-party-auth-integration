'use server';

/**
 * Extracts a specific cookie value from the "Set-Cookie" header.
 * @param {string} cookies - The full "Set-Cookie" string.
 * @param {string} cookieName - The name of the cookie to extract.
 * @returns {string} The value of the specified cookie, or throws an error if not found.
 */
export async function extractCookieValue(cookies: string, cookieName: string) {
	const cookieMatch = cookies.match(new RegExp(`${cookieName}=([^;]+)`));
	if (!cookieMatch) throw new Error(`Cookie ${cookieName} not found`);
	return cookieMatch[1];
}

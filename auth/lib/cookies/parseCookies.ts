'use server';

export type CookieInfoType = {
	name: string;
	value: string;
	attributes: Record<string, any>;
};

export async function parseCookies(cookieString: string) {
	const cookies = cookieString.split(/,(?=[^;,]+=[^;,]+)/);
	const result: CookieInfoType[] = [];

	cookies.forEach((cookie) => {
		const parts = cookie.split(';').map((part) => part.trim());

		const [nameValue, ...attributes] = parts;
		const [name, ...valueParts] = nameValue.split('=');
		const value = valueParts.join('=');

		const cookieObject: CookieInfoType = {
			name: decodeURIComponent(name.trim()),
			value: value.trim(),
			attributes: {},
		};

		attributes.forEach((attr) => {
			const [attrName, attrValue] = attr.split('=');
			cookieObject.attributes[attrName.trim().toLowerCase()] = attrValue ? decodeURIComponent(attrValue.trim()) : true;
		});

		result.push(cookieObject);
	});

	return result;
}

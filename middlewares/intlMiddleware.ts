import { type NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { ELanguage, LOCALES } from '@/shared/constants';

import { CustomMiddlewareType } from './chain';

const nextIntlMiddleware = createMiddleware({
	locales: LOCALES,
	defaultLocale: ELanguage.RU,
});

export function intlMiddleware(middleware: CustomMiddlewareType) {
	return async (request: NextRequest, event: NextFetchEvent, response: NextResponse) => {
		const intlResponse = await nextIntlMiddleware(request);

		const finalResponse = intlResponse || response;

		return middleware(request, event, finalResponse);
	};
}

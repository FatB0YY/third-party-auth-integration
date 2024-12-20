import { NextMiddlewareResult } from 'next/dist/server/web/types';
import type { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

export type CustomMiddlewareType = (
	request: NextRequest,
	event: NextFetchEvent,
	response: NextResponse,
) => NextMiddlewareResult | Promise<NextMiddlewareResult>;

type MiddlewareFactoryType = (middleware: CustomMiddlewareType) => CustomMiddlewareType;

export function chain(functions: MiddlewareFactoryType[], index = 0): CustomMiddlewareType {
	const current = functions[index];

	if (current) {
		const next = chain(functions, index + 1);
		return current(next);
	}

	return (request: NextRequest, event: NextFetchEvent, response: NextResponse) => {
		return response;
	};
}

import Cookies from 'js-cookie';

import { NAME_SESSION, SessionType } from '../../model';

export function useSession(): SessionType | null {
	const session = Cookies.get(NAME_SESSION);
	if (!session) return null;
	return JSON.parse(session);
}

import { EUserRoles } from '../constants';

type PermissionActionsType =
	| 'manage_advertising_content'
	| 'manage_channels'
	| 'manage_projects'
	| 'manage_templates'
	| 'manage_cart'
	| 'manage_incoming_offers'
	| 'manage_utm_template';

export type ResponseServerType =
	| {
			success: boolean;
			error?: undefined;
	  }
	| {
			success: boolean;
			error: string;
	  };

export type ResponseServerWithSessionType =
	| {
			success: boolean;
			error?: undefined;
			session: SessionType;
	  }
	| {
			success: boolean;
			error: string;
			session?: SessionType;
	  };

export type ResponseServerWithTokensType =
	| {
			success: boolean;
			error?: undefined;
			tokens: ResponseTokensType;
	  }
	| {
			success: boolean;
			error: string;
			tokens?: ResponseTokensType;
	  };

export type SessionType = {
	email: string;
	role: EUserRoles;
	permissions: PermissionActionsType[];
};

export type ResponseTokensType = {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
};

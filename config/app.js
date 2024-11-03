import process from 'node:process';
import { config } from 'dotenv';

config();
const {
	JWT_SECRET,
	JWT_TOKEN_EXPIRES,
	JWT_TOKEN_EXPIRES_ACCESS,
	NODE_ENV,
	PORT,
	COOKIE_SECURE,
	COOKIE_ONLY,
	COOKIE_SAMESITE,
	CORS_CREDENTIALS,
} = process.env;
export default {
	SECRET: NODE_ENV === 'production' ? JWT_SECRET : 'prpZUoYKk3YJ3nhemFHZ',
	ACCESS: {
		type: 'access_token',
		expiresIn: JWT_TOKEN_EXPIRES_ACCESS,
	},
	REFRESH: {
		type: 'refresh_token',
		expiresIn: JWT_TOKEN_EXPIRES,
	},
	PORT: PORT || 3005,

	CORS_OPTIONS: {
		credentials: Boolean(CORS_CREDENTIALS),
	},
	COOKIE_OPTIONS: {
		httpOnly: Boolean(COOKIE_ONLY),
		secure: Boolean(COOKIE_SECURE),
		sameSite: COOKIE_SAMESITE,
	},
};

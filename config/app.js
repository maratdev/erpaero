import process from 'node:process';
import { config } from 'dotenv';
config();
const { JWT_SECRET, JWT_TOKEN_EXPIRES, JWT_TOKEN_EXPIRES_ACCESS, NODE_ENV, PORT } = process.env;
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
};

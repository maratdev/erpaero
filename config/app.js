import process from 'node:process';
import { config } from 'dotenv';
config();
const { JWT_SECRET, JWT_TOKEN_EXPIRES, JWT_TOKEN_EXPIRES_ACCESS, NODE_ENV } = process.env;
export default {
  SECRET: NODE_ENV === 'production' ? JWT_SECRET : 'prpZUoYKk3YJ3nhemFHZ',
  ACCESS: {
		type: 'access',
		expiresIn: JWT_TOKEN_EXPIRES_ACCESS,
	},
  REFRESH: {
		type: 'refresh',
		expiresIn: JWT_TOKEN_EXPIRES,
	},
};

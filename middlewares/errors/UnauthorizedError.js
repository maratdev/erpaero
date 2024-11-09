import { UNAUTHORIZED } from './statusCode.js';

export class UnauthorizedError extends Error {
	constructor(message) {
		super(message);
		this.statusCode = UNAUTHORIZED;
	}
}

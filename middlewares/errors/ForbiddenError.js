import { FORBIDDEN } from './statusCode.js';

export class ForbiddenError extends Error {
	constructor(message) {
		super(message);
		this.statusCode = FORBIDDEN;
	}
}

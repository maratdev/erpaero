import { CONFLICT_ERROR } from './statusCode.js';

export class ConflictError extends Error {
	constructor(message) {
		super(message);
		this.statusCode = CONFLICT_ERROR;
	}
}

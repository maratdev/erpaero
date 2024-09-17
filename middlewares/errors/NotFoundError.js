import { NOT_FOUND } from './statusCode.js';

export class NotFoundError extends Error {
	constructor(message) {
		super(message);
		this.statusCode = NOT_FOUND;
	}
}

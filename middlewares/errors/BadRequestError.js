import { BAD_REQUEST } from './statusCode.js';

export class BadRequestError extends Error {
	constructor(message) {
		super(message);
		this.statusCode = BAD_REQUEST;
	}
}

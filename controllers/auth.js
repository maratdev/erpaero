import bcrypt from 'bcryptjs';
import process from 'node:process';
import {
  StatusCodes,
} from 'http-status-codes';
import { UserModel } from '../models/users/userModel.js';
import { BadRequestError } from '../middlewares/errors/BadRequestError.js';
import { duplicateEmailError, invalidDataError } from '../middlewares/errors/error-texts.js';
import { ConflictError } from '../middlewares/errors/ConflictError.js'; // Подключаем модель

const { NODE_ENV, JWT_SECRET } = process.env;
// Создаёт пользователя
export const createUser = (req, res, next) => {
	req.body.password = bcrypt.hashSync(req.body.password, 7);
	const { email, password } = req.body;
  UserModel.create({
		email: email,
    password: password,
	})
		.then((result) => {
			res.status(StatusCodes.CREATED).send({
				email: result.email,
        password: result.password,
			});
		})
		.catch((err) => {
      console.log(err);
			if (err.email === 'ValidationError') {
				next(new BadRequestError(invalidDataError));
			} else if (err.code === 'ER_DUP_ENTRY') {
				next(new ConflictError(duplicateEmailError));
			} else {
				next(err);
			}
		});
};
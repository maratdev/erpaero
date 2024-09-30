import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import process from 'node:process';
import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../models/users/userModel.js';
import { BadRequestError } from '../middlewares/errors/BadRequestError.js';
import {
  duplicateEmailError,
  invalidDataError,
  userEmailNotFound,
  wrongCredentialsError,
} from '../middlewares/errors/error-texts.js';
import { ConflictError } from '../middlewares/errors/ConflictError.js';

const { NODE_ENV, JWT_SECRET, JWT_TOKEN_EXPIRES } = process.env;
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
			if (err.errors[0].validatorKey === 'isEmail') {
				next(new BadRequestError(invalidDataError));
			} else if (err.parent?.errno === 1062) {
				next(new ConflictError(duplicateEmailError));
			} else {
				next(err);
			}
		});
};

// Авторизация
export const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const user = await UserModel.findOne({ where: { email } });
		if (!user) {
			next(new BadRequestError(userEmailNotFound));
		}
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			next(new BadRequestError(wrongCredentialsError));
		}
		const token = jwt.sign(
			{ id: user.id.toString(), email: user.email },
			NODE_ENV === 'production' ? JWT_SECRET : 'prpZUoYKk3YJ3nhemFHZ',
			{
				expiresIn: JWT_TOKEN_EXPIRES,
			},
		);
		res.status(StatusCodes.OK).send({ token });
	} catch (err) {
		next(err);
	}
};
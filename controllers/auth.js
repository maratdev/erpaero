import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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
import tokens from '../config/app.js';

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
    const payload = { id: user.id.toString(), email: user.email };
		const accessToken = jwt.sign(payload, tokens.SECRET, {
			expiresIn: tokens.ACCESS.expiresIn,
		});

		const refreshToken = jwt.sign(payload, tokens.SECRET, { expiresIn: tokens.REFRESH.expiresIn });
    await user.update({ token: refreshToken });

		res.status(StatusCodes.OK).send({ accessToken });
	} catch (err) {
		//console.log(err);
		next(err);
	}
};

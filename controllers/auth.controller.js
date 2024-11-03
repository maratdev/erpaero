import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import config from '../config/app.js';
import tokens from '../config/app.js';
import UserModel from '../models/users/userModel.js';
import { BadRequestError } from '../middlewares/errors/BadRequestError.js';
import { TOKEN, USER } from '../middlewares/errors/error-texts.js';
import { ConflictError } from '../middlewares/errors/ConflictError.js';
import { UnauthorizedError } from '../middlewares/errors/UnauthorizedError.js';
import RefreshTokenModel from '../models/users/RefreshTokenModel.js';
import { NotFoundError } from '../middlewares/errors/NotFoundError.js';
import { Logger } from '../middlewares/logger/index.js';
import {
	createAccessToken,
	createRefreshToken,
	decodeToken,
	findBdRefreshToken,
	headerTokenCookie,
	headerTokenLocal,
	sm,
} from '../util/helper.js';

export const createRefreshTokenBd = async (userId, refreshToken, next) => {
	try {
		if (userId) {
			const tokenFindDb = await RefreshTokenModel.findOne({
				where: { user_id: userId, hashedToken: refreshToken },
			});
			if (tokenFindDb) await tokenFindDb.destroy();

			const newToken = await RefreshTokenModel.create({
				user_id: userId,
				hashedToken: refreshToken,
			});

			return newToken.hashedToken;
		}
	} catch (err) {
		//Logger.error(err);
		next(err);
	}
};

//----------------------------------------------------------------//
// Создаёт пользователя
export const createUser = async (req, res, next) => {
	try {
		req.body.password = bcrypt.hashSync(req.body.password, 7);
		const { email, password } = req.body;

		// проверка есть ли пользователь с таким email
		const userCheckDb = await UserModel.findOne({ where: { email } });
		if (userCheckDb) return next(new ConflictError(USER.EMAIL_DUPLICATION));

		await UserModel.create({
			email: email,
			password: password,
		});

		res.status(StatusCodes.CREATED).send();
	} catch (err) {
		Logger.info(err);
		next(err);
	}
};

// Авторизация
export const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const userDb = await UserModel.findOne({ where: { email } });
		if (!userDb) {
			return next(new NotFoundError(USER.EMAIL_NOT_FOUND));
		}

		const isPasswordValid = await bcrypt.compare(password, userDb.password);
		if (!isPasswordValid) {
			return next(new BadRequestError(USER.INVALID_PASSWORD));
		}

		const accessToken = await createAccessToken(userDb?.id);
		const refreshToken = await createRefreshToken(userDb?.id);
		res.cookie('jwt', refreshToken, {
			maxAge: sm(tokens.REFRESH.expiresIn),
			httpOnly: config.COOKIE_OPTIONS.httpOnly,
			secure: config.COOKIE_OPTIONS.secure,
			sameSite: config.COOKIE_OPTIONS.sameSite,
		});
		await createRefreshTokenBd(userDb?.id, refreshToken);
		res.status(StatusCodes.OK).send({ accessToken });
	} catch (err) {
		//Logger.info(err);
		return next(err);
	}
};

export const authenticate = async (req, res, next) => {
	try {
		const token = await headerTokenLocal(req, res, next);

		let payload;
		try {
			payload = jwt.verify(token, tokens.SECRET);
		} catch {
			return next(new UnauthorizedError(USER.UNAUTHORIZED));
		}
		req.accessToken = { value: token, exp: payload.exp };
		req.user = payload;
		next();
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
			return res
				.status(StatusCodes.UNAUTHORIZED)
				.json({ message: TOKEN.INVALID_TIME, code: 'AccessTokenExpired' });
		} else if (err instanceof jwt.JsonWebTokenError) {
			return res
				.status(StatusCodes.UNAUTHORIZED)
				.json({ message: TOKEN.INVALID, code: 'AccessTokenInvalid' });
		} else {
			//Logger.error(err);
			return next(err);
		}
	}
};

export const refreshTokenCheck = async (req, res, next) => {
	const token = await headerTokenCookie(req, res, next);
	try {
		const decoded = await decodeToken(token, tokens.SECRET);
		const userBd = await findBdRefreshToken(token, decoded?.userId, next);
		if (userBd) await userBd.destroy();
		const accessToken = await createAccessToken(decoded?.userId);
		const newRefreshToken = await createRefreshToken(decoded?.userId);

		if (userBd) {
			const refreshToken = await RefreshTokenModel.create({
				user_id: decoded.userId,
				hashedToken: newRefreshToken,
			});
			await refreshToken.save();

			res
				.cookie('jwt', newRefreshToken, {
					maxAge: sm(tokens.REFRESH.expiresIn),
					httpOnly: config.COOKIE_OPTIONS.httpOnly,
					secure: config.COOKIE_OPTIONS.secure,
					sameSite: config.COOKIE_OPTIONS.sameSite,
				})
				.status(StatusCodes.OK)
				.send({ accessToken });
		}
	} catch (err) {
		//Logger.info(err);
		return next(err);
	}
};

export const destroyToken = async (req, res, next) => {
	try {
		const token = await headerTokenCookie(req, res, next);
		if (token) {
			const decoded = await decodeToken(token, tokens.SECRET, next);
			const refreshBd = await findBdRefreshToken(token, decoded?.userId, next);
			if (refreshBd) {
				await refreshBd.destroy();
				res.clearCookie('jwt').status(StatusCodes.OK).send({ message: USER.LOGOUT });
			}
		}
	} catch (err) {
		//Logger.info(err);
		return next(err);
	}
};

export const destroyAllToken = async (req, res, next) => {
	try {
		const token = await headerTokenCookie(req, res, next);
		console.log(token);
		const decoded = decodeToken(token, tokens.SECRET, next);
		const refreshBd = await RefreshTokenModel.destroy({
			attributes: ['user_id'],
			where: { user_id: decoded.userId },
		});

		if (refreshBd) {
			res.clearCookie('jwt').status(StatusCodes.OK).send({ message: USER.LOGOUT_ALL });
		} else {
			return next(new NotFoundError(TOKEN.NOT_FOUND));
		}
	} catch (err) {
		//Logger.info(err);
		return next(err);
	}
};

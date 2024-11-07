import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import crypto from 'crypto';
import NodeCache from 'node-cache';
import tokens from '../config/app.js';
import UserModel from '../models/users/userModel.js';
import { BadRequestError } from '../middlewares/errors/BadRequestError.js';
import { TOKEN, TOTP, USER } from '../middlewares/errors/error-texts.js';
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

const cache = new NodeCache();

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

		res.status(StatusCodes.CREATED).send({ message: USER.CREATED});
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

    if (userDb.two_factor_enabled === true) {
			const tempToken = crypto.randomUUID();
			cache.set(tokens.TEMP_TOKEN.cache + tempToken, userDb.id, tokens.TEMP_TOKEN.expiresIn); //180s -> 3m
			return res
				.status(StatusCodes.OK)
				.send({ tempToken, expiresInSecond: tokens.TEMP_TOKEN.expiresIn });
		} else {
			const accessToken = await createAccessToken(userDb?.id);
			const refreshToken = await createRefreshToken(userDb?.id);
			res.cookie('jwt', refreshToken, {
				maxAge: sm(tokens.REFRESH.expiresIn),
				httpOnly: tokens.COOKIE_OPTIONS.httpOnly,
				secure: tokens.COOKIE_OPTIONS.secure,
				sameSite: tokens.COOKIE_OPTIONS.sameSite,
			});
			await createRefreshTokenBd(userDb?.id, refreshToken);
			res.status(StatusCodes.OK).send({ accessToken });
		}
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
					httpOnly: tokens.COOKIE_OPTIONS.httpOnly,
					secure: tokens.COOKIE_OPTIONS.secure,
					sameSite: tokens.COOKIE_OPTIONS.sameSite,
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

export const twoFactorAuth = async (req, res, next) => {
	try {
		const { userId } = req.user;
		const user = await UserModel.findOne({ where: { id: userId } });
		if (!user) {
			return next(new NotFoundError(USER.NOT_FOUND));
		}
		const secret = authenticator.generateSecret();
		const uri = authenticator.keyuri(user.email, 'Erpaero', secret);

		await user.update({ two_factor_secret: secret });
		const qrCode = await qrcode.toBuffer(uri, { type: 'image/png', margin: 1 });
		res.setHeader('Content-Disposition', 'attachment; filename=qrcode.png');
		return res.status(StatusCodes.OK).type('image/png').send(qrCode);
	} catch (err) {
		//Logger.info(err);
		return next(err);
	}
};

export const twoFactorValidate = async (req, res, next) => {
	try {
		const { totp } = req.body;
		const { userId } = req.user;
		if (!totp) {
			return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: TOTP.REQUIRED });
		}
		const user = await UserModel.findOne({ where: { id: userId } });
		if (!user) {
			return next(new NotFoundError(USER.NOT_FOUND));
		}
		const verified = authenticator.check(totp, user.two_factor_secret);
		if (!verified) {
			return res.status(StatusCodes.BAD_REQUEST).json({ message: TOTP.INVALID });
		}
		await user.update({ two_factor_enabled: true });

		return res.status(StatusCodes.OK).json({ message: TOTP.SUCCESS });
	} catch (err) {
		//Logger.info(err);
		return next(err);
	}
};

export const twoFactorLogin = async (req, res, next) => {
  try {
    const { tempToken, totp } = req.body
    if (!tempToken || !totp) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: TOTP.CONFIRM })
    }
    const userId = cache.get(tokens.TEMP_TOKEN.cache + tempToken)
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: TOTP.EXIST })
    }
    const user = await UserModel.findOne({ where: { id: userId } });

    const verified = authenticator.check(totp, user.two_factor_secret)
    if (!verified) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: TOTP.INVALID });
    }
    const accessToken = await createAccessToken(user?.id);
    const refreshToken = await createRefreshToken(user?.id);
    res.cookie('jwt', refreshToken, {
      maxAge: sm(tokens.REFRESH.expiresIn),
      httpOnly: tokens.COOKIE_OPTIONS.httpOnly,
      secure: tokens.COOKIE_OPTIONS.secure,
      sameSite: tokens.COOKIE_OPTIONS.sameSite,
    });
    await createRefreshTokenBd(user?.id, refreshToken);
    res.status(StatusCodes.OK).send({ accessToken });
  } catch (err) {
    //Logger.info(err);
    return next(err);
  }
};

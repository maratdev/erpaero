import { BadRequestError } from '../middlewares/errors/BadRequestError.js';
import { TOKEN } from '../middlewares/errors/error-texts.js';
import jwt from 'jsonwebtoken';
import RefreshTokenModel from '../models/users/RefreshTokenModel.js';
import tokens from '../config/app.js';
import { NotFoundError } from '../middlewares/errors/NotFoundError.js';

export const sm = (str) => {
	// string to milliseconds
	const units = {
		yr: { re: /(\d+|\d*\.\d+)\s*(Y)/i, s: 1000 * 60 * 60 * 24 * 365 },
		mo: { re: /(\d+|\d*\.\d+)\s*(M|[Mm][Oo])/, s: 1000 * 60 * 60 * 24 * 30 },
		wk: { re: /(\d+|\d*\.\d+)\s*(W)/i, s: 1000 * 60 * 60 * 24 * 7 },
		dy: { re: /(\d+|\d*\.\d+)\s*(D)/i, s: 1000 * 60 * 60 * 24 },
		hr: { re: /(\d+|\d*\.\d+)\s*(h)/i, s: 1000 * 60 * 60 },
		mn: { re: /(\d+|\d*\.\d+)\s*(m(?![so])|[Mm][Ii]?[Nn])/, s: 1000 * 60 },
		s: { re: /(\d+|\d*\.\d+)\s*(s)/i, s: 1000 },
		ms: { re: /(\d+|\d*\.\d+)\s*(ms|mil)/i, s: 1 },
	};

	return Object.values(units).reduce(
		(sum, unit) => sum + (str.match(unit.re)?.[1] * unit.s || 0),
		0,
	);
};

export const headerTokenCookie = async (req) => {
    const token = req.cookies['jwt'];
    if (!token) {
      throw new NotFoundError(TOKEN.NOT_FOUND)
    }
    return token;
};

export const headerTokenLocal = async (req) => {
	const refreshToken = req.headers['authorization'];

	if (!refreshToken?.startsWith('Bearer ')) {
    throw new BadRequestError(TOKEN.INVALID_RT);
	}
	return refreshToken.replace('Bearer ', '');
};

export const decodeToken = async (token, key, next) => {
	return jwt.verify(token, key, async (err, decoded) => {
		if (err) {
      throw new BadRequestError(TOKEN.INVALID_RT);
		}
		return decoded;
	});
};

export const findBdRefreshToken = async (refreshToken, userId) => {
		if (userId) {
			const userToken = await RefreshTokenModel.findOne({
				where: { user_id: userId, hashedToken: refreshToken },
			});
			if (!userToken) {
        throw new BadRequestError(TOKEN.INVALID_BD);
			} else {
				return userToken;
			}
		}
};

export const createAccessToken = async (userId) => {
		return jwt.sign({ userId: userId }, tokens.SECRET, {
			subject: tokens.ACCESS.type,
			expiresIn: tokens.ACCESS.expiresIn,
		});
};
export const createRefreshToken = async (userId) => {
		return jwt.sign({ userId: userId }, tokens.SECRET, {
			expiresIn: tokens.REFRESH.expiresIn,
			subject: tokens.REFRESH.type,
		});
};

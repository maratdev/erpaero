import express from 'express';
import cors from "cors";
import {
	authenticate,
	createUser,
	destroyToken,
	login,
	refreshTokenCheck,
} from './controllers/auth.js';
import { errors } from 'celebrate';
import db from './config/db.js';
import { serverLog } from './middlewares/serverlog.js';
import { validationCreateUser, validationLogin } from './middlewares/validation.js';
import { Logger } from './middlewares/logger/index.js';
import config from './config/app.js';
import cookieParser from 'cookie-parser';

const app = express() || express.Router;


app.use(
  cors({
    credentials: true,
  })
);
app.use(
	cookieParser({
    secure: true,
		httpOnly: true,
		sameSite: 'strict',
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//testing api
app.post('/signup', validationCreateUser, createUser);
app.post('/signin', validationLogin, login);
app.get('/refresh-token', refreshTokenCheck);
app.get('/delete-token', authenticate, destroyToken);

app.get('/users/current', authenticate, async (req, res) => {
	try {
		return res.status(200).json({
			msg: 'Successfully retrieved current token',
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
});

// error handler
app.use(errors());
app.use(serverLog);

// ----------------------------------- Настройки сервера и БД --------------------------------/
const initApp = async () => {
	try {
		await db.sync();
		await db.authenticate();
		Logger.info('Connection DB has been established successfully.');
		app.listen(config.PORT, () => {
			Logger.info(`App listening on port ${config.PORT}!`);
		});
	} catch (error) {
		Logger.info(`Unable to connect to the database: ${error.original}`);
	}
};

await initApp();
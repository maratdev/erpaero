import express from 'express';
import cors from 'cors';
import { errors } from 'celebrate';
import db from './config/db.js';
import { serverLog } from './middlewares/serverlog.js';
import { Logger } from './middlewares/logger/index.js';
import config from './config/app.js';
import cookieParser from 'cookie-parser';
import userRouter from './routes/users.js';

const app = express() || express.Router;

app.use(cors(config.CORS_OPTIONS));
app.use(cookieParser(config.COOKIE_OPTIONS));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//api
app.use('/auth', userRouter);

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
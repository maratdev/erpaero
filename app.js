import { config } from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import process from 'node:process';
import { Logger } from './util/logger.js';
import { createUser, login } from './controllers/auth.js';
import {errors} from 'celebrate';
import db from './config/db.js';
import { serverLog } from './middlewares/serverlog.js';
import { validationCreateUser, validationLogin } from './middlewares/validation.js';

config();
const app = express() || express.Router;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//testing api
app.post('/signup',validationCreateUser, createUser)
app.post('/signin', validationLogin, login)

// error handler
app.use(errors());
app.use(serverLog);

// ----------------------------------- Настройки сервера и БД --------------------------------/
const initApp = async () => {
  try {
    await db.authenticate();
    Logger.log('info', "Connection has been established successfully.");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      Logger.log('info', `App listening on port ${process.env.PORT}!`);
    });
  } catch (error) {
    Logger.log('error',"Unable to connect to the database:", error.original);
  }
};

await initApp();
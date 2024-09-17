import createError from 'http-errors';
import { config } from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import process from 'node:process';
import { Logger } from './util/logger.js';
import { createUser } from './controllers/auth.js';
import db from './config/db.js';

config();
const app = express() || express.Router;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//testing api
app.post('/signup', createUser)
// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
// ----------------------------------- Настройки сервера и БД --------------------------------/
const initApp = async () => {
  // Test the connection.
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
initApp();
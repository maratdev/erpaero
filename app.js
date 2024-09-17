import createError from 'http-errors';
import { config } from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import process from 'node:process';
import { Logger } from './util/logger.js';

config();
const app = express() || express.Router;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//testing api
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the server!',
  })
})
// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
// ----------------------------------- Настройки сервера и БД --------------------------------/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  Logger.log('info', `App listening on port ${process.env.PORT}!`);
});
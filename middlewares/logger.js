import winston from 'winston';

import expressWinston from 'express-winston';
// создадим логгер запросов
export const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({ filename: './logs/request.log' }),
  ],
  format: winston.format.json(),
});

export const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({ filename: './logs/errors.log' }),
  ],
  format: winston.format.json(),
});

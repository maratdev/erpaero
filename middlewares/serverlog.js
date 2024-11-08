import { SERVER_ERROR } from './errors/statusCode.js';
import { SERVER } from './errors/error-texts.js';

export const serverLog = (err, req, res, next) => {
  const { statusCode = SERVER_ERROR, message } = err;
  res.status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === SERVER_ERROR
        ? SERVER.ERROR
        : message,
    });
  next();
};


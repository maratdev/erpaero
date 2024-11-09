import pino from 'pino';

export const Logger = pino({
  level: 'debug',
  timestamp: pino.stdTimeFunctions.isoTime
})
import { Sequelize } from 'sequelize';
import process from 'node:process';
import { config } from 'dotenv';
import { Logger } from '../util/logger.js';
config();

const db = new Sequelize({
  dialect: 'mysql',
  logging: process.env.MYSQL_LOG,
  host: process.env.MYSQL_HOST,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  port: process.env.MYSQL_PORT,
  timezone: 'UTC',
  define: {
    timestamps: true,
  }
})

db.authenticate()
  .then(() => {
  Logger.info('Connected to MySQL');
}).catch((err) => {
  Logger.error('Unable to connect to MySQL:', err);
})


export default db;
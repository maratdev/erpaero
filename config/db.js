import { Sequelize } from 'sequelize';
import process from 'node:process';
import { config } from 'dotenv';
config();

const db = new Sequelize({
  dialect: 'mysql',
  database: process.env.MYSQL_DB,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  logging: false,
  define: {
    timestamps: false,
  }
})
export default db;
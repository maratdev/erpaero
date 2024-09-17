import mysql from 'mysql2';
import process from 'node:process';
import { config } from 'dotenv';

config();
export const pool = mysql
	.createPool({
		host: process.env.MYSQL_HOST,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PASSWORD,
		database: process.env.MYSQL_DB,
		connectionLimit: 5,
	})
	.promise();
const [result] = await pool.query('SELECT * FROM user');

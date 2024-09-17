import { DataTypes } from 'sequelize';
import db from '../../config/db.js';

export const UserModel = db.define(
	'user',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
      unique: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
      unique: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	}
);
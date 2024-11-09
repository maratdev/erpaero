import { DataTypes, Model } from 'sequelize';
import db from '../../config/db.js';
import RefreshTokenModel from './RefreshTokenModel.js';
import FilesUserModel from './filesModel.js';

class UserModel extends Model {}

const model = UserModel.init(
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
			validate: {
				isEmail: {
					msg: 'Email is invalid',
				},
			},
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},

    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    two_factor_secret: {
      type: DataTypes.STRING,
    },
	},
	{
		sequelize: db,
		timestamps: true,
		tableName: 'users',
	},
);

model.hasMany(RefreshTokenModel, {
	as: 'RefreshTokens',
	foreignKey: 'user_id',
});
model.hasMany(FilesUserModel, {
  as: 'FilesUserModel',
  foreignKey: 'user_id',
});

export default model;
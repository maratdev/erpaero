import { DataTypes, Model } from 'sequelize';
import db from '../../config/db.js';

class RefreshTokenModel extends Model {}

const model = RefreshTokenModel.init(
	{
		user_id: {
			type: DataTypes.UUID,
		},
		hashedToken: {
			type: DataTypes.STRING,
		},
		ip: {
			type: DataTypes.STRING(39),
		},
		device: {
			type: DataTypes.STRING,
		},
    user_agent: {
			type: DataTypes.STRING,
		},
		location: {
			type: DataTypes.STRING,
		},
	},
	{
		sequelize: db,
		timestamps: true,
		tableName: 'refresh_token',
	},
);

export default model;

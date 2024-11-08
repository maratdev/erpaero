import { DataTypes, Model } from 'sequelize';
import db from '../../config/db.js';

class FilesUserModel extends Model {}

const model = FilesUserModel.init(
  {
    user_id: {
      type: DataTypes.UUID,
    },
    filename: {
      type: DataTypes.STRING,
    },
    src: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING(),
    },
    mimetype: {
      type: DataTypes.STRING,
    },
    size: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize: db,
    timestamps: true,
    tableName: 'files_user',
  },
);

export default model;

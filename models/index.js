import { Sequelize } from 'sequelize';
import { Model as sequelize } from 'sequelize/lib/model';
import db from '../config/db.js';

import users from './users/userModel.js';
import { Logger } from '../util/logger.js';

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.sequelize.sync({ force: false }).then(() => {
	Logger.info('Sequelize sequelize done');
});
db.users = users;

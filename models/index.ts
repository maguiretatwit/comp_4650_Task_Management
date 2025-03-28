import { Sequelize } from 'sequelize';
import { userModelInit } from './user';
import { taskModelInit } from './task';

/* create sequelize instance */
const sequelize = new Sequelize('task_management', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

/* initialize models */
userModelInit(sequelize);
taskModelInit(sequelize);

export { sequelize };
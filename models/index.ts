import { Sequelize } from 'sequelize';
import { User, userModelInit } from './user';
import { Task, taskModelInit } from './task';

/* create sequelize instance */
const sequelize = new Sequelize('task_management', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

/* initialize models */
userModelInit(sequelize);
taskModelInit(sequelize);

/* define assocations */
Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });

export { sequelize };
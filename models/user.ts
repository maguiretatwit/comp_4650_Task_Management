import { CreationOptional, DataTypes, HasMany, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin, HasManySetAssociationsMixin, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from 'sequelize';
import * as security from '../security';
import { Task } from './task';

class User extends Model<
    InferAttributes<User>,
    InferCreationAttributes<User>
> {
    declare id: CreationOptional<number>;
    declare username: string;
    declare email: string;
    declare password: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare tasks?: NonAttribute<Task[]>;
    declare getTasks: HasManyGetAssociationsMixin<Task>;
    declare addTask: HasManyAddAssociationMixin<Task, number>;
    declare addTasks: HasManyAddAssociationsMixin<Task, number>;
    declare setTasks: HasManySetAssociationsMixin<Task, number>;
    declare removeTask: HasManyRemoveAssociationMixin<Task, number>;
    declare removeTasks: HasManyRemoveAssociationsMixin<Task, number>;
    declare hasTask: HasManyHasAssociationMixin<Task, number>;
    declare hasTasks: HasManyHasAssociationsMixin<Task, number>;
    declare countTasks: HasManyCountAssociationsMixin;
    declare createTask: HasManyCreateAssociationMixin<Task, 'userId'>;
    declare static associations: {
        tasks: HasMany<Task>;
    }
}

function userModelInit(sequelize: Sequelize) {
    User.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: 'username',
                validate: {
                    notEmpty: true
                },
            },
            email: {
                type: DataTypes.STRING,
                unique: 'email',
                allowNull: false,
                validate: {
                    isEmail: true
                }
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                set(password: string) {
                    this.setDataValue('password', security.hash(password))
                }
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        },
        {
            tableName: 'users',
            sequelize
        }
    );
}

export { User, userModelInit };
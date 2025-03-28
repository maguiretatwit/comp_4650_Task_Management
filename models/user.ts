import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
import * as security from '../security';

class User extends Model<
    InferAttributes<User>,
    InferCreationAttributes<User>
> {
    declare id: CreationOptional<number>;
    declare username: string;
    declare email: string;
    declare password: string;
}

function userModelInit(sequelize: Sequelize) {
    User.init(
        {
            id: {
                type: DataTypes.INTEGER({ unsigned: true }),
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: DataTypes.STRING,
                unique: true
            },
            email: {
                type: DataTypes.STRING,
                unique: true,
                validate: {
                    isEmail: true
                }
            },
            password: {
                type: DataTypes.STRING,
                validate: {
                    notEmpty: true
                },
                set(password: string) {
                    this.setDataValue('password', security.hash(password))
                }
            }
        },
        {
            tableName: 'users',
            sequelize
        }
    );
}

export { User, userModelInit };
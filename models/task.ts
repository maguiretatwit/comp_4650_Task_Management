import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from 'sequelize';
import { User } from './user';

class Task extends Model<
    InferAttributes<Task>,
    InferCreationAttributes<Task>
> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: CreationOptional<string>;
    declare priority: CreationOptional<number>;
    declare isComplete: CreationOptional<boolean>;
    declare dueAt: CreationOptional<Date | string>;
    declare userId: number;
    declare user: NonAttribute<User>;
}


function taskModelInit(sequelize: Sequelize) {
    Task.init(
        {
            id: {
                type: DataTypes.INTEGER({ unsigned: true }),
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                validate: {
                    notEmpty: true
                }
            },
            description: {
                type: DataTypes.TEXT
            },
            priority: {
                type: DataTypes.TINYINT,
                defaultValue: 1,
                validate: {
                    min: 1,
                    max: 10
                }
            },
            isComplete: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            dueAt: {
                type: DataTypes.DATE,
                defaultValue() {
                    let date = new Date();
                    date.setDate(date.getDate() + 1);
                    date.setMinutes(0, 0, 0);
                    return date;
                },
                validate: {
                    isAfterCurrentDate(value: Date | string) {
                        if (new Date(value).getTime() < Date.now()) {
                            throw new Error('dueAt must be after the current time.');
                        }
                    }
                }
            },
            userId: {
                type: DataTypes.INTEGER({ unsigned: true }),
                references: {
                    model: User
                }
            }
        },
        {
            tableName: 'tasks',
            sequelize
        }
    );
    Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });
}

export { Task, taskModelInit };
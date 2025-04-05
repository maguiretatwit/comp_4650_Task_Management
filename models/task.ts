import { BelongsTo, BelongsToCreateAssociationMixin, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from 'sequelize';
import { User } from './user';

class Task extends Model<
    InferAttributes<Task>,
    InferCreationAttributes<Task>
> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: CreationOptional<string | null>;
    declare priority: CreationOptional<number>;
    declare isComplete: CreationOptional<boolean>;
    declare dueAt: CreationOptional<Date>;
    declare userId: ForeignKey<User['id']>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare user?: NonAttribute<User>;
    declare getUser: BelongsToGetAssociationMixin<User>;
    declare setUser: BelongsToSetAssociationMixin<User, number>;
    declare createUser: BelongsToCreateAssociationMixin<User>;
    declare static associations: {
        user: BelongsTo<User>;
    }
}


function taskModelInit(sequelize: Sequelize) {
    Task.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            description: {
                type: DataTypes.TEXT
            },
            priority: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    min: 1,
                    max: 10
                }
            },
            isComplete: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            dueAt: {
                type: DataTypes.DATE,
                allowNull: false,
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
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        },
        {
            tableName: 'tasks',
            sequelize
        }
    );
}

export { Task, taskModelInit };
import { NextFunction, Request } from "express";
import { InferAttributes } from "sequelize";
import { Task } from "../models/task";
import * as security from '../security';

interface CreateTaskOptions {
    name: string;
    description?: string;
    priority?: number;
    dueAt?: string;
}

async function getTasks(req: Request, res: security.ResponseWithSession<InferAttributes<Task>[]>, next: NextFunction) {
    const user = res.locals.session.user;
    try {
        const tasks = await Task.findAll({ where: { userId: user.id } });
        res.json(tasks.map(task => task.toJSON()));
    } catch (error) {
        next(error);
    }
}

async function createTask(req: Request<any, any, CreateTaskOptions>, res: security.ResponseWithSession, next: NextFunction) {
    const user = res.locals.session.user;
    if (req.body?.name) {
        try {
            const { name, description, priority, dueAt } = req.body;
            const task = await Task.create({ name, description, priority, dueAt, userId: user.id });
            res.status(201).json(task.toJSON());
        } catch (error) {
            next(error);
        }
    } else {
        res.status(400).send({ type: 'MISSING_PARAMETERS' });
    }
}

async function getTask(req: Request<{ taskId: string }>, res: security.ResponseWithSession, next: NextFunction) {
    const user = res.locals.session.user;
    const { taskId: id } = req.params;
    try {
        const task = await Task.findOne({ where: { id, userId: user.id } });
        if (task) {
            res.status(200).json(task.toJSON());
        } else {
            res.status(404).send();
        }
    } catch (error) {
        next(error);
    }
}

async function editTask(req: Request<{ taskId: string }, any, Partial<CreateTaskOptions>>, res: security.ResponseWithSession, next: NextFunction) {
    const user = res.locals.session.user;
    const { taskId: id } = req.params;
    if (req.body?.name || req.body?.description || req.body?.priority || req.body?.dueAt) {
        try {
            let task = await Task.findOne({ where: { id, userId: user.id } });
            if (task) {
                const { name, description, priority, dueAt } = req.body;
                await Task.update({ name, description, priority, dueAt }, { where: { id } });
                task = await Task.findByPk(id);
                res.json(task.toJSON());
            } else {
                res.status(404).send();
            }
        } catch (error) {
            next(error);
        }
    } else {
        res.status(400).send({ type: 'MISSING_PARAMETERS' });
    }
}

async function deleteTask(req: Request<{ taskId: string }>, res: security.ResponseWithSession, next: NextFunction) {
    const user = res.locals.session.user;
    const { taskId: id } = req.params;
    try {
        const task = await Task.findOne({ where: { id, userId: user.id } });
        if (task) {
            await Task.destroy({ where: { id } });
            res.status(204).send();
        } else {
            res.status(404).send();
        }
    } catch (error) {
        next(error);
    }
}

export { getTasks, createTask, getTask, editTask, deleteTask };
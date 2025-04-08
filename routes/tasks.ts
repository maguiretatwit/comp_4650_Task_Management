import { NextFunction, Request } from "express";
import { InferAttributes, InferCreationAttributes } from "sequelize";
import { Task } from "../models/task";
import * as security from '../security';

interface CreateTaskOptions {
    name: string;
    description?: string;
    priority?: number;
    isComplete?: boolean;
    dueAt?: string;
}

async function getTasks(req: Request, res: security.ResponseWithSession<InferAttributes<Task>[]>, next: NextFunction) {
    const user = res.locals.session.user;
    try {
        /* get tasks */
        const tasks = await user.getTasks();
        /* send 200 OK */
        res.status(200).json(tasks.map(task => task.toJSON()));
    } catch (error) {
        next(error);
    }
}

async function createTask(req: Request<any, any, CreateTaskOptions>, res: security.ResponseWithSession, next: NextFunction) {
    const user = res.locals.session.user;
    const { name, description, priority, isComplete, dueAt } = req.body;
    try {
        /* create task */
        const task = await user.createTask({ name, description, priority, isComplete, dueAt: new Date(dueAt) });
        /* send 200 OK */
        res.status(201).json(task.toJSON());
    } catch (error) {
        next(error);
    }
}

async function getTask(req: Request<{ taskId: string }>, res: security.ResponseWithSession<InferAttributes<Task>>, next: NextFunction) {
    const user = res.locals.session.user;
    const { taskId } = req.params;
    try {
        /* get task */
        const task = await Task.findOne({ where: { id: taskId, userId: user.id } });
        if (task) {
            /* send 200 OK */
            res.status(200).json(task.toJSON());
        } else {
            /* send 404 Not Found */
            res.status(404).send();
        }
    } catch (error) {
        next(error);
    }
}

async function updateTask(req: Request<{ taskId: string }, any, Partial<CreateTaskOptions>>, res: security.ResponseWithSession, next: NextFunction) {
    const user = res.locals.session.user;
    const { taskId } = req.params;
    const { name, description, priority, isComplete, dueAt } = req.body;
    try {
        /* find task */
        let task = await Task.findOne({ where: { id: taskId, userId: user.id } });
        if (task) {
            /* update task */
            task = await task.update({ name, description, priority, isComplete, dueAt: new Date(dueAt) });
            /* send 200 OK */
            res.status(200).json(task.toJSON());
        } else {
            /* send 404 Not Found */
            res.status(404).send();
        }
    } catch (error) {
        next(error);
    }
}

async function deleteTask(req: Request<{ taskId: string }>, res: security.ResponseWithSession, next: NextFunction) {
    const user = res.locals.session.user;
    const { taskId } = req.params;
    try {
        /* find task */
        const task = await Task.findOne({ where: { id: taskId, userId: user.id } });
        if (task) {
            /* delete task */
            task.destroy();
            /* send 204 No Content */
            res.status(204).send();
        } else {
            /* send 404 Not Found */
            res.status(404).send();
        }
    } catch (error) {
        next(error);
    }
}

export { getTasks, createTask, getTask, updateTask, deleteTask };
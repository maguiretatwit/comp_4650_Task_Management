import { NextFunction, Request } from "express";
import { InferAttributes, InferCreationAttributes, ValidationError } from "sequelize";
import { Task } from "../models/task";
import * as security from '../security';
import { ErrorType } from "./utils";

type CreateTaskOptions = {
    name: string;
    description?: string;
    priority?: number;
    isComplete?: boolean;
    dueAt?: string;
}

type UpdateTaskOptions = Partial<CreateTaskOptions>;

async function getTasks(_: Request, res: security.ResponseWithSession<InferAttributes<Task>[]>, next: NextFunction) {
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
    const { name, description, priority, isComplete, dueAt: dueAtString } = req.body;
    const dueAt = dueAtString ? new Date(dueAtString) : undefined;
    try {
        /* create task */
        const task = await user.createTask({ name, description, priority, isComplete, dueAt: dueAt });
        /* send 200 OK */
        res.status(201).json(task.toJSON());
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({ type: ErrorType.VALIDATION_ERROR, message: error.message });
        }
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

async function updateTask(req: Request<{ taskId: string }, any, UpdateTaskOptions>, res: security.ResponseWithSession, next: NextFunction) {
    const user = res.locals.session.user;
    const { taskId } = req.params;
    const { name, description, priority, isComplete, dueAt: dueAtString } = req.body;
    const dueAt = dueAtString ? new Date(dueAtString) : undefined;
    try {
        /* find task */
        let task = await Task.findOne({ where: { id: taskId, userId: user.id } });
        if (task) {
            /* update task */
            task = await task.update({ name, description, priority, isComplete, dueAt });
            /* send 200 OK */
            res.status(200).json(task.toJSON());
        } else {
            /* send 404 Not Found */
            res.status(404).send();
        }
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({ type: ErrorType.VALIDATION_ERROR, message: error.message });
        }
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
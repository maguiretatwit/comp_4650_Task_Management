import { NextFunction, Request, Response } from 'express';
import { User } from '../models/user';
import * as security from "../security";
import { Op } from 'sequelize';
import { ErrorType } from './utils';

interface CreateUserOptions {
    username: string;
    email: string;
    password: string;
}

async function createUser(req: Request<any, any, CreateUserOptions>, res: Response, next: NextFunction) {
    const { username, email, password } = req.body;
    try {
        /* find user */
        const existingUser = await User.findOne({ where: { [Op.or]: { username, email } } });
        if (!existingUser) {
            /* create user */
            const user = await User.create({ username, email, password });
            /* send 201 Created */
            res.status(201).json({ id: user.id, username: user.username, email: user.email });
        } else {
            /* get conflicting fields */
            const fields = [];
            if (existingUser.username === username) {
                fields.push('username');
            }
            if (existingUser.email === email) {
                fields.push('email');
            }
            /* send 400 Bad Request */
            res.status(400).send({ type: ErrorType.CONFLICT, fields });
        }
    } catch (error) {
        next(error);
    }
}

async function getUser(req: Request<{ userId: string }>, res: security.ResponseWithSession, next: NextFunction) {
    const user = res.locals.session.user;
    const { userId } = req.params;
    if (userId === user.id.toString() || userId === "@me") {
        /* send 200 OK */
        res.status(200).json({ id: user.id, username: user.username, email: user.email });
    } else {
        /* send 404 Not Found */
        res.status(404).send();
    }
}

async function editUser(req: Request<{ userId: string }, any, Partial<Omit<CreateUserOptions, 'password'>>>, res: security.ResponseWithSession, next: NextFunction) {
    let user = res.locals.session.user;
    const { userId } = req.params;
    if (userId === user.id.toString() || userId === "@me") {
        const { username, email } = req.body;
        try {
            /* update user */
            user = await user.update({ username, email });
            /* update session */
            res.locals.session.user = user;
            /* send 200 OK */
            res.status(200).json({ id: user.id, username: user.username, email: user.email });
        } catch (error) {
            next(error);
        }
    } else {
        /* send 404 Not Found */
        res.status(404).send();
    }
}

async function deleteUser(req: Request<{ taskId: string }>, res: security.ResponseWithSession, next: NextFunction) {
    const user = res.locals.session.user;
    const { taskId: id } = req.params;
    if (id === user.id.toString() || id === "@me") {
        try {
            /* delete user */
            await user.destroy();
            /* send 204 No Content */
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    } else {
        /* send 404 Not Found */
        res.status(404).send();
    }
}

export { createUser, getUser, editUser, deleteUser };
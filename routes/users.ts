import { NextFunction, Request, Response } from 'express';
import { User } from '../models/user';
import * as security from "../security";
import { Op } from 'sequelize';

interface CreateUserOptions {
    username: string;
    email: string;
    password: string;
}

async function createUser(req: Request<any, any, CreateUserOptions>, res: Response, next: NextFunction) {
    if (req.body?.username && req.body?.email && req.body?.password) {
        const { username, email, password } = req.body;
        try {
            const existingUser = await User.findOne({ where: { [Op.or]: { username, email } } });
            if (!existingUser) {
                const user = await User.create({ username, email, password });
                res.status(201).json({ id: user.id, username: user.username, email: user.email });
            } else {
                const fields = [];
                if (existingUser.username === username) {
                    fields.push('username');
                }
                if (existingUser.email === email) {
                    fields.push('email');
                }
                res.status(400).send({ type: 'CONFLICT', fields });
            }
        } catch (error) {
            next(error);
        }
    } else {
        res.status(400).send({ type: 'MISSING_PARAMETERS' });
    }
}

async function getUser(req: Request<{ userId: string }>, res: security.ResponseWithSession, next: NextFunction) {
    const user = res.locals.session.user;
    const { userId: id } = req.params;
    if (id === user.id.toString() || id === "@me") {
        res.json({ id: user.id, username: user.username, email: user.email });
    } else {
        res.status(404).send();
    }
}

async function editUser(req: Request<{ userId: string }, any, Partial<CreateUserOptions>>, res: security.ResponseWithSession, next: NextFunction) {
    let user = res.locals.session.user;
    const { userId: id } = req.params;
    if (req.body?.username || req.body?.email || req.body?.password) {
        if (id === user.id.toString() || id === "@me") {
            try {
                const { username, email, password } = req.body;
                await User.update({ username, email, password }, { where: { id } });
                user = await User.findByPk(id);
                res.json({ id: user.id, username: user.username, email: user.email });
            } catch (error) {
                next(error);
            }
        } else {
            res.status(404).send();
        }
    }
}

async function deleteUser(req: Request<{ taskId: string }>, res: security.ResponseWithSession, next: NextFunction) {
    const user = res.locals.session.user;
    const { taskId: id } = req.params;
    if (id === user.id.toString() || id === "@me") {
        try {
            await User.destroy({ where: { id } });
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    } else {
        res.status(404).send();
    }
}

export { createUser, getUser, editUser, deleteUser };
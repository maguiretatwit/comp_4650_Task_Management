import { NextFunction, Request, Response } from 'express';
import { User } from '../models/user';
import * as security from '../security';

interface LoginOptions {
    username: string;
    password: string;
}

async function login(req: Request<any, any, LoginOptions>, res: Response, next: NextFunction) {
    if (req.body?.username && req.body?.password) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ where: { username, password: security.hash(password) } });
            if (user) {
                security.authorize(user, res, next);
            } else {
                res.status(401).send();
            }
        } catch (error) {
            next(error);
        }
    } else {
        res.status(400).send({ type: 'MISSING_PARAMETERS' });
    }
}

export { login };
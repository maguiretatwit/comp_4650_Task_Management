import { NextFunction, Request, Response } from 'express';
import { User } from '../models/user';
import * as security from '../security';

interface LoginOptions {
    username: string;
    password: string;
}

async function login(req: Request<any, any, LoginOptions>, res: Response, next: NextFunction) {
    const { username, password } = req.body;
    try {
        /* find user */
        const user = await User.findOne({ where: { username, password: security.hash(password) } });
        if (user) {
            /* authorize user */
            security.authorize(user, res, next);
        } else {
            /* send 401 Unauthorized */
            res.status(401).send();
        }
    } catch (error) {
        next(error);
    }
}

export { login };
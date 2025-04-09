import { NextFunction, Request, Response } from "express";
import * as security from "../security";
import { createTransport } from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import { ValidationError } from "sequelize";
import { ErrorType } from "./utils";
import { User } from "../models/user";

interface Detail {
    email: string;
    expires: number;
}

interface Tokens {
    tokenMap: Record<string, Detail>;
    emailMap: Record<string, string>;
    create(email: string): string;
    put(token: string, email: string, expires: number): void;
    get(token: string): Detail | undefined;
    delete(token: string): void;
    tokenOf(email: string): string | undefined;
    from(req: Request): Detail | undefined;
}

const tokens: Tokens = {
    tokenMap: {},
    emailMap: {},
    create(email: string) {
        const existingToken = this.tokenOf(email);
        if (existingToken) {
            this.delete(existingToken);
        }
        /* generate token */
        const token = security.generateToken();
        /* expires in 15 minutes */
        const expires = new Date();
        expires.setHours(expires.getMinutes() + 15);
        this.put(token, email, expires.getTime());
        return token;
    },
    put(token: string, email: string, expires: number) {
        this.tokenMap[token] = { email, expires };
        this.emailMap[email] = token;
    },
    get(token: string) {
        const detail = this.tokenMap[token];
        /* delete token if expired */
        if (detail && Date.now() > detail.expires) {
            this.delete(token);
        }
        return this.tokenMap[token];
    },
    delete(token: string) {
        const detail = this.tokenMap[token];
        if (detail) {
            delete this.tokenMap[token];
            delete this.emailMap[detail.email];
        }
    },
    tokenOf(email: string) {
        return this.emailMap[email];
    },
    from(req: Request) {
        const token = req.query['token'] as string;
        return this.get(token);
    }
};

async function forgotPassword(req: Request<any, any, { email: string }>, res: Response, next: NextFunction) {
    const { email } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (user) {
            /* check if email as password are set */
            if (process.env.EMAIL && process.env.PASSWORD) {
                const { EMAIL: sourceEmail, PASSWORD: password } = process.env;
                /* create transporter */
                const transporter = createTransport({
                    service: 'gmail',
                    auth: {
                        user: sourceEmail,
                        pass: password
                    }
                });
                /* create token */
                const token = tokens.create(email);
                /* set mail options */
                const options: MailOptions = {
                    from: sourceEmail,
                    to: email,
                    subject: 'Reset Your Password',
                    /* hardcoded to https://localhost:3000 */
                    html: `Click <a href="https://localhost:3000/reset-password?token=${token}">here</a> to reset your password.<br>This link will expire in 15 minutes.`
                };
                try {
                    /* send mail */
                    const info = await transporter.sendMail(options);
                    if (info.accepted) {
                        /* send 201 Created */
                        res.status(201).send();
                    } else {
                        /* send 500 Internal Server Error */
                        res.status(500).send();
                    }
                } catch (error) {
                    next(error)
                }
            } else {
                /* send 500 Internal Server Error */
                res.status(500).send();
            }
        } else {
            /* send 404 Not Found */
            res.status(404).send();
        }
    } catch (error) {
        next(error);
    }
}

async function resetPassword(req: Request<any, any, { token: string; password: string }>, res: Response, next: NextFunction) {
    const { token, password } = req.body;
    const detail = tokens.get(token);
    if (detail) {
        const email = detail.email;
        try {
            let user = await User.findOne({ where: { email } });
            if (user) {
                if (security.hash(password) !== user.password) {
                    user = await user.update({ password });
                    /* delete token */
                    tokens.delete(token);
                    /* invalidate existing session */
                    const sessionToken = security.sessions.tokenOf(user);
                    if (sessionToken) {
                        security.sessions.delete(sessionToken);
                    }
                    /* send 302 Found */
                    res.status(302).location('/login').send();
                } else {
                    res.status(400).json({ type: ErrorType.CONFLICT, fields: { password: "New password cannot be the same as the current password." } });
                }
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
    } else {
        /* send 401 Unauthorized */
        res.status(401).send();
    }
}

async function resetPasswordForm(req: Request<any, any, any, { token: string }>, res: Response, next: NextFunction) {
    const detail = tokens.from(req);
    if (detail) {
        /* send 200 OK */
        res.status(200).sendFile('resetPassword.html', { root: './frontend' });
    } else {
        /* send 401 Unauthorized */
        res.status(401).send();
    }
}

export { forgotPassword, resetPassword, resetPasswordForm };
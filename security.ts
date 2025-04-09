import { createHash, randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { User } from './models/user';

type ResponseWithSession<ResBody = any> = Response<ResBody, { session: Session }>;

// NOTE: this implementation is not very secure. Tokens never expire and work accross different ips which they probably shouldn't.
// This should work fine for our purposes though, since this will likely not be hosted anywhere so security isn't an issue.
interface Session {
  user: User;
}

interface Sessions {
  tokenMap: Record<string, Session>;
  idMap: Record<string, string>;
  put(token: string, user: Session): void;
  get(token: string): Session | undefined;
  delete(token: string): void;
  tokenOf(user: User): string | undefined;
  from(req: Request): Session | undefined;
}

const sessions: Sessions = {
  tokenMap: {},
  idMap: {},
  put(token: string, session: Session) {
    this.tokenMap[token] = session;
    this.idMap[session.user.id] = token;
  },
  get(token: string) {
    return this.tokenMap[token];
  },
  delete(token: string) {
    const session = this.tokenMap[token];
    if (session) {
      delete this.tokenMap[token];
      delete this.idMap[session.user.id];
    }
  },
  tokenOf(user: User) {
    return this.idMap[user.id];
  },
  from(req: Request) {
    const token = req.cookies?.['TOKEN'];
    return this.get(token);
  }
};

async function authorize(user: User, res: Response, next: NextFunction) {
  // check for existing session
  let token = sessions.tokenOf(user);
  if (!token) {
    // create new session
    token = generateToken();
    sessions.put(token, { user: user });
  }
  // set cookie
  res.cookie('TOKEN', token);
  res.locals.session = sessions.get(token);
  next();
}

function unauthorize(req: Request, res: Response, next: NextFunction) {
  // check for existing session
  const session = sessions.from(req);
  if (session) {
    // delete existing session
    sessions.delete(sessions.tokenOf(session.user) as string);
  }
  // clear cookie
  res.clearCookie('TOKEN');
  next();
}

function isAuthorized(req: Request, res: Response, next: NextFunction) {
  // check for valid session
  const session = sessions.from(req);
  if (session) {
    res.locals.session = session;
    next();
  } else {
    // no valid session
    res.status(401).send();
  }
}

function denyAll(_: Request, res: Response) {
  res.status(401).send();
}

function hash(data: string) {
  return createHash('sha256').update(data).digest('hex');
}

function generateToken() {
  return randomUUID();
}

export {
  ResponseWithSession,
  Sessions,
  Session,
  sessions,
  authorize,
  unauthorize,
  isAuthorized,
  denyAll,
  hash,
  generateToken
};
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import { existsSync, readFileSync } from 'fs';
import http from 'http';
import https from 'https';
import { sequelize } from './models';
import { login } from './routes/login';
import { createTask, deleteTask, updateTask, getTask, getTasks } from './routes/tasks';
import { createUser, deleteUser, editUser, getUser } from './routes/users';
import * as security from './security';
import { hasProperties } from './routes/utils';

/* create express app */
const root = './frontend';
const port = 3000;
const app = express();

/* configure express */
app.disable('x-powered-by');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('frontend/public'));

/* endpoints */
app.get('/', (req, res) => {
    const session = security.sessions.from(req);
    if (session) {
        res.sendFile('home.html', { root });
    } else {
        res.location('login').status(302).send();
    }
});
app.get('/calendar', (req, res) => {
    const session = security.sessions.from(req);
    if (session) {
        res.sendFile('calendar.html', { root });
    } else {
        res.location('login').status(302).send();
    }
});
app.get('/login', (_, res) => {
    res.sendFile('login.html', { root });
});
app.get('/register', (_, res) => {
    res.sendFile('register.html', { root });
});
/* login/logout endpoints */
app.post('/api/login', hasProperties({ allOf: ['username', 'password'] }));
app.post('/api/login', login);
app.post('/api/login', (_, res) => {
    res.status(204).send();
});
app.post('/api/logout', security.unauthorize);
app.post('/api/logout', (_, res) => {
    res.status(204).send();
});
/* user endpoints */
app.route('/api/users')
    .get(security.denyAll)
    .post(hasProperties({ allOf: ['username', 'email', 'password'] }))
    .post(createUser);
app.use('/api/*', security.isAuthorized);
app.route('/api/users/:userId')
    .get(getUser)
    .patch(hasProperties({ anyOf: ['username', 'email', 'password'] }))
    .patch(editUser)
    .delete(deleteUser);
/* task endpoints */
app.route('/api/tasks')
    .get(getTasks)
    .post(hasProperties({ allOf: ['name'] }))
    .post(createTask);
app.route('/api/tasks/:taskId')
    .get(getTask)
    .patch(hasProperties({ anyOf: ['name', 'description', 'priority', 'isComplete', 'dueAt'] }))
    .patch(updateTask)
    .delete(deleteTask);

/* create server */
let server: http.Server;
if (existsSync('./security/cert.key') && existsSync('./security/cert.pem')) {
    /* use https */
    const key = readFileSync('./security/cert.key');
    const cert = readFileSync('./security/cert.pem');
    server = https.createServer({ key, cert }, app);
} else {
    /* use http */
    server = http.createServer(app);
}

async function init() {
    /* sync database */
    await sequelize.sync({ alter: true });

    /* listen */
    server.listen(port, () => {
        console.log('Listening on port ' + port);
    });
}
init();
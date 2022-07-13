import express, { json, request, urlencoded } from 'express';
import logger from 'morgan';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import httpProxy from 'express-http-proxy';
import 'dotenv/config';

const port = 10000;

function verifyJWT(req, res) {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
        req.userId = decoded.id;
    });
}

const start = () => {
    const app = express();

    app.use(cors());
    app.use(logger('dev'));

    app.use((req, res, next) => {
        const host = req.path;
        let proxy;
        if (host.startsWith('/api/v1/auth')) {
            proxy = httpProxy('http://localhost:4000/');
        }
        else {
            //verifyJWT(req, res);    // verificando autenticaçao
            if (host.startsWith('/api/v1/images')) {
                proxy = httpProxy('http://localhost:4001/', {
                    limit: '1000mb'
                });
            }
            // colocar aqui outros modulos
        }
        proxy(req, res, next);
    });

    app.use(urlencoded({ extended: true, }));
    app.use(json());

    try {
        app.listen(port, () => {
            console.log(`API Gateway running on http://localhost:${port}`);
        })
    } catch (error) {
        console.log(`Error occurred: ${error.message}`);
    }
}

start();
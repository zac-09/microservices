import express from 'express';
import "express-async-errors";
import { json } from 'body-parser'

import { errorHandler, NotFoundError } from '@exposium/common';
import cookieSession from 'cookie-session'
import { currentUser } from '@exposium/common';
import { deleteOrderRouter } from './routes/delete';
import { showOrderRouter } from './routes/show';
import { indexOrderRouter } from './routes';
import { newOrderRouter } from './routes/new';

const app = express();
app.set('trust proxy', true)
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test'
    })
)
app.use(currentUser);
app.use(deleteOrderRouter)
app.use(showOrderRouter)
app.use(indexOrderRouter)
app.use(newOrderRouter)
app.all('*', async (req, res,) => {
    throw new NotFoundError()
});
app.use(errorHandler);

export { app };
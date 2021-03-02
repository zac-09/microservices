import express from 'express';
import "express-async-errors";
import { json } from 'body-parser'
import { createTicketRouter } from './routes/new'
import { errorHandler, NotFoundError } from '@exposium/common';
import cookieSession from 'cookie-session'
import { currentUser } from '@exposium/common';
import { showTickerRouter } from './routes/show';
import { indeTicketRouter } from './routes';
import { updateTicketRouter } from './routes/update';
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
app.use(createTicketRouter)
app.use(showTickerRouter)
app.use(indeTicketRouter)
app.use(updateTicketRouter)
app.all('*', async (req, res,) => {
    throw new NotFoundError()
});
app.use(errorHandler);

export { app };
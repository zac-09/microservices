import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@exposium/common'
import express, { Response, Request } from 'express'

import { body } from 'express-validator'
import { TicketUpdatedPublisher } from '../events/publisher/ticket-updated-publisher'
import { Ticket } from '../models/ticket'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()
router.put('/api/tickets/:id', requireAuth,
    [
        body('title')
            .not()
            .isEmpty()
            .withMessage("Title is requred"),
        body('price')
            .isFloat({ gt: 0 })
            .withMessage("price must be provided and be greater than zero")
    ],
    validateRequest
    , async (req: Request, res: Response) => {
        const ticket = await Ticket.findById(req.params.id)
        if (!ticket) throw new NotFoundError();

        if (ticket.orderId) throw new BadRequestError("Cannot edit a reserved ticket");

        if (ticket.userId !== req.currentUser!.id) throw new NotAuthorizedError();

        ticket.set({
            title: req.body.title,
            price: req.body.price,

        });
        await ticket.save();
        new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        })
        res.send(ticket)

    })


export { router as updateTicketRouter }
import express, { Request, Response } from 'express'
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from "@exposium/common"
import { body } from 'express-validator'
import mongoose from 'mongoose'
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post('/api/orders', requireAuth,
    [
        body('ticketId')
            .not()
            .isEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage("TicketId must be provided")

    ],
    validateRequest,

    async (req: Request, res: Response) => {
        const { ticketId } = req.body;
        const ticket = await Ticket.findById(ticketId)

        if (!ticket) {
            throw new NotFoundError();
        }
        //find the ticket user is trying to order in the database

        // make sure the ticket is not reserved && run query to look at all orders find  an order where the ticket is the ticket we've just fetched 
        // and order status is not cancelled if we find an order from that means the ticket is reserved
        const isReserved = await ticket.isReserved()

        if (isReserved) {
            throw new BadRequestError("Ticket is already reserved")
        }

        // calculate an expiration date for the order
        const expiration = new Date()
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)



        // Build the order and save it to the database

        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Cancelled,
            expiresAt: expiration,
            ticket
        })
        await order.save()

        // Publish  order created event
        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            ticket: {
                id: ticket.id,
                price: ticket.price
            },
            version: ticket.version
        })

        res.status(201).send(order)
    })

export { router as newOrderRouter }
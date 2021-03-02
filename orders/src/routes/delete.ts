import { requireAuth, NotFoundError, NotAuthorizedError, OrderStatus } from '@exposium/common';
import express, { Request, Response } from 'express'
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';
import { Order } from './../models/order'
const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket')
    if (!order) {
        throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError()
    }
    order.status = OrderStatus.Cancelled
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        ticket: {
            id: order.ticket.id
        },
        version: order.ticket.version
    })
    

    res.status(204).send(order)
})

export { router as deleteOrderRouter }
import request from 'supertest';
import { app } from '../../app'
import mongoose from 'mongoose'
import { Order, OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'

it('it marks an order as cancelled', async () => {
    const ticket = Ticket.build({
        title: "concert",
        price: 20,
        id: mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save()

    const user = global.signin()
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201)

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
    expect(204);
    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder.status).toEqual(OrderStatus.Cancelled)

});
it('emits order camcelled event', async () => {
    const ticket = Ticket.build({
        title: "concert",
        price: 20,
        id: mongoose.Types.ObjectId().toHexString()

    });
    await ticket.save()

    const user = global.signin()
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201)

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
    expect(204);
    expect(natsWrapper.client.publish).toHaveBeenCalled()
})
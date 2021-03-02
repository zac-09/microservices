import request from 'supertest';
import { app } from '../../app'
import mongoose from 'mongoose'
import { Order, OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'

it('returns an error if the ticket does not exist', async () => {
    const ticketId = mongoose.Types.ObjectId();
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId })
        .expect(404);


})
it('returns an error if the ticket is already reservec', async () => {

    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: mongoose.Types.ObjectId().toHexString()

    })
    await ticket.save();
    const order = Order.build({
        ticket,
        userId: "fdfdfdfd",
        status: OrderStatus.Created,
        expiresAt: new Date()
    });
    await order.save()

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId: ticket.id })
        .expect(400);




})
it('reserves tickets', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: mongoose.Types.ObjectId().toHexString()

    })
    await ticket.save();
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId: ticket.id })
        .expect(201)
})

it('emits an order created', async ()=>{
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: mongoose.Types.ObjectId().toHexString()

    })
    await ticket.save();
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId: ticket.id })
        .expect(201)

        expect(natsWrapper.client.publish).toHaveBeenCalled()
})
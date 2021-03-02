import request from 'supertest';
import { app } from '../../app'
import mongoose from 'mongoose'
import { Order, OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'

const buildTicket = async () => {
    const ticket = await Ticket.build({
        title: 'concert',
        price: 40,
        id: mongoose.Types.ObjectId().toHexString()

    });
    await ticket.save()
    return ticket
}

it('fetches orders for a particulat user', async () => {
    // Create three ticketes
    const ticketOne = await buildTicket()
    const ticketTwo = await buildTicket()

    const ticketThree = await buildTicket()
    const userOne = global.signin()
    const userTwo = global.signin()



    //create one order as user 1
    await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticketOne.id })
        .expect(201);
    // create two oders as User #2
    const { body: orderOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketTwo.id })
        .expect(201);
    const { body: orderTwo } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketThree.id })
        .expect(201)

    //Make request to get orders for user 2
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .expect(200);

    expect(response.body.length).toEqual(2)
    expect(response.body[0].id).toEqual(orderOne.id)
    expect(response.body[1].id).toEqual(orderTwo.id)
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id)
    expect(response.body[1].ticket.id).toEqual(ticketThree.id)





    //make sure we only got the orders for user 2
})
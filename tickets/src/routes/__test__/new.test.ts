import request from 'supertest';
import { app } from './../../app';
import { Ticket } from './../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'


it('has a route handler listenting to /api/tickets for post requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({})

    expect(response.status).not.toEqual(404)
})
it('can only be accessed if user is signed in', async () => {
    await request(app)
        .post('/api/tickets')
        .send({}).
        expect(401)
})
it('returns status other than 401 if user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())

        .send({})
    expect(response.status).not.toEqual(401)
})
it('provides error if invalid titel is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: '',
            price: 10
        })
        .expect(400)
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({

            price: 10
        })
        .expect(400)
})
it('returns an error if an invalid price is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'kawa',
            price: -12
        })
        .expect(400)
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'kawa',

        })
        .expect(400)

})
it('creates tickets with valid inputs', async () => {
    //add in a checkt o make sure ticket was saved
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0)
    const title = 'zac test';
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title,
            price: 20
        })
        .expect(201);
    tickets = await Ticket.find({})
    expect(tickets.length).toEqual(1)
    expect(tickets[0].price).toEqual(20)
    expect(tickets[0].title).toEqual(title)


})
it('publishes an event', async () => {
    const title = 'zac test';
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title,
            price: 20
        })
        .expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
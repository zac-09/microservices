import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper'
import { Ticket } from '../../models/ticket';


it("returns 404 if the provided id does not exist", async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set("Cookie", global.signin())
        .send({
            title: "dsds",
            price: 30
        })
        .expect(404);
})
it("returns a 401 if user is not authenticated", async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: "dsds",
            price: 30
        })
        .expect(401);
})
it("it returns 401 if user does not own ticket", async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set("Cookie", global.signin())
        .send({
            title: "dsd",
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'sds',
            price: 522
        }).expect(401);
})
it("returns 400 if user provides invalid price or title", async () => {
    const cookie = global.signin()
    const response = await request(app)
        .post('/api/tickets')
        .set("Cookie", cookie)
        .send({
            title: "dsd",
            price: 20
        });
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({
            title: "",
            price: 20
        }).expect(400)
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({
            title: "dfdf",
            price: -55
        }).expect(400)





})
it("updates ticket provided valid inputs", async () => {
    const cookie = global.signin()
    const response = await request(app)
        .post('/api/tickets')
        .set("Cookie", cookie)
        .send({
            title: "dsd",
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "new",
            price: 209
        }).expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
    expect(ticketResponse.body.title).toEqual("new")
    expect(ticketResponse.body.price).toEqual(209)

})

it('publishes an event', async () => {
    const cookie = global.signin()
    const response = await request(app)
        .post('/api/tickets')
        .set("Cookie", cookie)
        .send({
            title: "dsd",
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "new",
            price: 209
        }).expect(200);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})

it('rejects updates if cookie is reserved', async () => {
    const cookie = global.signin()
    const response = await request(app)
        .post('/api/tickets')
        .set("Cookie", cookie)
        .send({
            title: "dsd",
            price: 20
        });
    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() })
    await ticket.save()
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "new",
            price: 209
        }).expect(400);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})



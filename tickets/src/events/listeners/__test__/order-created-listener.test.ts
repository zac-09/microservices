import { OrderCreatedEvent, OrderStatus } from '@exposium/common'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedListen } from '../order-created-listener'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
const setup = async () => {
    const listener = new OrderCreatedListen(natsWrapper.client)

    const ticket = Ticket.build({
        title: "awesome",
        price: 99,
        userId: 'niffa',
    })
    await ticket.save()
    console.log(ticket)
    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: "dfdf",
        version: 0,
        expiresAt: "dfdfgd",
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()

    }
    return { listener, ticket, data, msg }

}

it('sets the userId  of the ticket', async () => {

    const { listener, ticket, data, msg } = await setup()

    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.orderId).toEqual(data.id)

})

it('acks the message', async () => {
    const { listener, ticket, data, msg } = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async () => {
    const { listener, ticket, data, msg } = await setup()

    await listener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
   const ticketUpdatedData= JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
   expect(data.id).toEqual(ticketUpdatedData.orderId)
})
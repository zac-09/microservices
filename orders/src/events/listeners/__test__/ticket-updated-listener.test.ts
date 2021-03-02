import { TickcketUpdatedEvent } from "@exposium/common"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../../models/ticket"
import { natsWrapper } from "../../../nats-wrapper"
import { TicketUpdatedListener } from "../ticket-updated-listener"

const setup = async () => {
    const listener = new TicketUpdatedListener((natsWrapper.client))
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    })
    await ticket.save()

    const data: TickcketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: "movies",
        price: 14,
        userId: "dsfdf"
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { msg, data, listener, ticket }

}

it('finds, updates and saves a ticket', async () => {

    const { msg, data, ticket, listener } = await setup();
    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket.title).toEqual(data.title)
    expect(updatedTicket.price).toEqual(data.price)
    expect(updatedTicket.version).toEqual(data.version)


});

it('acks the message', async () => {
    const { msg, data, listener } = await setup();
    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
});

it('does not call ack if the event has a skipped version number', async () => {
    const { msg, data, listener, ticket } = await setup()
    data.version = 10;

    try {
        await listener.onMessage(data, msg)
    } catch (err) {
        return
    }
    expect(msg.ack).not.toHaveBeenCalled()
});
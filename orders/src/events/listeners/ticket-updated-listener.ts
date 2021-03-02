import { Listener, Subjects, TickcketUpdatedEvent } from '@exposium/common';
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/ticket';
import { queuwGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TickcketUpdatedEvent>{
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated
    queueGroupName = queuwGroupName
    async onMessage(data: TickcketUpdatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findByEvent(data)

        if (!ticket) {
            throw new Error('Ticket not found')
        }
        const { title, price } = data;
        ticket.set({ title, price })
        await ticket.save()
        msg.ack()

    }
}
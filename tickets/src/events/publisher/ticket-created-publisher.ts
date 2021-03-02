import { Publisher, Subjects, TicketCreatedEvent } from "@exposium/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
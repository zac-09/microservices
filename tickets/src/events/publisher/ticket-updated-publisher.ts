import { Publisher, Subjects, TickcketUpdatedEvent } from "@exposium/common";

export class TicketUpdatedPublisher extends Publisher<TickcketUpdatedEvent>{
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
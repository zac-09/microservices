import { OrderCancelledEvent, Publisher, Subjects } from "@exposium/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled

}
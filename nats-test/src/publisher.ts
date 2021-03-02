import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto'
import { TicketCreatedPublisher } from './events/ticket-created-publisher'
console.clear();
const stan = nats.connect('tickecting', 'abc', {
    url: 'http://localhost:4222'
});

stan.on("connect", async () => {
    console.log("Publisher connected to NATS");
    // const data = JSON.stringify({
    //     id: '324',     
    //     title: "concet",
    //     price: 400
    // });

    // stan.publish('ticket:created', data, () => {
    //     console.log("event published")
    // })         
    const publisher = new TicketCreatedPublisher(stan)
    await publisher.publish({
        id: '324',
        title: "concert",
        price: 400
    })

})  
import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from './subjects'
interface Event {
    subject: Subjects;
    data: any;
}

export abstract class Listener<T extends Event> {
    abstract subject: T['subject'];
    abstract queueGroupName: string;
    abstract onMessage(data: T['data'], msg: Message): void;
    protected ackWait = 5 * 1000;
    private client: Stan;

    constructor(client: Stan) {

        this.client = client
    }

    subsriptionOptions() {
        return this.client
            .subscriptionOptions()
            .setDeliverAllAvailable()
            .setManualAckMode(true)
            .setAckWait(this.ackWait)
            .setDurableName(this.queueGroupName)

    }
    listen() {
        const subscription = this.client.subscribe(
            this.subject,
            this.queueGroupName,
            this.subsriptionOptions()
        );
        subscription.on('message', (msg: Message) => {
            console.log(
                `Message received: ${this.subject}/ ${this.queueGroupName}`
            )

            this.onMessage(this.pasrseMessage(msg), msg)

        })
    }
    pasrseMessage(msg: Message) {
        const data = msg.getData()
        // console.log("from parse", data)
        return typeof data === 'string'
            ? JSON.parse(data)
            : JSON.parse(data.toString('utf8'))
    }
}
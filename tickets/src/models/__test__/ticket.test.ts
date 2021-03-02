import { Ticket } from '../ticket'

it('implements optmistic concurrancy control', async (done) => {

    const ticket = Ticket.build({
        price: 45,
        title: "zac is",
        userId: "212"
    })

    await ticket.save();

    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id)

    firstInstance!.set({ price: 10 })
    secondInstance!.set({ price: 15 })
    await firstInstance!.save()
    try {
        await secondInstance!.save()

    } catch (err) {
        return done()

    }
    throw new Error('should not reach this point')

})

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        price: 45,
        title: "zac is",
        userId: "212"
    })
    await ticket.save();
    expect(ticket.version).toEqual(0)
    await ticket.save()
    expect(ticket.version).toEqual(1)
    await ticket.save()
    expect(ticket.version).toEqual(2)

})
import request from 'supertest'

import { app } from './../../app'

// it('resturns a 200 on successfull signin', async () => {
//     return request(app)
//         .post('/api/users/signin')
//         .send({
//             email: "test@test.com",
//             password: 'password'
//         })
//         .expect(200);
// });
it('returns a 400 with an invalid email', async () => {
    return request(app)
        .post('/api/users/signin')
        .send({
            email: "@test.com",
            password: 'password'
        })
        .expect(400);
});



it('returns a 400 with missing email and password', async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: "eamaul@test.com",
            password: ""
        })
        .expect(400);
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "",
            password: "zac@fds"
        })
        .expect(400);
});


it("sets a cookies after signin", async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "passowrd"
        }).expect(201)

    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: "test@test.com",
            password: "passowrd"
        }).expect(200)

    expect(response.get('Set-Cookie')).toBeDefined()
})
it("fails when email that doesnt exist is supplied", async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(400);

})

it("fails when an incorrect password is supplied", async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "passowrd"
        }).expect(201)

    await request(app)
        .post('/api/users/signin')
        .send({
            email: "test@test.com",
            password: "dsfsfd"
        }).expect(400)
})
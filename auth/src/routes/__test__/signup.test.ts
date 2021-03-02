import request from 'supertest';
import { app } from '../../app'

it('resturns a 201 on successfull signup', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: 'password'
        })
        .expect(201);
});
it('returns a 400 with an invalid email', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: "@test.com",
            password: 'password'
        })
        .expect(400);
});

it('returns a 400 with an invalid password', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: 'sa'
        })
        .expect(400);
});

it('returns a 400 with missing email and password', async () => {
    await request(app)
        .post('/api/users/signup')
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

it("disallows duplicate emails", async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(201);
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(400);
});
it("sets a cookies after signup", async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(201);
    expect(response.get('Set-Cookie')).toBeDefined();
})
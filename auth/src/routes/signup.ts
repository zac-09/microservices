import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { BadRequestError, validateRequest } from '@exposium/common'
import { User } from './../models/users';

import jwt from 'jsonwebtoken'
const router = express.Router();

router.post('/api/users/signup', [
    body('email')
        .isEmail().
        withMessage("please provide valid email"),
    body('password')
        .trim().
        isLength({ min: 4, max: 20 })
        .withMessage('Password must be between 4 and 20 characters')
],
    validateRequest
    ,
    async (req: Request, res: Response) => {

        const { email, password } = req.body
        const existingUser = await User.findOne({ email })
        console.log(email, password)
        // res.send({})
        console.log(existingUser)
        if (existingUser) {
            throw new BadRequestError('Email is in use')
        }
        const user = User.build({ email, password })
        await user.save();

        //generate jwt 

        const userJwt = jwt.sign({
            id: user.id,
            email: user.email
        }, process.env.JWT_KEY!)

        req.session = {
            jwt: userJwt
        }
        res.status(201).send(user);

    })

export { router as signupRouter };
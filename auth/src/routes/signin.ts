import express, { Request, Response } from 'express';
import { body } from 'express-validator'
import { User } from './../models/users'
import { validateRequest, BadRequestError } from '@exposium/common'

import { Password } from '../services/password';
import jwt from 'jsonwebtoken'
const router = express.Router();

router.post('/api/users/signin', [
    body('email')
        .isEmail().withMessage("please provide valid email"),
    body('password').trim().notEmpty().withMessage("you must supply a password")
],
    validateRequest
    , async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            throw new BadRequestError(" email not found")
        }
        const passwordsMatch = await Password.compare(existingUser.password, password)
        if (!passwordsMatch) {
            throw new BadRequestError("Invalid credentials")
        }
        const userJwt = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
        }, process.env.JWT_KEY!)

        req.session = {
            jwt: userJwt
        }
        res.status(200).send(existingUser);

    })


export { router as signinRouter };
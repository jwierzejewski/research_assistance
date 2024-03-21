import {Request, Response} from "express";
import {PrismaClient} from '@prisma/client';
import {generateAccessToken} from "../services/authentication";
import bcrypt from "bcryptjs"

const prisma = new PrismaClient();
const salt = 10
export const login = async (req: Request, res: Response) => {
    const {username, password} = req.body;
    console.log(req.body)
    if (username === undefined || password === undefined) {
        return res.status(400).json({error: 'Bad request: Missing required fields'});
    }
    const user = await prisma.user.findUnique({
        where: {
            username: username
        }
    });
    if (!user) {
        return res.status(400).json({error: 'User not found'});
    }
    if (!await bcrypt.compare(password,user.password)) {
        return res.status(400).json({error: 'Incorrect user credentials'});
    }
    return res.json({message: 'Logged in successfully', token: generateAccessToken(username)});
};

export const signup = async (req: Request, res: Response) => {
    const {username, password, firstname, lastname} = req.body;
    if (
        username === undefined ||
        password === undefined ||
        firstname === undefined ||
        lastname === undefined
    ) {
        return res.status(400).json({error: 'Bad request: Missing required fields'});
    }
    const user = await prisma.user.findUnique({
        where: {
            username: username
        }
    });
    if (!user) {
        console.log(password)
        const hashedPassword = await bcrypt.hash(password,salt)
        console.log(hashedPassword)
        const userSignup = await prisma.user.create({
            data: {
                username: username,
                password: hashedPassword,
                firstname: firstname,
                lastname: lastname,
            }
        });
        if (userSignup)
            return res.json({message: 'Signup successfully'});
    } else {
        return res.status(400).json({error: 'User exist'});
    }
};
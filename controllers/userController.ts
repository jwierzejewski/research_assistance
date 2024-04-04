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
        (req.session as any).message = "Incorrect user credentials"
        return res.redirect('/');
        //return res.status(400).json({error: 'User not found'});
    }
    if (!await bcrypt.compare(password,user.password)) {
        //return res.status(400).json({error: 'Incorrect user credentials'});
        (req.session as any).message = "Incorrect user credentials"
        return res.redirect('/');
    }
    (req.session as any).loggedin = true;
    (req.session as any).username = username;
    (req.session as any).message = "Logged in successfully"
    return res.redirect('/');
    //return res.json({message: 'Logged in successfully', token: generateAccessToken(username)});
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
        if (userSignup) {
            (req.session as any).message = 'Signup successfully';
            res.redirect('/')
        }
    } else {
        (req.session as any).message = 'User already exist';
        res.redirect('/signup')
    }
};
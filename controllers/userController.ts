import {NextFunction, Request, Response} from "express";
import {PrismaClient} from '@prisma/client';
import bcrypt from "bcryptjs"
import {MySession} from "../utils/mySession"
import {IMessage} from "../utils/IMessage";


const prisma = new PrismaClient();
const salt = 10

export const signup = async (req: Request, res: Response):Promise<any> => {
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
            const msg: IMessage = {text: 'Signup successfully', isError: false};
            (req.session as any).message = msg;
            res.redirect('/')
        }
    } else {
        const msg: IMessage = {text: 'User already exist', isError: true};
        (req.session as any).message = msg;
        res.redirect('/user/signup')
    }
};

export function isAuthenticated(req: Request ,res: Response, next: NextFunction): Response | void {
    if(req.user)
        return next();
    else
        res.redirect("/");
}
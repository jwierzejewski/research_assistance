import {NextFunction, Request, Response} from "express";
import {PrismaClient} from '@prisma/client';
import bcrypt from "bcryptjs"
import {IMessage} from "../utils/IMessage";
import {validationErrorHandler} from "../utils/errorHandler"
import {redirectHandler} from "../utils/redirectHandler";
import {IMySession} from "../utils/IMySession";


const prisma = new PrismaClient();
const salt = 10

export const signup = async (req: Request, res: Response): Promise<any> => {

    validationErrorHandler(req, res, "/user/signup");

    const {username, password, firstname, lastname} = req.body;
    const user = await prisma.user.findUnique({
        where: {
            username: username
        }
    });
    if (!user) {
        console.log(password)
        const hashedPassword = await bcrypt.hash(password, salt)
        console.log(hashedPassword)
        const userSignup = await prisma.user.create({
            data: {
                username: username, password: hashedPassword, firstname: firstname, lastname: lastname,
            }
        });
        if (userSignup) {
            const msg: IMessage = {text: 'Signup successfully', isError: false};
            (req.session as IMySession).message = msg;
            res.redirect('/')
        }
    } else {
        const msg: IMessage = {text: 'User already exist', isError: true};
        (req.session as IMySession).message = msg;
        (req.session as IMySession).formData = req.body;
        res.redirect('/user/signup')
    }
};

export const signupPage = (req: Request, res: Response) => {
    res.render('signup', {
        message: (req.session as IMySession).message, formData: (req.session as IMySession).formData
    });
    delete (req.session as IMySession).message;
    delete (req.session as IMySession).formData;
}
export const userLogout = (req: Request, res: Response) => {
    req.logout(function (err) {
        if (err) {
            throw err
        }
        res.redirect('/');
    })
}

export const userLoginFailed = (req: Request, res: Response) => {
    const msg: IMessage = {text: 'Incorrect user credentials', isError: true};
    (req.session as IMySession).message = msg;
    return res.redirect('/');
    return redirectHandler(req, res, '/resources/addItem',
        {text: 'Item not added', isError: true}, true);

}

export const userLogin = async (req: Request, res: Response) => {
    const msg: IMessage = {text: 'Logged in successfully', isError: false};
    (req.session as IMySession).message = msg;
    return res.redirect('/');
    return redirectHandler(req, res, '/resources/addItem',
        {text: 'Item not added', isError: true}, true);

};

export const isAuthenticated = (req: Request, res: Response, next: NextFunction): Response | void => {
    if (req.user) return next(); else res.redirect("/");
}


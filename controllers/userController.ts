import {NextFunction, Request, Response} from "express";
import bcrypt from "bcryptjs"
import {validationErrorHandler} from "../utils/errorHandler"
import {redirectHandler} from "../utils/redirectHandler";
import {IMySession} from "../utils/IMySession";
import UserRepository from "../services/userRepository";
import prisma from "../prisma/prismaClient";

const salt = 10
const userRepository = new UserRepository(prisma)
export const signup = async (req: Request, res: Response): Promise<any> => {

    validationErrorHandler(req, res, "/user/signup");

    const {username, password, firstname, lastname} = req.body;

    if (!await userRepository.userExist(username)) {
        const hashedPassword = await bcrypt.hash(password, salt)

        if (await userRepository.createUser(username, hashedPassword, firstname, lastname)) {
            return redirectHandler(req, res, '/',
                {text: 'Signup successfully', isError: false});
        }
    } else {
        return redirectHandler(req, res, '/user/signup',
            {text: 'User already exist', isError: true}, true);
    }
};
export const loginPage = (req: Request, res: Response) => {
    res.render('login', {
        message: (req.session as IMySession).message
    });
    delete (req.session as IMySession).message;
}
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
    return redirectHandler(req, res, '/user/login',
        {text: 'Incorrect user credentials', isError: true});
}

export const userLogin = async (req: Request, res: Response) => {
    return redirectHandler(req, res, '/',
        {text: 'Logged in successfully', isError: false});
};

export const isAuthenticated = (req: Request, res: Response, next: NextFunction): Response | void => {
    if (req.user) return next(); else res.redirect("/user/login");
}


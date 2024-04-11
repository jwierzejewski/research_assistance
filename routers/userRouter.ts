import {Request, Response, Router} from "express";
import {isAuthenticated, signup} from "../controllers/userController";
import asyncHandler from "express-async-handler";
import passport from "passport";
import {IMessage} from "../utils/IMessage";

export const userRouter = Router();

userRouter.get('/signup', (req, res) => {
    res.render('signup', {
        message: (req.session as any).message,
    });
    delete (req.session as any).message;
});

userRouter.get('/logout', isAuthenticated, (req, res) => {
    (req.session as any).destroy();
    res.redirect('/');
});

userRouter.get('/loginfail', function(req, res){
    const msg: IMessage = {text: 'Incorrect user credentials', isError: true};
    (req.session as any).message = msg;
    return res.redirect('/');
});

userRouter.post("/login",passport.authenticate('local',{
    failureRedirect:"/user/loginfail"
}),(async (req: Request, res: Response) => {
    const msg: IMessage = {text: 'Logged in successfully', isError: false};
    (req.session as any).message = msg;
    return res.redirect('/');
}));

userRouter.post("/signup", asyncHandler(signup));
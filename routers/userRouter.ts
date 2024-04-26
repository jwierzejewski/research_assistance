import {Router} from "express";
import * as UserController from '../controllers/userController';
import asyncHandler from "express-async-handler";
import passport from "passport";
import {loginValidate, signupValidate} from "../utils/validators";

export const userRouter = Router();

userRouter.get('/login', asyncHandler(UserController.loginPage));
userRouter.get('/signup', asyncHandler(UserController.signupPage));
userRouter.get('/logout', UserController.isAuthenticated, asyncHandler(UserController.userLogout));
userRouter.get('/loginfail', asyncHandler(UserController.userLoginFailed));
userRouter.post("/login", loginValidate, asyncHandler(passport.authenticate('local', {
    failureRedirect: "/user/loginfail"
})), asyncHandler(UserController.userLogin));
userRouter.post("/signup", signupValidate, asyncHandler(UserController.signup));
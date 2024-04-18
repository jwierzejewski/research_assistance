import {Router} from "express";
import {
    isAuthenticated, signup, signupPage, userLogin, userLoginFailed, userLogout
} from "../controllers/userController";
import asyncHandler from "express-async-handler";
import passport from "passport";
import {loginValidate, signupValidate} from "../utils/validators";

export const userRouter = Router();

userRouter.get('/signup', asyncHandler(signupPage));
userRouter.get('/logout', isAuthenticated, asyncHandler(userLogout));
userRouter.get('/loginfail', asyncHandler(userLoginFailed));
userRouter.post("/login", loginValidate, asyncHandler(passport.authenticate('local', {
    failureRedirect: "/user/loginfail"
})), asyncHandler(userLogin));
userRouter.post("/signup", signupValidate, asyncHandler(signup));
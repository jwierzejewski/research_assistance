import jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from "express";

export function generateAccessToken(username: string) {
    const secret: jwt.Secret = process.env.TOKEN_SECRET as jwt.Secret
    console.log(secret)
    console.log(username)
    return jwt.sign(username, secret);
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log("body", req.body)
    if (token == null) return res.sendStatus(401);

    jwt.verify(token as string, process.env.TOKEN_SECRET as string, (err: jwt.VerifyErrors | null, username: any) => {
        console.log(err);

        if (err) return res.sendStatus(403);

        console.log("username", username)
        res.locals.username = username;

        next();
    })
}
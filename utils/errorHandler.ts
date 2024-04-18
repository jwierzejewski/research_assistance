import {Request, Response} from 'express';
import {validationResult} from "express-validator";
import {IMySession} from "./IMySession";


export const validationErrorHandler = (req: Request, res: Response, redirectUrl: string) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        (req.session as IMySession).formData = req.body
        var errorMsg = "";
        errors.array().forEach(error => {
            console.log(error.msg);
            errorMsg += error.msg + "\n";
        });

        const msg = {text: errorMsg, isError: true};
        (req.session as IMySession).message = msg;
        return res.redirect(redirectUrl);
    }
};

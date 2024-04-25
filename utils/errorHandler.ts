import {Request, Response} from 'express';
import {validationResult} from "express-validator";
import {IMySession} from "./IMySession";
import {redirectHandler} from "./redirectHandler";


export const validationErrorHandler = (req: Request, res: Response, redirectUrl: string) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        (req.session as IMySession).formData = req.body
        var errorMsg = "";
        errors.array().forEach(error => {
            console.log(error.msg);
            errorMsg += error.msg + "\n";
        });

        return redirectHandler(req, res, redirectUrl,
            {text: errorMsg, isError: true});
    }
};

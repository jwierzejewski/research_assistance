import {Request, Response} from "express";
import {IMessage} from "./IMessage";
import {IMySession} from "./IMySession";


export const redirectHandler = (req: Request, res: Response, redirectUrl: string, message: IMessage | undefined = undefined, saveFormData: boolean = false) => {
    if (message !== undefined) {
        (req.session as IMySession).message = message;
    }
    console.log(saveFormData)
    if (saveFormData) (req.session as IMySession).formData = req.body;
    return res.redirect(redirectUrl);
}
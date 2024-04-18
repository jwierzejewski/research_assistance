import {IMessage} from "./IMessage";
import {Session} from "express-session";

export interface IMySession extends Session {
    message?: IMessage,
    formData?: {},
    items?: {},
    arxivItems?: {},
    sharing?: boolean
}
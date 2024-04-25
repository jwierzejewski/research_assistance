import {IMessage} from "./IMessage";
import {Session} from "express-session";
import { Item } from '@prisma/client';

export interface IMySession extends Session {
    message?: IMessage,
    formData?: {},
    items?: Item[],
    arxivItems?: {},
    sharingEnabled?: boolean,
    sharing?: boolean
}
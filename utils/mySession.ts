import {Session} from "express-session";

export interface MySession extends Session{
    loggedin: boolean,
    username: string,
    message: string,
}
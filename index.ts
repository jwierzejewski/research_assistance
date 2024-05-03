import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";
import {engine} from 'express-handlebars';
import session from "express-session";
import passport from "passport";
import {setupPassport} from "./utils/PassportSettings";
import {IUser} from "./utils/IUser";
import {userRouter} from "./routers/userRouter";
import {resourcesRouter} from "./routers/resourceRouter"
import {IMySession} from "./utils/IMySession";
import {redirectHandler} from "./utils/redirectHandler";

dotenv.config();

export const app: Express = express();
const port = process.env.PORT || 3000;
const SECRET: string = process.env.SECRET || "secret"

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.engine('.hbs', engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(session({
    secret: SECRET, resave: false, saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.authenticate('session'));

setupPassport();

app.use('/user', userRouter)
app.use('/resources', resourcesRouter)

app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('homeLogged', {
            title: "Research assistance - Home",
            username: (req.user as IUser).username,
            message: (req.session as IMySession).message,
        });
    } else {
        res.render('home', {
            title: "Research assistance - Home",
            message: (req.session as IMySession).message,
        });
    }
    delete (req.session as IMySession).message;
});


app.use((err: Error, req: Request, res: Response) => {
    console.error(err.stack);
    return redirectHandler(req, res, req.originalUrl,
        {text: 'Something went wrong', isError: true});
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

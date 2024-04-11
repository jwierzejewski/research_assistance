import express, {Express, NextFunction, Request, Response} from "express";
import dotenv from "dotenv";
import {engine} from 'express-handlebars';
import session from "express-session";
import passport from "passport";
import { setupPassport } from "./utils/PassportSettings";
import {IUser} from "./utils/IUser";
import {userRouter} from "./routers/userRouter";
import {resourcesRouter} from "./routers/resourceRouter"

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.engine('.hbs', engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.authenticate('session'));

setupPassport();

app.use('/user', userRouter)
app.use('/resources',resourcesRouter)

app.get('/', (req, res) => {
    console.log(req.user)
    if(req.isAuthenticated()){
        res.render('home', {
            title: "Research assistance - Home",
            username: (req.user as IUser).username,
            message: (req.session as any).message,
        });
    }else {
        res.render('login', {
            title: "Research assistance - Login",
            message: (req.session as any).message,
        });
    }
    delete (req.session as any).message;
});




app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    (req.session as any).message = "Something went wrong"
    return res.redirect('/');
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

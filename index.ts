import express, {Express, NextFunction, Request, Response} from "express";
import dotenv from "dotenv";
import {isAuthenticated, login, signup} from "./controllers/userController";
import {getItems,addItemFile, getFile, upload} from "./controllers/itemController";
import {shareItems} from "./controllers/shareController";
import errorHandler from "./utils/errorHandler";
import {getCategoryList,getCategories} from "./controllers/categoryController";
import {engine} from 'express-handlebars';
import session from "express-session";
import * as passportStrategy from "passport-local";
import passport from "passport";
import { setupPassport } from "./utils/PassportAuth";
import {IUser} from "./utils/IUser";
import asyncHandler from "express-async-handler";
import {getFromArxiv} from "./controllers/arxivController";

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




app.get('/', (req, res) => {
    console.log(req.user)
    if(req.isAuthenticated()){
        console.log(req.isAuthenticated(),req.user)
        res.render('home', {
            title: "Research assistance - Home",
            username: (req.user as IUser).username,
            message: (req.session as any).message,
        });
    }else {
        console.log(req.isAuthenticated(),req.user)
        res.render('login', {
        title: "Research assistance - Login",
        message: (req.session as any).message,
    });
    }
    delete (req.session as any).message;
});

app.get('/signup', (req, res) => {
    res.render('signup', {
        message: (req.session as any).message,
    });
    delete (req.session as any).message;
});

app.get('/browse',isAuthenticated,async (req, res) => {
    const categoryList = await getCategoryList()
    res.render('browse', {
        title: "Research assistance - Browse",
        sharing: (req.session as any).sharing,
        categories: categoryList,
        message: (req.session as any).message,
        items: (req.session as any).items,
        helpers:{
            eq(value1:any,value2:any):boolean {
                return value1 == value2
            }
        }
    });
    delete (req.session as any).message;
});

app.get('/addFile',isAuthenticated,async (req, res) => {
    const categoryList = await getCategoryList()
    res.render('addFile', {
        title: "Research assistance - Add File",
        categories: categoryList,
        message: (req.session as any).message,
    });
    delete (req.session as any).message;
});

app.get('/getFromArxiv',isAuthenticated,asyncHandler(async (req:Request, res,next) => {
    res.render('arxiv', {
        title: "Research assistance - Get From Arxiv",
        message: (req.session as any).message,
        arxivItems: (req.session as any).arxivItems,
    });
    delete (req.session as any).message;
}));

app.get('/initSharing', isAuthenticated, (req, res) => {
    (req.session as any).sharing = true;
    res.redirect('/browse');
});
app.get('/logout', isAuthenticated, (req, res) => {
    (req.session as any).destroy();
    res.redirect('/');
});

app.get('/loginfail', function(req, res){
    (req.session as any).message = "Wrong login credential"
    return res.redirect('/');
});


app.post("/login",passport.authenticate('local',{
    failureRedirect:"/loginfail"
}),(async (req: Request, res: Response) => {
    (req.session as any).message = "Logged in successfully"
    return res.redirect('/');
}));
app.post("/signup", errorHandler(signup));
app.post("/getItems",isAuthenticated, asyncHandler(getItems));
app.post("/getFromArxiv",isAuthenticated, asyncHandler(getFromArxiv));
app.post("/shareItems",isAuthenticated, asyncHandler(shareItems));
app.post("/addItemFile",isAuthenticated, asyncHandler(upload.single('file')), asyncHandler(addItemFile));
app.get("/getFile/:id",isAuthenticated, asyncHandler(getFile));
app.get("/getCategories",isAuthenticated, asyncHandler(getCategories));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    (req.session as any).message = "Something went wrong"
    return res.redirect('/');
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";
import {login, signup} from "./controllers/userController";
import {addItemLink, getItems} from "./controllers/itemController";
import {shareItems} from "./controllers/shareController";
import errorHandler from "./utils/errorHandler";
import {addItemFile, getFile, upload} from "./controllers/fileController";
import {getCategoryList,getCategories} from "./controllers/categoryController";
import {engine} from 'express-handlebars';
import session from "express-session";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.engine('.hbs', engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));



app.get('/', (req, res) => {
    res.render('home', {
        layout: false,
        loggedin: (req.session as any).loggedin,
        username: (req.session as any).username,
        message: (req.session as any).message,
    });
    delete (req.session as any).message;
});

app.get('/signup', (req, res) => {
    res.render('signup', {
        layout: false,
        message: (req.session as any).message,
    });
    delete (req.session as any).message;
});

app.get('/browse',async (req, res) => {
    const categoryList = await getCategoryList()
    res.render('browse', {
        layout: false,
        loggedin: (req.session as any).loggedin,
        username: (req.session as any).username,
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

app.get('/addFile',async (req, res) => {
    const categoryList = await getCategoryList()
    res.render('addFile', {
        layout: false,
        loggedin: (req.session as any).loggedin,
        username: (req.session as any).username,
        categories: categoryList,
        message: (req.session as any).message,
    });
    delete (req.session as any).message;
});

app.get('/addLink',async (req, res) => {
    const categoryList = await getCategoryList()
    res.render('addLink', {
        layout: false,
        loggedin: (req.session as any).loggedin,
        username: (req.session as any).username,
        categories: categoryList,
        message: (req.session as any).message,
    });
    delete (req.session as any).message;
});

/*
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Tutaj można dodać logikę autentykacji, np. sprawdzanie w bazie danych
    (req.session as any).loggedin = true;
    (req.session as any).username = username;
    res.redirect('/');
});*/

app.get('/initSharing', (req, res) => {
    (req.session as any).sharing = true;
    res.redirect('/browse');
});
app.get('/logout', (req, res) => {
    (req.session as any).destroy();
    res.redirect('/');
});


app.post("/login", errorHandler(login));
app.post("/signup", errorHandler(signup));
app.post("/getItems", errorHandler(getItems));
app.post("/shareItems", errorHandler(shareItems));
app.post("/addItemFile", upload.single('file'), errorHandler(addItemFile));
app.post("/addItemLink", errorHandler(addItemLink));
app.get("/getFile/:id", errorHandler(getFile));
app.get("/getCategories", getCategories);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

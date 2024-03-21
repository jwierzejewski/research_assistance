import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";
import {login, signup} from "./controllers/userController";
import {addItemLink, getItems} from "./controllers/itemController";
import {shareResources} from "./controllers/shareController";
import errorHandler from "./utils/errorHandler";
import {authenticateToken} from "./services/authentication";
import {addItemFile, getFile, upload} from "./controllers/fileController";
import {getCategories} from "./controllers/categoryController";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.json());


app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
});

app.post("/login", errorHandler(login));
app.post("/signup", errorHandler(signup));
app.get("/getItems", authenticateToken, errorHandler(getItems));
app.post("/shareResources", authenticateToken, errorHandler(shareResources));
app.post("/addItemFile", authenticateToken, upload.single('file'), errorHandler(addItemFile));
app.post("/addItemLink", authenticateToken, errorHandler(addItemLink));
app.get("/getFile/:id", authenticateToken, errorHandler(getFile));
app.get("/getCategories", authenticateToken, getCategories)

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});


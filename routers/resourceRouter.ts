import {Request, Router} from "express";
import {IUser} from "../utils/IUser";
import {isAuthenticated, signup} from "../controllers/userController";
import {getCategories, getCategoryList} from "../controllers/categoryController";
import asyncHandler from "express-async-handler";
import {addItemFile, getFile, getItems, upload} from "../controllers/itemController";
import {getFromArxiv} from "../controllers/arxivController";
import {shareItems} from "../controllers/shareController";

export const resourcesRouter = Router();

resourcesRouter.get('/browse',isAuthenticated,async (req, res) => {
    console.log("message",(req.session as any).message)
    const categoryList = await getCategoryList()
    res.render('browse', {
        username: (req.user as IUser).username,
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

resourcesRouter.get('/addFile',isAuthenticated,async (req, res) => {
    const categoryList = await getCategoryList()
    res.render('addFile', {
        title: "Research assistance - Add File",
        categories: categoryList,
        message: (req.session as any).message,
    });
    delete (req.session as any).message;
});

resourcesRouter.get('/getFromArxiv',isAuthenticated,asyncHandler(async (req:Request, res,next) => {
    res.render('arxiv', {
        title: "Research assistance - Get From Arxiv",
        message: (req.session as any).message,
        arxivItems: (req.session as any).arxivItems,
    });
    delete (req.session as any).message;
}));

resourcesRouter.get('/initSharing', isAuthenticated, (req, res) => {
    (req.session as any).sharing = true;
    res.redirect('/resources/browse');
});







resourcesRouter.post("/getItems",isAuthenticated, asyncHandler(getItems));
resourcesRouter.post("/getFromArxiv",isAuthenticated, asyncHandler(getFromArxiv));
resourcesRouter.post("/shareItems",isAuthenticated, asyncHandler(shareItems));
resourcesRouter.post("/addItemFile",isAuthenticated, asyncHandler(upload.single('file')), asyncHandler(addItemFile));
resourcesRouter.get("/getFile/:id",isAuthenticated, asyncHandler(getFile));
resourcesRouter.get("/getCategories",isAuthenticated, asyncHandler(getCategories));
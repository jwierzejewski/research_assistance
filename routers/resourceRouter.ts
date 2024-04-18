import {Router} from "express";
import {isAuthenticated} from "../controllers/userController";
import {getCategories} from "../controllers/categoryController";
import asyncHandler from "express-async-handler";
import {addItemFile, addItemPage, browseItemsPage, getFile, getItems, upload} from "../controllers/itemController";
import {browseInArxivPage, getFromArxiv} from "../controllers/arxivController";
import {initSharing, shareItems} from "../controllers/shareController";
import {addResourceValidate, arxivValidate, browseValidate} from "../utils/validators";

export const resourcesRouter = Router();

resourcesRouter.get('/browse', isAuthenticated, asyncHandler(browseItemsPage));
resourcesRouter.get('/addItem', isAuthenticated, asyncHandler(addItemPage));
resourcesRouter.get('/getFromArxiv', isAuthenticated, asyncHandler(browseInArxivPage));
resourcesRouter.get('/initSharing', isAuthenticated, asyncHandler(initSharing));
resourcesRouter.post("/getItems", isAuthenticated, browseValidate, asyncHandler(getItems));
resourcesRouter.post("/getFromArxiv", isAuthenticated, arxivValidate, asyncHandler(getFromArxiv));
resourcesRouter.post("/shareItems", isAuthenticated, asyncHandler(shareItems));
resourcesRouter.post("/addItem", isAuthenticated, asyncHandler(upload.single('file')), addResourceValidate, asyncHandler(addItemFile));
resourcesRouter.get("/getFile/:id", isAuthenticated, asyncHandler(getFile));
resourcesRouter.get("/getCategories", isAuthenticated, asyncHandler(getCategories));
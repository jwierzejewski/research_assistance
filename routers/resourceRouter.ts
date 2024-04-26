import {Router} from "express";
import {isAuthenticated} from "../controllers/userController";
import {getCategories} from "../controllers/categoryController";
import asyncHandler from "express-async-handler";
import * as ItemController from "../controllers/itemController";
import {browseInArxivPage, getFromArxiv} from "../controllers/arxivController";
import {initSharing, shareItems} from "../controllers/shareController";
import * as Validator from "../utils/validators";

export const resourcesRouter = Router();

resourcesRouter.get('/browse', asyncHandler(ItemController.browseItemsPage));
resourcesRouter.get('/addItem', isAuthenticated, asyncHandler(ItemController.addItemPage));
resourcesRouter.get('/getFromArxiv', asyncHandler(browseInArxivPage));
resourcesRouter.get('/initSharing', isAuthenticated, asyncHandler(initSharing));
resourcesRouter.post("/getItems", Validator.browseValidate, asyncHandler(ItemController.getItems));
resourcesRouter.post("/getFromArxiv", Validator.arxivValidate, asyncHandler(getFromArxiv));
resourcesRouter.post("/shareItems", isAuthenticated, asyncHandler(shareItems));
resourcesRouter.post("/addItem", isAuthenticated, asyncHandler(ItemController.upload.single('file')),
    Validator.addResourceValidate, asyncHandler(ItemController.addItemFile));
resourcesRouter.get("/getFile/:id", asyncHandler(ItemController.getFile));
resourcesRouter.get("/getCategories", asyncHandler(getCategories));
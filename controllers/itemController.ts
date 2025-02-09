import {Request, Response} from "express";
import multer from "multer";
import fs from "fs";
import {IUser} from "../utils/IUser";
import {validationErrorHandler} from "../utils/errorHandler";
import {getCategoryList} from "./categoryController";
import {and, eq, not} from "../utils/helpers";
import {redirectHandler} from "../utils/redirectHandler";
import {getFromArxiv} from "./arxivController";
import {IMySession} from "../utils/IMySession";
import ItemRepository from "../services/itemRepository";
import prisma from "../prisma/prismaClient";
import {generateWhere} from "../utils/itemsUtils";

const itemRepository = new ItemRepository(prisma);
export const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    }, filename: (req, file, cb) => {
        const fileName = Date.now() + '-' + file.originalname
        cb(null, fileName);
    },
});

export const upload = multer({storage: storage});

export const addItemFile = async (req: Request, res: Response): Promise<any> => {
    validationErrorHandler(req, res, "/resources/addItem");
    try {
        if (!req.file) {
            return redirectHandler(req, res, '/resources/addItem',
                {text: 'Loading file failure', isError: true}, true);
        }
        const {title, categoryId, author, year, genre, status} = req.body;
        const {originalname, mimetype, filename, path} = req.file;
        const username = (req.user as IUser).username
        let publicItem = true
        if (status == "private")
            publicItem = false

        if (await itemRepository.isItemExist(title,author,parseInt(year),username))
        {
            itemRepository.undoAddingFile(req.file.path);
            return redirectHandler(req, res, '/resources/addItem',
                {text: 'Item already exist', isError: true}, true);
        }


        if (await itemRepository.createItem(
            {
                id: 0,
                title: title,
                categoryId: parseInt(categoryId),
                author: author,
                year: parseInt(year),
                genre: genre,
                ownerUsername: username,
                public: publicItem
            },
            {
                originalName: originalname,
                mimeType: mimetype,
                fileName: filename,
                filePath: path,
                id: 0,
                itemId: 0
            }
        )
        )
            return redirectHandler(req, res, '/',
                {text: 'Item added successfully', isError: false});

        itemRepository.undoAddingFile(req.file.path);
        return redirectHandler(req, res, '/resources/addItem',
            {text: 'Item not added', isError: true}, true);

    } catch (error) {
        itemRepository.undoAddingFile(req.file!.path);
        throw error
    }
}

export const getFile = async (req: Request, res: Response): Promise<any> => {
    try {
        const fileId = parseInt(req.params.id);
        const file = await itemRepository.getFile(fileId)

        if (!file) {
            return redirectHandler(req, res, '/resources/browse',
                {text: 'File not found', isError: true}, true);
        }
        const fileData = fs.createReadStream(file.filePath)

        res.setHeader('Content-Disposition', `attachment; filename=${file.originalName}`);
        res.setHeader('Content-Type', file.mimeType);
        fileData.pipe(res);
    } catch (error) {
        return redirectHandler(req, res, '/resources/browse',
            {text: 'Downloading file failure', isError: true}, true);
    }
}

export const getItems = async (req: Request, res: Response) => {
    validationErrorHandler(req, res, "/resources/browse");

    (req.session as IMySession).formData = req.body;

    let where = generateWhere(req)
    const Items = await itemRepository.getItems(where)

    if (Items.length > 0) {
        (req.session as IMySession).items = Items;
        return redirectHandler(req, res, '/resources/browse',
            undefined, true);

    } else {
        (req.session as IMySession).message = {text: "Items not found - searching in arxiv", isError: true};
        return getFromArxiv(req, res).catch(() => {
            return redirectHandler(req, res, '/resources/browse',
                {text: 'Items not found', isError: true}, true);
        })
    }
};

export const browseItemsPage = async (req: Request, res: Response) => {
    const categoryList = await getCategoryList()
    let items = (req.session as IMySession).items
    let sharingEnabled = false
    let username = req.isAuthenticated() ? (req.user as IUser).username : null
    if (username && items && items.some(item => !item.public && item.ownerUsername === username))
        sharingEnabled = true;
    res.render('browse', {
        loggedIn: req.isAuthenticated(),
        username: username,
        title: "Research assistance - Browse",
        sharingEnabled: sharingEnabled,
        sharing: (req.session as IMySession).sharing,
        categories: categoryList,
        message: (req.session as IMySession).message,
        items: (req.session as IMySession).items,
        formData: (req.session as IMySession).formData,
        helpers: {
            eq,
            not,
            and,
        }
    });
    delete (req.session as IMySession).message;
    delete (req.session as IMySession).formData;
}

export const addItemPage = async (req: Request, res: Response) => {
    const categoryList = await getCategoryList()
    res.render('addItem', {
        title: "Research assistance - Add Item",
        loggedIn: req.isAuthenticated(),
        categories: categoryList,
        message: (req.session as IMySession).message,
        formData: (req.session as IMySession).formData,
        helpers: {
            eq,
            not,
            and
        }
    });
    delete (req.session as IMySession).message;
    delete (req.session as IMySession).formData;
}
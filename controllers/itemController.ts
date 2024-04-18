import {NextFunction, Request, Response} from "express";
import {Prisma, PrismaClient} from '@prisma/client';
import multer from "multer";
import fs from "fs";
import {IUser} from "../utils/IUser";
import {IMessage} from "../utils/IMessage";
import {validationErrorHandler} from "../utils/errorHandler";
import {getCategoryList} from "./categoryController";
import {eq} from "../utils/helpers";
import {redirectHandler} from "../utils/redirectHandler";
import {getFromArxiv} from "./arxivController";
import {IMySession} from "../utils/IMySession";

const prisma = new PrismaClient();
export const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    }, filename: (req, file, cb) => {
        const fileName = Date.now() + '-' + file.originalname
        cb(null, fileName);
    },
});

export const upload = multer({storage: storage});

function undoAddingFile(req: Request) {
    if (req.file) fs.unlink(req.file.path, (err) => {
        if (err) {
            console.log('Error during file removing:', err);
        } else {
            console.log('File adding has been withdrawn');
        }
    });
}

export const addItemFile = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    validationErrorHandler(req, res, "/resources/addItem");
    try {
        if (!req.file) {
            return redirectHandler(req, res, '/resources/addItem',
                {text: 'Loading file failure', isError: true}, true);
        }
        const {title, categoryId, author, year, genre} = req.body;
        const username = (req.user as IUser).username
        const newItem = await prisma.item.create({
            data: {
                title: title,
                categoryId: parseInt(categoryId),
                author: author,
                year: parseInt(year),
                genre: genre,
                ownerUsername: username
            },
        });
        if (!newItem) {
            undoAddingFile(req);
            return redirectHandler(req, res, '/resources/addItem',
                {text: 'Item not added', isError: true}, true);
        }
        const {originalname, mimetype, filename, path} = req.file;

        await prisma.file.create({
            data: {
                originalName: originalname,
                mimeType: mimetype,
                fileName: filename,
                filePath: path,
                itemId: newItem.id
            },
        });
        return redirectHandler(req, res, '/',
            {text: 'Item added successfully', isError: false});

    } catch (error) {
        undoAddingFile(req);
        throw error
    }
}

export const getFile = async (req: Request, res: Response): Promise<any> => {
    try {
        const fileId = req.params.id;
        const file = await prisma.file.findUnique({
            where: {
                id: parseInt(fileId),
            },
        });

        if (!file) {
            return redirectHandler(req, res, '/resources/browse',
                {text: 'File not found', isError: true}, true);
        }
        console.log(file.filePath)
        const fileData = fs.createReadStream(file.filePath)

        res.setHeader('Content-Disposition', `attachment; filename=${file.originalName}`);
        res.setHeader('Content-Type', file.mimeType);
        fileData.pipe(res);
    } catch (error) {
        return redirectHandler(req, res, '/resources/browse',
            {text: 'Downloading file failure', isError: true}, true);
    }
}

function generateWhere(title: string, categoryId: string, author: string, year: string, genre: string, username: string) {
    let where: Prisma.ItemWhereInput = {};
    if (title !== undefined && title != "") {
        where.title = {
            contains: title
        };
    }
    if (categoryId !== undefined && categoryId != "") {
        where.categoryId = parseInt(categoryId)
    }

    if (author !== undefined && author != "") {
        where.author = {
            contains: author
        };
    }

    if (year !== undefined && year != "") {
        where.year = parseInt(year);
    }

    if (genre !== undefined && genre != "") {
        where.genre = {
            contains: genre
        };
    }
    where.OR = [{ownerUsername: username}, {sharedWith: {some: {username: username}}}]
    return where;
}

export const getItems = async (req: Request, res: Response) => {
    validationErrorHandler(req, res, "/resources/browse");
    const {title, categoryId, author, year, genre} = req.body;
    (req.session as IMySession).formData = req.body;
    const username = (req.user as IUser).username
    let where = generateWhere(title, categoryId, author, year, genre, username);

    const Items = await prisma.item.findMany({
        where: where, include: {
            file: {
                select: {
                    id: true, originalName: true, mimeType: true
                },
            }, category: true
        },
    })

    if (Items.length > 0) {
        (req.session as IMySession).items = Items;
        return redirectHandler(req, res, '/resources/browse',
            undefined, true);

    } else {
        const message: IMessage = {text: "Items not found - searching in arxiv", isError: true};
        (req.session as IMySession).message = message;
        return getFromArxiv(req, res).catch(() => {
            return redirectHandler(req, res, '/resources/browse',
                {text: 'Items not found', isError: true}, true);
        })
    }
};

export const browseItemsPage = async (req: Request, res: Response) => {
    console.log("message", (req.session as IMySession).message)
    const categoryList = await getCategoryList()
    res.render('browse', {
        username: (req.user as IUser).username,
        title: "Research assistance - Browse",
        sharing: (req.session as IMySession).sharing,
        categories: categoryList,
        message: (req.session as IMySession).message,
        items: (req.session as IMySession).items,
        formData: (req.session as IMySession).formData,
        helpers: {
            eq
        }
    });
    delete (req.session as IMySession).message;
    delete (req.session as IMySession).formData;
}

export const addItemPage = async (req: Request, res: Response) => {
    const categoryList = await getCategoryList()
    res.render('addItem', {
        title: "Research assistance - Add Item",
        categories: categoryList,
        message: (req.session as IMySession).message,
        formData: (req.session as IMySession).formData,
        helpers: {
            eq
        }
    });
    delete (req.session as IMySession).message;
    delete (req.session as IMySession).formData;
}
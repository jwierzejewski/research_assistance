import {NextFunction, Request, Response} from "express";
import {PrismaClient, Prisma} from '@prisma/client';
import multer from "multer";
import fs from "fs";
import {IUser} from "../utils/IUser";
import {IMessage} from "../utils/IMessage";

const prisma = new PrismaClient();
export const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + '-' + file.originalname
        cb(null, fileName);
    },
});

export const upload = multer({storage: storage});

export const addItemFile = async (req: Request, res: Response, next: NextFunction):Promise<any> => {
    console.log("addItemFile")
    try {
        if (!req.file) {
            return res.status(400).send('File not found.');
        }
        const {title, categoryId, author, year, genre, link} = req.body;
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
            const msg: IMessage = {text: 'Item not added"', isError: true};
            (req.session as any).message = msg;
            return res.redirect('/resources/addFile');
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
        const msg: IMessage = {text: 'Item added successfully', isError: false};
        (req.session as any).message = msg;
        return res.redirect('/');
    } catch (error) {
        console.log("error")
        if (req.file)
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.log('Error during file removing:', err);
                } else {
                    console.log('File adding has been withdrawn');
                }
            });
        throw error
    }
}

export const getFile = async (req: Request, res: Response):Promise<any> => {
    try {
        const fileId = req.params.id;
        const file = await prisma.file.findUnique({
            where: {
                id: parseInt(fileId),
            },
        });

        if (!file) {
            return res.status(404).send('File not found');
        }
        console.log(file.filePath)
        const fileData = fs.createReadStream(file.filePath)

        res.setHeader('Content-Disposition', `attachment; filename=${file.originalName}`);
        res.setHeader('Content-Type', file.mimeType);
        fileData.pipe(res);
    } catch (error) {
        res.status(500).send('Error during file loading');
    }
}
export const getItems = async (req: Request, res: Response) => {
    const {title, categoryId, author, year, genre} = req.body;
    const username = (req.user as IUser).username
    let where: Prisma.ItemWhereInput = {};
    if (title !== undefined && title!="") {
        where.title = {
            contains: title
        };
    }
    console.log("categoryId "+categoryId)
    if (categoryId !== undefined && categoryId!="") {
        where.categoryId = parseInt(categoryId)
    }

    if (author !== undefined && author!="") {
        where.author = {
            contains: author
        };
    }

    if (year !== undefined && year!="") {
        where.year = parseInt(year);
    }

    if (genre !== undefined && genre!="") {
        where.genre = {
            contains: genre
        };
    }
    where.OR = [
    {ownerUsername: username},
    {sharedWith: {some: {username: username}}}
    ]

    const Items = await prisma.item.findMany({
        where: where,
        include: {
            file: {
                select: {
                    id: true,
                    originalName: true,
                    mimeType: true
                },
            }, category: true
        },
    })
    console.log(Items)
    if (Items.length > 0) {
        (req.session as any).items = Items
        return res.redirect('/resources/browse');
    } else {
        const msg: IMessage = {text: 'Items not found', isError: true};
        (req.session as any).message = msg;
        console.log("pusto")
        console.log(Items)
        delete (req.session as any).items
        return res.redirect('/resources/browse');
    }
};
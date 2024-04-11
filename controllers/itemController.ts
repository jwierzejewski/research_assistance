import {NextFunction, Request, Response} from "express";
import {PrismaClient, Prisma} from '@prisma/client';
import multer from "multer";
import fs from "fs";

const prisma = new PrismaClient();
export const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Katalog, gdzie będą zapisywane przesłane pliki
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + '-' + file.originalname // Unikalna nazwa pliku
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
        const username = res.locals.username
        const newItem = await prisma.item.create({
            data: {
                title: title,
                categoryId: parseInt(categoryId),
                author: author,
                year: parseInt(year),
                genre: genre,
                ownerUsername: (req.session as any).username
            },
        });
        if (!newItem) {
            (req.session as any).message = "Item not added"
            return res.redirect('/');
            //return res.status(400).json({error: "Item not added"})
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
        (req.session as any).message = "Item added successfully"
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
            return res.status(404).send('Plik nie został znaleziony.');
        }
        console.log(file.filePath)
        const fileData = fs.createReadStream(file.filePath)

        res.setHeader('Content-Disposition', `attachment; filename=${file.originalName}`);
        res.setHeader('Content-Type', file.mimeType);
        fileData.pipe(res);
    } catch (error) {
        console.error('Błąd podczas pobierania pliku:', error);
        res.status(500).send('Wystąpił błąd podczas pobierania pliku.');
    }
}
export const getItems = async (req: Request, res: Response) => {
    const {title, categoryId, author, year, genre} = req.body;
    const username = (req.session as any).username
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
        return res.redirect('/browse');
    } else {
        (req.session as any).message = "Items not found"
        console.log("pusto")
        console.log(Items)
        delete (req.session as any).items
        return res.redirect('/browse');
    }
};
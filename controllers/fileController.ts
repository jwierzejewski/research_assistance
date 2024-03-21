import {NextFunction, Request, Response} from 'express';
import {PrismaClient} from '@prisma/client';
import multer from 'multer';
import * as fs from "fs";

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

export const addItemFile = async (req: Request, res: Response, next: NextFunction) => {
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
                ownerUsername: username
            },
        });
        if (!newItem) {
            return res.status(400).json({error: "Item not added"})
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
        res.json({message: 'File added successfully'});
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

export const getFile = async (req: Request, res: Response) => {
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
        const fileData = fs.createReadStream(file.filePath)

        res.setHeader('Content-Disposition', `attachment; filename=${file.originalName}`);
        res.setHeader('Content-Type', file.mimeType);
        res.send(fileData);
    } catch (error) {
        console.error('Błąd podczas pobierania pliku:', error);
        res.status(500).send('Wystąpił błąd podczas pobierania pliku.');
    }
}
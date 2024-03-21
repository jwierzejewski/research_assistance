import {NextFunction, Request, Response} from "express";
import {PrismaClient, Prisma} from '@prisma/client';

const prisma = new PrismaClient();

export const addItemLink = async (req: Request, res: Response, next: NextFunction) => {
    const {title, categoryId, author, year, genre, link} = req.body;
    if (title === undefined || categoryId === undefined || author === undefined || year === undefined || genre === undefined || link === undefined)
        res.status(400).json({error: "Bad request"})
    const username = res.locals.username

    const newItem = await prisma.item.create({
        data: {
            title: title,
            categoryId: parseInt(categoryId),
            author: author,
            year: parseInt(year),
            genre: genre,
            link: link,
            ownerUsername: username
        },
    });
    if (!newItem) {
        return res.status(400).json({error: "Item not added"})
    }
    res.json({message: "Item added successfully"})
};

export const getItems = async (req: Request, res: Response) => {
    const {title, category, author, year, genre} = req.body;
    const username = res.locals.username
    const shared = await prisma.share.findMany({
        where: {
            recipientUsername: username
        }
    })
    var usernameList: string[] = [username]
    usernameList = [...usernameList, ...(shared.map(item => item.ownerUsername))]
    let where: Prisma.ItemWhereInput = {};
    if (title !== undefined) {
        where.title = {
            contains: title
        };
    }

    if (category !== undefined) {
        where.category = category
    }

    if (author !== undefined) {
        where.author = {
            contains: author
        };
    }

    if (year !== undefined) {
        where.year = year;
    }

    if (genre !== undefined) {
        where.genre = {
            contains: genre
        };
    }
    where.ownerUsername = {
        in: usernameList
    }

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
    if (Items.length > 0) {
        res.json({Items})
    } else {
        res.status(400).json({error: "Items not found"})
    }
};
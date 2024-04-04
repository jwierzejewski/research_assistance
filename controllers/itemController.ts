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
            ownerUsername: (req.session as any).username
        },
    });
    if (!newItem) {
        (req.session as any).message = "Item not added"
        return res.redirect('/addLink');
    }
    (req.session as any).message = "Item added successfully"
    return res.redirect('/');
};

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
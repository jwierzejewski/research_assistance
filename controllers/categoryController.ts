import {Request, Response} from "express";
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export const getCategories = async (req: Request, res: Response) => {
    const categories = await prisma.category.findMany()

    return res.json({categories});
};
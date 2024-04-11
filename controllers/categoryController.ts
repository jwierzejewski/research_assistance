import {Request, Response} from "express";
import {PrismaClient} from '@prisma/client';
import asyncHandler from 'express-async-handler'

const prisma = new PrismaClient();

export const getCategoryList = async()=>{
    return await prisma.category.findMany()
}
export const getCategories =async (req: Request, res: Response):Promise<any> => {
    const categories = await prisma.category.findMany()
    return res.json({categories});
};
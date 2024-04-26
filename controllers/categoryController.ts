import {Request, Response} from "express";
import CategoryRepository from "../services/categoryRepository";
import prisma from "../prisma/prismaClient";

const categoryRepository = new CategoryRepository(prisma)
export const getCategoryList = async () => {
    return await categoryRepository.getCategories()
}
export const getCategories = async (req: Request, res: Response): Promise<any> => {
    const categories = await categoryRepository.getCategories()
    return res.json({categories});
};
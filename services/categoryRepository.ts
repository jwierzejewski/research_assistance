import {PrismaClient, Item, File} from "@prisma/client";
import {redirectHandler} from "../utils/redirectHandler";
import {Request} from "express";
import fs from "fs";

export default class CategoryRepository{
    prisma: PrismaClient;
    constructor(prisma: PrismaClient){
        this.prisma = prisma
    }
    async getCategories(){
        return this.prisma.category.findMany()
    }
}
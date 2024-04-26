import {PrismaClient, Item, File} from "@prisma/client";
import {redirectHandler} from "../utils/redirectHandler";
import {Request} from "express";
import fs from "fs";

export default class ItemRepository{
    prisma: PrismaClient;
    constructor(prisma: PrismaClient){
        this.prisma = prisma
    }

    undoAddingFile(file: File) {
        if (file) fs.unlink(file.filePath, (err) => {
            if (err) {
                console.log('Error during file removing:', err);
            } else {
                console.log('File adding has been withdrawn');
            }
        });
    }
    async createItem(itemData: Item, fileData: File){
        const newItem = await this.prisma.item.create({
            data: {
                title: itemData.title,
                categoryId: itemData.categoryId,
                author: itemData.author,
                year: itemData.year,
                genre: itemData.genre,
                ownerUsername: itemData.ownerUsername,
                public: itemData.public
            },
        });
        if (!newItem) {
            this.undoAddingFile(fileData);
            return false
        }

        const file = await this.prisma.file.create({
            data: {
                originalName: fileData.originalName,
                mimeType: fileData.mimeType,
                fileName: fileData.fileName,
                filePath: fileData.filePath,
                itemId: newItem.id
            },
        });
        if (file)
            return true
        return false
    }

    async getItems(where: any){
        return this.prisma.item.findMany({
            where: where, include: {
                file: {
                    select: {
                        id: true, originalName: true, mimeType: true
                    },
                }, category: true
            },
        })
    }

    async getFile(fileId: number):Promise<File | null>{
        return this.prisma.file.findUnique({
            where: {
                id: fileId
            },
        });
    }

    async shareItem(itemId: number, userId: number){
        const share = await this.prisma.item.update({
            where: {
                id: itemId
            }, data: {
                sharedWith: {connect: {id: userId}}
            }
        });
        if(share)
            return true
        return false
    }



}
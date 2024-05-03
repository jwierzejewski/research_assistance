import {File, Item, PrismaClient} from "@prisma/client";
import fs from "fs";

export default class ItemRepository {
    prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma
    }

    undoAddingFile(filePath: string) {
        fs.unlink(filePath, (err) => {
            if (err)
                throw err
        });
    }

    async createItem(itemData: Item, fileData: File) {
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
            this.undoAddingFile(fileData.filePath);
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
        return !!file;

    }

    async getItems(where: any) {
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

    async getFile(fileId: number): Promise<File | null> {
        return this.prisma.file.findUnique({
            where: {
                id: fileId
            },
        });
    }

    async shareItem(itemId: number, userId: number) {
        const share = await this.prisma.item.update({
            where: {
                id: itemId
            }, data: {
                sharedWith: {connect: {id: userId}}
            }
        });
        return !!share;

    }

    async isItemExist(title: string, author: string, year: number, ownerUsername: string){
        const item = await this.prisma.item.findUnique({ where:{
                author_title_year_ownerUsername: {
                    author: author,
                    title: title,
                    year: year,
                    ownerUsername: ownerUsername
                }
            }})
        return !!item;

    }


}
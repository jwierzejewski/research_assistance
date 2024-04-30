import {PrismaClient} from "@prisma/client";

export default class CategoryRepository {
    prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma
    }

    async getCategories() {
        return this.prisma.category.findMany()
    }
}
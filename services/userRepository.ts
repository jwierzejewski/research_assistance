import {PrismaClient} from '@prisma/client';

export default class UserRepository {
    prisma: PrismaClient

    constructor(prisma: PrismaClient) {
        this.prisma = prisma
    }

    async createUser(username: string, hashedPassword: string, firstname: string, lastname: string): Promise<boolean> {
        const userSignup = await this.prisma.user.create({
            data: {
                username: username, password: hashedPassword, firstname: firstname, lastname: lastname,
            }
        });
        if (userSignup)
            return true;
        return false
    }

    async userExist(username: string) {
        const user = await this.prisma.user.findUnique(
            {
                where: {username: username}
            })
        if (user)
            return true
        return false
    }

    async getUser(username: string) {
        return this.prisma.user.findUnique(
            {
                where: {username: username}
            })
    }

}
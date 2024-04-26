import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

import prisma from "../prisma/prismaClient";
import UserRepository from "../services/userRepository";

jest.mock('../prisma/prismaClient', () => ({
    __esModule: true,
    default: mockDeep<PrismaClient>(),
}))

beforeEach(() => {
    mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>


describe('userRepository', () => {
    it('create new user', async () => {
        const userRepository = new UserRepository(prismaMock)
        const user = {
            id: 1,
            username: 'user1',
            password: 'pass',
            firstname: "John",
            lastname: "Smith",
        }

        prismaMock.user.create.mockResolvedValue(user)

        await expect(userRepository.createUser(user.username,user.password,user.firstname,user.lastname)).resolves.toEqual(
            true
        )

    });

    it('find user', async () => {
        const userRepository = new UserRepository(prismaMock)
        const user = {
            id: 1,
            username: 'user1',
            password: 'pass',
            firstname: "John",
            lastname: "Smith",
        }
        prismaMock.user.findUnique.mockResolvedValue(user)
        await expect(userRepository.getUser(user.username)).resolves.toEqual(user)
    });
});
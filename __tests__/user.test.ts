import {PrismaClient} from '@prisma/client'
import {DeepMockProxy, mockDeep, mockReset} from 'jest-mock-extended'
import request from 'supertest';
import {app} from '../index';
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
    it('should create new user and return true', async () => {
        const userRepository = new UserRepository(prismaMock)
        const user = {
            id: 1,
            username: 'user1',
            password: 'pass',
            firstname: "John",
            lastname: "Smith",
        }

        prismaMock.user.create.mockResolvedValue(user)

        await expect(userRepository.createUser(user.username, user.password, user.firstname, user.lastname)).resolves.toEqual(
            true
        )

    });

    it('should find defined user', async () => {
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


describe('POST /user/signup', () => {
    it('should sign up a new user when user does not exist and redirect to home', async () => {
        const newUser = {
            id: 1,
            username: 'testuser',
            password: 'Testpassword1',
            firstname: 'Test',
            lastname: 'User',
        };

        prismaMock.user.create.mockResolvedValue(newUser)

        const response = await request(app)
            .post('/user/signup')
            .send(newUser)
            .expect(302);

        expect(response.header.location).toBe('/');
    });

    it('should redirect to signup when user exist', async () => {
        const existingUser = {
            id: 1,
            username: 'existinguser',
            password: 'Testpassword1',
            firstname: 'Existing',
            lastname: 'User',
        };
        prismaMock.user.findUnique.mockResolvedValue(existingUser)

        const response = await request(app)
            .post('/user/signup')
            .send(existingUser)
            .expect(302)
            .set('Cookie', ['connect.sid=sessionid']);

        expect(response.header.location).toBe('/user/signup');
        expect(response.header['set-cookie']).toBeDefined();
    });
});
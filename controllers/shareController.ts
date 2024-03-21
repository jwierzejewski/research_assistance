import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const shareResources = async (req: Request, res: Response) =>{
    const { recipientUsername } = req.body;
    const username = res.locals.username
    console.log(req.body)
    if (username === undefined || recipientUsername === undefined) {
        return res.status(400).json({ error: 'Bad request: Missing required fields' });
    }
            const user = await prisma.user.findUnique({
                where: {
                    username: recipientUsername
                }
            })
        if(user) {

            const share = await prisma.share.create({
                data: {
                    ownerUsername: username,
                    recipientUsername: recipientUsername
                }
            });
            if (!share) {
                return res.status(400).json({error: 'Sharing failed'});
            }
        }
    return res.json({ message: 'Sharing successfully' /*, token: token*/ });
};
import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const shareItems = async (req: Request, res: Response) =>{
    const { recipientUsername, selectedItems } = req.body;
    const username = (req.session as any).username
    console.log("selectedItems "+selectedItems)
    if (username === undefined || recipientUsername === undefined || selectedItems.length<0) {
        return res.status(400).json({ error: 'Bad request: Missing required fields' });
    }
            const user = await prisma.user.findUnique({
                where: {
                    username: recipientUsername
                }
            })
        if(user) {
            for(const itemId of selectedItems) {
                console.log(itemId+" "+user.id)
                const share = await prisma.item.update({
                    where: {
                        id: parseInt(itemId)
                    },
                    data: {
                        sharedWith: { connect: {id: user.id}}
                    }
                });
                if (!share) {
                    (req.session as any).message = 'Sharing failed';
                    return res.redirect('/browse')
                }
            }
        }
    (req.session as any).message = 'Items shared successfully';
    (req.session as any).sharing = false;
    return res.redirect('/browse')
};
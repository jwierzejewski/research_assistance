import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import {IUser} from "../utils/IUser";
import {IMessage} from "../utils/IMessage";

const prisma = new PrismaClient();

export const shareItems = async (req: Request, res: Response):Promise<any> =>{
    const { recipientUsername, selectedItems } = req.body;
    const username = (req.user as IUser).username
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
                    const msg: IMessage = {text: 'Sharing failed', isError: true};
                    (req.session as any).message = msg;
                    return res.redirect('/resources/browse')
                }
            }
        }
    const msg: IMessage = {text: 'Items shared successfully', isError: false};
    (req.session as any).message = msg;
    (req.session as any).sharing = false;
    return res.redirect('/resources/browse')
};
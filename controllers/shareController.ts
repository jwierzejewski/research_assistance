import {Request, Response} from "express";
import {PrismaClient} from '@prisma/client';
import {IUser} from "../utils/IUser";
import {redirectHandler} from "../utils/redirectHandler";
import {IMySession} from "../utils/IMySession";

const prisma = new PrismaClient();

export const initSharing = async (req: Request, res: Response) => {
    (req.session as IMySession).sharing = true;
    res.redirect('/resources/browse');
}

export const shareItems = async (req: Request, res: Response): Promise<any> => {
    const {recipientUsername, selectedItems} = req.body;
    const username = (req.user as IUser).username
    console.log("selectedItems " + selectedItems)
    if (username === undefined || recipientUsername === undefined || selectedItems.length < 0) {
        return res.status(400).json({error: 'Bad request: Missing required fields'});
    }
    const user = await prisma.user.findUnique({
        where: {
            username: recipientUsername
        }
    })
    if (user) {
        for (const itemId of selectedItems) {
            console.log(itemId + " " + user.id)
            const share = await prisma.item.update({
                where: {
                    id: parseInt(itemId)
                }, data: {
                    sharedWith: {connect: {id: user.id}}
                }
            });
            if (!share) {
                return redirectHandler(req, res, '/resources/browse',
                    {text: 'Sharing failed', isError: true});
            }
        }
    }
    (req.session as IMySession).sharing = false;
    return redirectHandler(req, res, '/resources/browse',
        {text: 'Items shared successfully', isError: false});

};
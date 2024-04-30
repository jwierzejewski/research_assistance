import {Request, Response} from "express";
import {IUser} from "../utils/IUser";
import {redirectHandler} from "../utils/redirectHandler";
import {IMySession} from "../utils/IMySession";
import UserRepository from "../services/userRepository";
import ItemRepository from "../services/itemRepository";
import prisma from "../prisma/prismaClient";

const userRepository = new UserRepository(prisma)
const itemRepository = new ItemRepository(prisma)

export const initSharing = async (req: Request, res: Response) => {
    (req.session as IMySession).sharing = true;
    res.redirect('/resources/browse');
}

export const shareItems = async (req: Request, res: Response): Promise<any> => {
    const {recipientUsername, selectedItems} = req.body;
    const username = (req.user as IUser).username
    if (username === undefined || recipientUsername === undefined || selectedItems.length < 0) {
        return res.status(400).json({error: 'Bad request: Missing required fields'});
    }
    const user = await userRepository.getUser(username)
    if (user) {
        for (const itemId of selectedItems) {
            if (!itemRepository.shareItem(parseInt(itemId), user.id)) {
                return redirectHandler(req, res, '/resources/browse',
                    {text: 'Sharing failed', isError: true});
            }
        }
    }
    (req.session as IMySession).sharing = false;
    return redirectHandler(req, res, '/resources/browse',
        {text: 'Items shared successfully', isError: false});

};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getItem = exports.addItem = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const addItem = async (req, res) => {
    const { title, category, author, year, genre, data, link, ownerEmail } = req.body;
    const newItem = await prisma.item.create({
        data: {
            title: title,
            category: category,
            author: author,
            year: year,
            genre: genre,
            data: data,
            link: link,
            ownerEmail: ownerEmail
        }
    });
    if (newItem) {
        res.json({ message: "item add successful" });
    }
    else {
        res.status(400).json({ error: "Item not added" });
    }
};
exports.addItem = addItem;
const getItem = async (req, res) => {
    const { title, category, author, year, genre, email } = req.body;
    const Items = await prisma.item.findMany({
        where: {
            title: title,
            category: category,
            author: author,
            year: year,
            genre: genre
        }
    });
    if (!Items) {
        res.json({ Items });
    }
    else {
        res.status(400).json({ error: "Item not found" });
    }
};
exports.getItem = getItem;

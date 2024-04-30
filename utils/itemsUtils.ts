import {Request} from "express";
import {IUser} from "./IUser";
import {Prisma} from "@prisma/client";

export function generateWhere(req:Request) {
    const {title, categoryId, author, year, genre} = req.body;
    let {itemsStatus} = req.body;

    let username;
    if (req.isAuthenticated()) {
        username = (req.user as IUser).username
    } else {
        itemsStatus = "public"
    }

    let where: Prisma.ItemWhereInput = {};
    if (title !== undefined && title != "") {
        where.title = {
            contains: title
        };
    }
    if (categoryId !== undefined && categoryId != "") {
        where.categoryId = parseInt(categoryId)
    }

    if (author !== undefined && author != "") {
        where.author = {
            contains: author
        };
    }

    if (year !== undefined && year != "") {
        where.year = parseInt(year);
    }

    if (genre !== undefined && genre != "") {
        where.genre = {
            contains: genre
        };
    }
    if (itemsStatus == "all") {
        where.OR = [
            {public: true},
            {AND: [{ownerUsername: username}, {public: false}]},
            {sharedWith: {some: {username: username}}}
        ];
    } else if (itemsStatus == "public") {
        where.public = true
    } else if (itemsStatus == "private") {
        where.OR = [
            {AND: [{ownerUsername: username}, {public: false}]},
            {AND: [{sharedWith: {some: {username: username}}}, {public: false}]}
        ];
    } else if (itemsStatus == "own") {
        where.ownerUsername = username
    } else if (itemsStatus == "own private") {
        where.AND = [{ownerUsername: username}, {public: false}]
    }
    return where;
}
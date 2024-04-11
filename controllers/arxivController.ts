import {NextFunction, Request, Response} from "express";
import { parseString } from 'xml2js';

export const getFromArxiv = async (req: Request, res: Response, next: NextFunction) => {
    const {title, author} = req.body;

    let searchQuery = ""
    if(title !== undefined && title != "")
    {
        searchQuery+=title;
    }
    if(author !==undefined && author !="")
    {
        if(searchQuery != "")
        {
            searchQuery+="+AND+";
        }
        searchQuery+=author;
    }
    let url = "http://export.arxiv.org/api/query?search_query="
    url+=searchQuery


    const response = await fetch(url);
    var body = await response.text()

    let data;

    parseString(body, (err, result) => {
        if (err) {
            console.error('Error parsing XML:', err);
        } else {
            data=result;
        }
    });

    if (data!.feed!.entry!.length>0) {
        (req.session as any).arxivItems = data!.feed!.entry
        return res.redirect('/getFromArxiv');
    } else {
        (req.session as any).message = "Documents not found"
        return res.redirect('/getFromArxiv');
    }
};
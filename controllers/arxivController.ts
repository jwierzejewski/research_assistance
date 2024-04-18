import {Request, Response} from "express";
import {parseString} from 'xml2js';
import {validationErrorHandler} from "../utils/errorHandler";
import {redirectHandler} from "../utils/redirectHandler";
import {IMySession} from "../utils/IMySession";

function createQueryUrl(title: string, author: string) {
    let searchQuery = ""
    if (title !== undefined && title != "") {
        searchQuery += title;
    }
    if (author !== undefined && author != "") {
        if (searchQuery != "") {
            searchQuery += "+AND+";
        }
        searchQuery += author;
    }
    let url = "http://export.arxiv.org/api/query?search_query="
    url += searchQuery
    return url;
}

function parseXMLData(body: string) {
    let data;
    parseString(body, (err, result) => {
        if (err) {
            throw err;
        }
        data = result
    });
    return data
}

export const getFromArxiv = async (req: Request, res: Response) => {
    validationErrorHandler(req, res, "/resources/getFromArxiv");
    const {title, author} = req.body;

    let url = createQueryUrl(title, author);

    const response = await fetch(url);
    var body = await response.text()

    const data: any = parseXMLData(body);
    console.log(data)

    if (data!.feed!.entry!.length > 0) {
        (req.session as IMySession).arxivItems = data!.feed!.entry
        return res.redirect('/resources/getFromArxiv');
    } else {
        return redirectHandler(req, res, '/resources/getFromArxiv',
            {text: 'Documents not found', isError: true});
    }
};

export const browseInArxivPage = async (req: Request, res: Response) => {
    res.render('arxiv', {
        title: "Research assistance - Get From Arxiv",
        message: (req.session as IMySession).message,
        arxivItems: (req.session as IMySession).arxivItems,
        formData: (req.session as IMySession).formData
    });
    delete (req.session as IMySession).message;
    delete (req.session as IMySession).formData;
    delete (req.session as IMySession).arxivItems;
}
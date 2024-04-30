import {Request, Response} from "express";
import {validationErrorHandler} from "../utils/errorHandler";
import {redirectHandler} from "../utils/redirectHandler";
import {IMySession} from "../utils/IMySession";
import {createQueryUrl, parseXMLData} from "../utils/arxivUtils";



export const getFromArxiv = async (req: Request, res: Response) => {
    validationErrorHandler(req, res, "/resources/getFromArxiv");
    const {title, author} = req.body;

    let url = createQueryUrl(title, author);

    const response = await fetch(url);
    var body = await response.text()

    const data: any = parseXMLData(body);

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
        loggedIn: req.isAuthenticated(),
        arxivItems: (req.session as IMySession).arxivItems,
        formData: (req.session as IMySession).formData
    });
    delete (req.session as IMySession).message;
    delete (req.session as IMySession).formData;
    delete (req.session as IMySession).arxivItems;
}
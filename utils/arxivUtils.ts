import {parseString} from "xml2js";

export function createQueryUrl(title: string, author: string) {
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

export function parseXMLData(body: string) {
    let data;
    parseString(body, (err, result) => {
        if (err) {
            throw err;
        }
        data = result
    });
    return data
}
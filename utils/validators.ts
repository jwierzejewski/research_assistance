import {body, oneOf} from "express-validator";
import validator from "validator";

const passwordMsg = 'Password must be at least 8 characters contain an uppercase and lowercase letter and number'
export const signupValidate = [body('username').isLength({min: 3, max: 20})
    .withMessage("Username should be 3-20 characters.")
    .trim().escape(), body('firstname').isLength({min: 2, max: 30})
    .withMessage("Firstname should be 2-30 characters.")
    .trim().escape(), body('lastname').isLength({min: 2, max: 30})
    .withMessage("Lastname should be 2-30 characters.")
    .trim().escape(), body('password').isLength({min: 8}).withMessage(passwordMsg).bail()
    .matches('[0-9]').withMessage(passwordMsg).bail()
    .matches('[a-z]').withMessage(passwordMsg).bail()
    .matches('[A-Z]').withMessage(passwordMsg).bail()]

export const loginValidate = [body('username')
    .isLength({min: 3, max: 20}).trim().escape()]

let currentYear = new Date().getFullYear();
export const addResourceValidate = [body('title').isLength({
    min: 3,
    max: 50
}).withMessage("Title should be 3-50 characters.").escape(), body('genre').isLength({
    min: 3,
    max: 20
}).withMessage("Genre should be 3-20 characters.").escape(), body('author').isLength({
    min: 7,
    max: 50
}).withMessage("Author should be 7-50 characters.").escape(), body('year').isInt({
    min: 1500,
    max: currentYear
}).withMessage(`Publication Year should be between 1500 and ${currentYear}`).escape(), body('categoryId').isInt().escape(),]

export const arxivValidate = [
    body('title').escape(),
    body('author').escape(),
    oneOf([body('title').notEmpty(), body('author').notEmpty()],{
        message: 'At least one field should be not empty',
    })
]

export const browseValidate = [body('title').trim().escape(), body('genre').escape(), body('author').escape(), body('year').custom(value => {
    if (!validator.isEmpty(value) && !validator.isInt(value)) {
        throw new Error('year must be an integer');
    }
    return true;
}).escape(), body('categoryId').custom(value => {
    if (!validator.isEmpty(value) && !validator.isInt(value)) {
        throw new Error('categoryId must be an integer');
    }
    return true;
}).escape()]
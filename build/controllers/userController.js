"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = exports.login = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const login = async (req, res) => {
    console.log("login");
    const { email, password } = req.body;
    console.log(req.body);
    if (email !== undefined && password !== undefined) {
        console.log(email);
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
    }
    else {
        return res.status(400).json({ error: 'Bad request' });
    }
    res.json({ message: 'Logged in successfully' /*, token: token*/ });
};
exports.login = login;
const signup = async (req, res) => {
    console.log("signup");
    console.log(req.body);
    const { email, password, firstname, lastname } = req.body;
    if (email !== undefined && password !== undefined && firstname !== undefined && lastname !== undefined) {
        console.log(email);
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (!user) {
            const userSignup = await prisma.user.create({
                data: {
                    email: email,
                    password: password,
                    firstname: firstname,
                    lastname: lastname,
                }
            });
            if (!userSignup)
                res.json({ message: 'Signup successfully' });
        }
        else {
            return res.status(400).json({ error: 'User exist' });
        }
    }
    else {
        return res.status(400).json({ error: 'Bad request' });
    }
};
exports.signup = signup;

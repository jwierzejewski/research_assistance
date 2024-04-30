"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : {"default": mod};
};
Object.defineProperty(exports, "__esModule", {value: true});
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const userController_1 = require("./controllers/userController");
const itemController_1 = require("./controllers/itemController");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.post("/login", userController_1.login);
app.post("/signup", userController_1.signup);
app.post("/addItem", itemController_1.addItem);
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

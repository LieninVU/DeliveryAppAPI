const express = require("express");
require("dotenv").config();
const process = require("node:process");
const jwt = require("jsonwebtoken");
const bycrypt = require("bcryptjs");
const postgres = require("postgres");

const app = express();

app.use(express.json());


app.get('/hi', (req, res) => {
    res.send("hello world");
})


app.listen(process.env.PORT || "3000", () => {
    console.log("Server is Running on PORT: "+ process.env.PORT);
});

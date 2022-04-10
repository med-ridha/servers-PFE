import 'dotenv/config';
import express from 'express'
import cookie_parser from 'cookie-parser'
import admin from '../database/Dao/adminDao.js'
import path from 'path'
let __dirname = path.resolve(path.dirname(''));

let app = express();
app.use(express.json());
app.use(cookie_parser('1234'))
let PORT = process.env.ADMINPORT || 1337;

app.listen(PORT, () => {
    console.log(`admin server listening on PORT ${PORT}`);
})

app.get("/login", (req, res) => {
    let cookie = req.signedCookies.user
    if (!cookie) {
        res.sendFile("/client/login.html", { root: __dirname })
    }else{
        res.sendFile("/client/dashboard.html", { root: __dirname })
    }
})

app.get("/dashboard", (req, res) => {
    let cookie = req.signedCookies.user
    if (!cookie) {
        res.sendFile("/client/login.html", { root: __dirname })
    }else{
        console.log(cookie)
        res.sendFile("/client/dashboard.html", { root: __dirname })
    }
})

app.post("/login", async (req, res) => {
    let result = await admin.login(req.body)
    if (result.result === "welcome"){
        res.cookie("user", result.value.email, { signed: true })
        res.status(200).json(result);
    }else{ 
        res.json(result);
    }
})

app.post("/createAdmin", async (req, res) => {
    let result = await admin.createAdmin(req.body);
    res.json(result);
})

app.get("/logout", (req, res) => {
    res.clearCookie("user");
    res.sendFile("/client/login.html", { root: __dirname })
})

import 'dotenv/config';
import express from 'express'
import admin from '../database/module/admin.js'
import path from 'path'
let __dirname = path.resolve(path.dirname(''));

let app = express();
app.use(express.json());
let PORT = process.env.ADMINPORT || 1337;

app.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}`);
})

app.get("/dashboard", (req, res) => {
    res.sendFile("/client/dashboard.html", { root: __dirname })
})

app.post("/login", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    admin.find()
})

app.post("/createAdmin", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    admin.find()
})

import 'dotenv/config';
import express from 'express'
import firebase from './firebase/service.js'
import mongoose from './database/mongoose.js'
import userDao from './database/Dao/userDao.js'
import path from 'path'
import './admin/main.js'
let __dirname = path.resolve(path.dirname(''));

let app = express();
app.use(express.json());
let PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}`);
})


app.get("/sendNotif", (req, res) => {
    res.sendFile("./client/notifications.html", { root: __dirname });
})

app.post("/login", async (req, res) => {
    let result = await userDao.login(req.body)
    res.json(result)
})

app.post("/checktoken", async (req, res) => {
    let result = await userDao.checkToken(req.body)
    res.json(result)
})

app.post("/notification/push", async (req, res) => {
    await firebase.sendToTopic(req.body);
    res.json({ "res": "ok" });
})

app.post("/createUser", async (req, res) => {
    let result = await userDao.createUser(req.body)
    res.json(result);
})

app.post("/createDocument", async (req, res) => {
    //create document 
    res.json({ "res": "ok" });
})

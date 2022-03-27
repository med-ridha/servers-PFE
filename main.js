import 'dotenv/config';
import express from 'express'
import firebase from './firebase/service.js'
import mongoose from './database/mongoose.js'
import user from './database/module/user.js'
import path from 'path'
let __dirname = path.resolve(path.dirname(''));

let app = express();
app.use(express.json());
let PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}`);
})

app.get("/", (req, res) => {
    res.sendFile("./client/notifications.html", { root: __dirname });
})

app.get("/user/:id", (req, res) => {
    // get user by id
})

app.post("/notification/push", async (req, res) => {
    await firebase.sendToTopic(req.body);

    res.json({ "res": "ok" });
})

app.post("/createUser", async (req, res) => {
    //create user
    let name = req.body.name;
    let surname = req.body.surname;
    let phoneNumber = req.body.phoneNumber;
    let email = req.body.email;
    let password = req.body.password;

    (new user({
        name: name,
        surname: surname,
        phoneNumber: phoneNumber,
        email: email,
        password: password
    })).save()
        .then(user => {
            res.status(200).json({
                "result": "ok",
                "value": user
            });
        })
        .catch((error) => {
            console.error(error);
            res.status(300).json({
                "result": "error",
                "value": error
            });
        });

})

app.post("/createDocument", async (req, res) => {
    //create document 
    res.json({ "res": "ok" });
})

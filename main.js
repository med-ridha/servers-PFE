import 'dotenv/config';
import './database/mongoose.js'
import './admin/main.js'
import express from 'express'
import userDao from './database/Dao/userDao.js'
import collabDao from './database/Dao/collabDao.js'

let app = express();
app.use(express.json());
let PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`app server listening on PORT ${PORT}`);
})



app.post("/login", async (req, res) => {
    let result = await userDao.login(req.body)
    res.json(result)
})

app.post("/checktoken", async (req, res) => {
    let result = await userDao.checkToken(req.body)
    res.json(result)
})


app.post("/createUser", async (req, res) => {
    let result = await userDao.createUser(req.body)
    if (result.status === "success"){
        res.status(200).json(result);
    }else{
        if (result.value.code === 11000){
            res.status(401).json(result);
        }else {
            res.status(400).json(result);
        }
    }
})

app.post("/updateUser", async (req, res) => {
    let result = await userDao.updateUser(req.body)
    res.json(result);
})

app.post("/addToCollab", async (req, res) => {
    let result = await collabDao.addToCollab(req.body)
    res.json(result);
})

app.post("/createCollab", async (req, res) => {
    let result = await collabDao.createCollab(req.body)
    res.json(result);
})

app.post("/createDocument", async (req, res) => {
    //create document 
    res.json({ "res": "ok" });
})

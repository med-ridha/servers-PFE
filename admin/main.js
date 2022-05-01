import 'dotenv/config';
import express from 'express'
import firebase from '../firebase/service.js'
import admin from '../database/Dao/adminDao.js'
import path from 'path'
import cors from 'cors'
import userDao from '../database/Dao/userDao.js';
import documentDao from '../database/Dao/documentDao.js'
import modulesDao from '../database/Dao/moduleDao.js'
import collabDao from '../database/Dao/collabDao.js'
import abonnDao from '../database/Dao/abonnDao.js'
import jwt from 'jsonwebtoken'

let app = express();
app.use(express.json({ limit: '5mb' }));
app.use(cors());
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

let PORT = process.env.ADMINPORT || 1337;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`admin server listening on PORT ${PORT}`);
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.status(401).json({ "result": "error" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ "result": "error" });

    req.user = user
    next()
  })
}


app.post("/notification/sendToTopic", async (req, res) => {
  await firebase.sendToTopic(req.body);
  res.json({ "res": result });
})

app.post("/notification/send", async (req, res) => {
  let result = await firebase.send(req.body);
  res.json({ "res": result });
})



app.post("/auth/login", async (req, res) => {
  let result = await admin.login(req.body)
  if (result.result === "welcome") {
    let email = { email: result.value.email };
    const accessToken = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET)
    res.status(200).json({ result: "success", token: accessToken, userToReturn: result.value });
  } else {
    res.status(200).json({ result: result.value });
  }
})


app.post("/createAdmin", async (req, res) => {
  let result = await admin.createAdmin(req.body);
  res.json(result);
})

app.post("/documents/checkValid", authenticateToken, async (req, res) => {
  let result = await documentDao.checkDocument(req.body)
  res.status(200).json(result)
})

app.post('/auth/checkToken', authenticateToken, async (req, res) => {
  res.json({ "result": req.user })
})

app.get('/users/all', authenticateToken, async (_, res) => {
  let result = await userDao.getAll();
  if (result.result = "success") {
    res.status(200).json(result.value);
  } else {
    res.status(404).json(result.value);
  }
})

app.get('/documents/one/:id', authenticateToken, async (req, res) => {
  let result = await documentDao.getOne(req.params.id);
  if (result.result = "success") {
    res.status(200).json(result.value);
  } else {
    res.status(404).json(result.value);
  }
})

app.get('/users/one/abonn/:email', authenticateToken, async (req, res) => {
  let result = await abonnDao.getAbonn(req.params.email);
  if (result.result = "success") {
    res.status(200).json(result.value);
  } else {
    res.status(404).json(result.value);
  }
})

app.get('/users/one/favorit/:email', authenticateToken, async (req, res) => {
  let result = await userDao.getDocumentFavored(req.params.email);
  if (result.result = "success") {
    res.status(200).json(result.value);
  } else {
    res.status(404).json(result.value);
  }
})

app.get('/users/one/collabs/:email', authenticateToken, async (req, res) => {
  let result = await collabDao.getCollabs(req.params.email);
  if (result.result = "success") {
    res.status(200).json(result.value);
  } else {
    res.status(404).json(result.value);
  }
})

app.get('/users/one/searchH/:email', authenticateToken, async (req, res) => {
  let result = await userDao.getSearchH(req.params.email);
  if (result.result = "success") {
    res.status(200).json(result.value);
  } else {
    res.status(404).json(result.value);
  }
})

app.get('/users/one/:id', authenticateToken, async (req, res) => {
  let result = await userDao.getOne(req.params.id);
  if (result.result = "success") {
    res.status(200).json(result.value);
  } else {
    res.status(404).json(result.value);
  }
})

app.post('/modules/add', async (req, res) => {
  let result = await modulesDao.addModule(req.body);
  res.status(200).json(result)
})

app.delete('/users/delete', authenticateToken, async (req, res) => {
  let result = await userDao.deleteUser(req.body);
  if (result.result = "success") {
    res.status(200).json(result.value);
  } else {
    res.status(404).json(result.value);
  }
})

app.delete('/documents/delete', authenticateToken, async (req, res) => {
  let result = await documentDao.deleteDocument(req.body);
  if (result.result = "success") {
    res.status(200).json(result.value);
  } else {
    res.status(404).json(result.value);
  }
})

app.post('/documents/add', authenticateToken, async (req, res) => {
  let result = await documentDao.addDocument(req.body);
  if (result.result = "success") {
    res.status(200).json(result.value);
  } else {
    res.status(404).json(result.value);
  }
})

app.put('/documents/update', authenticateToken, async (req, res) => {
  let result = await documentDao.updateDocument(req.body);
  if (result.result = "success") {
    res.status(200).json(result.value);
  } else {
    res.status(404).json(result.value);
  }
})

app.get('/search/all', authenticateToken, async (_, res) => {
  let result = await documentDao.getSearchAll();
  if (result.result = "success") {
    res.status(200).json(result.value);
  } else {
    res.status(404).json(result.value);
  }
})

app.get('/documents/all', authenticateToken, async (_, res) => {
  let result = await documentDao.getAll();
  if (result.result = "success") {
    res.status(200).json(result.value);
  } else {
    res.status(404).json(result.value);
  }
})

app.get('/modules/getAll', async (req, res) => {
  let result = await modulesDao.getAll()
  if (result.result == "success"){
    res.status(200).json(result.value)
  }else {
    res.status(500).json(result.value)
  }
})

app.get('/modules/getModuleById/:id',authenticateToken, async (req, res) => {
  let result = await modulesDao.getModuleById(req.params.id)
  res.status(200).json(result.value)
})


app.get('/modules/getModule/:id', async (req, res) => {
  let result = await modulesDao.getModule(req.params.id)
  res.status(200).json(result.value)
})

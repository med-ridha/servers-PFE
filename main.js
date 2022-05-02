import 'dotenv/config';
import './database/mongoose.js'
import './admin/main.js'
import express from 'express'
import userDao from './database/Dao/userDao.js'
import collabDao from './database/Dao/collabDao.js'
import abonnDao from './database/Dao/abonnDao.js'
import modulesDao from './database/Dao/moduleDao.js'
import documentDao from './database/Dao/documentDao.js'

let app = express();
app.use(express.json());
let PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`app server listening on PORT ${PORT}`);
})

app.get('/checkStatus', (_, res) => {
  res.status(200).json({ "result": "success" });
})

app.get('/documents/search', async (req, res) => {
  let result = await documentDao.search(req.query);
  if (result.result == "success") {
    res.status(200).json(result.value);
  } else {
    res.status(500).json(result.value);
  }
})



app.post('/modules/cat/latest/:duree', async (req, res) => {
  let result = await modulesDao.getCategoriesLatest(req.params.duree, req.body);
  if (result.result == "success") {
    res.status(200).json(result.value);
  } else {
    res.status(500).json(result.value);
  }
})

app.get('/modules/latest/:duree', async (req, res) => {
  let result = await modulesDao.getModulesLatest(req.params);
  if (result.result == "success") {
    res.status(200).json(result.value);
  } else {
    res.status(500).json(result.value);
  }
})
app.get("/users/getListFavored/:email", async (req, res) => {
  let result = await userDao.getListFavored(req.params.email)
  if (result.result === "success") {
    res.status(200).json(result.value)
  } else {
    if (result.value.code === 4) {
      res.status(401).json(result.value);
    } else {
      res.status(400).json(result.value);
    }
  }
})

app.post("/documents/removeFromFavorite", async (req, res) => {
  let result = await userDao.removeDocFromFav(req.body)
  if (result.result === "success") {
    res.status(200).json(result.value)
  } else {
    if (result.value.code === 4) {
      res.status(401).json(result.value);
    } else {
      res.status(400).json(result.value);
    }
  }
})

app.post("/documents/addToFavorite", async (req, res) => {
  let result = await userDao.addDocToFav(req.body)
  if (result.result === "success") {
    res.status(200).json(result.value)
  } else {
    if (result.value.code === 4) {
      res.status(401).json(result.value);
    } else {
      res.status(400).json(result.value);
    }
  }
})

app.post("/users/createAbonn", async (req, res) => {
  let result = await abonnDao.createAbonn(req.body)
  if (result.result === "success") {
    res.status(200).json(result.value)
  } else {
    if (result.value.code === 4) {
      res.status(401).json(result.value);
    } else {
      res.status(400).json(result.value);
    }
  }
})

app.get('/modules/getAll', async (_, res) => {
  let result = await modulesDao.getAll()
  if (result.result == "success") {
    res.status(200).json(result.value)
  } else {
    res.status(500).json(result.value)
  }
})

app.post("/deleteCollab", async (req, res) => {
  let result = await collabDao.deleteCollab(req.body)
  if (result.result === "success") {
    res.status(200).json(result.value)
  } else {
    if (result.value.code === 401) {
      res.status(401).json(result.value);
    } else {
      res.status(400).json(result.value);
    }
  }
})

app.post("/checkEmail", async (req, res) => {
  let result = await userDao.checkEmail(req.body)
  if (result.result === "success") {
    res.status(200).json(result)
  } else {
    if (result.value.code === 401) {
      res.status(401).json(result);
    } else {
      res.status(400).json(result);
    }
  }
})

app.post("/newPassword", async (req, res) => {
  let result = await userDao.newPassword(req.body)
  if (result.result === "success") {
    res.status(200).json(result)
  } else {
    if (result.value.code === 401) {
      res.status(401).json(result);
    } else {
      res.status(400).json(result);
    }
  }
})

app.post("/updatePassword", async (req, res) => {
  let result = await userDao.updatePassword(req.body)
  if (result.result === "success") {
    res.status(200).json(result)
  } else {
    if (result.value.code === 4) {
      res.status(401).json(result);
    } else {
      res.status(400).json(result);
    }
  }
})

app.post("/verifyEmail", async (req, res) => {
  let result = await userDao.verifyEmail(req.body)
  if (result.result === "success") {
    res.status(200).json(result)
  } else {
    if (result.value.code === 11000) {
      res.status(401).json(result);
    } else {
      res.status(400).json(result);
    }
  }
})


app.post("/checkToken", async (req, res) => {
  let result = await userDao.login(req.body)
  if (result.result === "success") {
    let data = result.value;
    res.status(200).json(data);
  } else {
    if (result.value.code === 4) {
      res.status(401).json(result);
    } else {
      res.status(400).json(result);
    }
  }
})

app.post("/login", async (req, res) => {
  let result = await userDao.createLoginToken(req.body)
  if (result.result === "success") {
    res.status(200).json(result);
  } else {
    if (result.value.code === 401) {
      res.status(401).json(result);
    } else if (result.value.code === 402) {
      res.status(402).json(result);
    } else {
      res.status(400).json(result);
    }
  }
})


app.post("/createUser", async (req, res) => {
  let result = await userDao.createUser(req.body)
  console.log(result.value);
  if (result.result === "success") {
    res.status(200).json(result.value)
  } else {
    if (result.value.code === 4) {
      res.status(401).json(result);
    } else {
      res.status(400).json(result);
    }
  }
})

app.post("/updateUser", async (req, res) => {
  let result = await userDao.updateUser(req.body)
  if (result.result === "success") {
    res.status(200).json(result.value)
  } else {
    if (result.value.code === 4) {
      res.status(401).json(result);
    } else {
      res.status(400).json(result);
    }
  }
})

app.post("/addToCollab", async (req, res) => {
  let result = await collabDao.addToCollab(req.body)
  if (result.result === "success") {
    res.status(200).json(result.value)
  } else if (result.value.code === 5) {
    res.status(405).json(result.value)
  } else if (result.value.code === 404) {
    res.status(404).json(result.value)
  } else if (result.value.code === 9) {
    res.status(404).json(result.value)
  } else {
    res.status(500).json(result.value)
  }
})

app.post("/createCollab", async (req, res) => {
  let result = await collabDao.createCollab(req.body)
  if (result.result == "success") {
    res.status(200).json(result.value);
  } else {
    res.status(404).json(result.value)
  }
})

app.get("/users/abonns/:email", async (req, res) => {
  let result = await abonnDao.getAbonn(req.params.email);
  console.log(result);
  if (result.result === "success") {
    res.status(200).json(result.value);
  } else {
    res.status(400).json(result.value);
  }
})

app.get("/getCollabs/:email", async (req, res) => {
  let result = await collabDao.getCollabs(req.params.email);
  if (result.result === "success") {
    res.status(200).json(result.value);
  } else {
    res.status(400).json(result.value);
  }
})

app.post("/documents/getSome", async (req, res) => {
  let result = await documentDao.getSome(req.body);
  if (result.result === "success") {
    res.status(200).json(result.value);
  } else {
    res.status(400).json(result.value);
  }
})

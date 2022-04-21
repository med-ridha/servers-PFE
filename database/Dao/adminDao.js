import bcrypt from 'bcrypt'
import admin from '../module/admin.js'

let saltRounds = 9;
let adminDao = {
  login: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let password = body.password;
      let userResult = await admin.findOne({ email: email });
      if (userResult) {
        let hash = userResult.password;
        let result = await bcrypt.compare(password, hash);
        if (result) {
          let data = {
            _id: userResult._id,
            email: userResult.email,
            name: userResult.name,
            surname: userResult.surname
          }
          res({ "result": "welcome", "value": data })
        } else {
          rej({ "result": "error", "value": { code: 400, message: "wrong password" } })
        }
      } else {
        rej({ "result": "error", "value": { code: 400, message: "wrong email" } })
      }
    })

    try {
      let result = await promise;
      return result;
    } catch (error) {
      return error;
    }
  },
  createAdmin: async function(body) {
    let promise = new Promise((res, rej) => {

      let email = body.email;
      let name = body.name;
      let surname = body.surname;
      let password = body.password;

      bcrypt.hash(password, saltRounds).then(hash => {
        (new admin({
          email: email,
          name: name,
          surname: surname,
          password: hash,
        })).save()
          .then(_ => {
            let result = {
              result: "success",
            }
            res(result);
          })
          .catch((error) => {
            let result = {
              result: "error",
              value: error
            }
            rej(result);
          });
      })
    })
    try {
      let result = await promise;
      return result;
    } catch (error) {
      return error;
    }
  },


}

export default adminDao;

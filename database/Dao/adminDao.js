import bcrypt from 'bcrypt'
import admin from '../module/admin.js'
import tokenDao from './tokenDao.js'

let saltRounds = 9;
let adminDao = {
  checkResetToken: async function(body) {
    let promise = new Promise(async (res, rej) => {
      try {
        let result = await tokenDao.checkToken(body)
        if (result.result === "success") {
          let newHash = await bcrypt.hash(body.password, saltRounds)
          let update = await admin.updateOne({ email: body.email }, { password: newHash })
          if (update.modifiedCount > 0) {
            res({
              result: "success",
              value: {
                code: 0,
                message: result
              }
            })
          } else {
            rej({
              result: "error",
              value: {
                code: 3,
                message: "something went wrong, couldn't update admin"
              }
            });
          }
        } else {
          rej({
            result: "error",
            value: {
              code: 5,
              message: "invalid token"
            }
          });
        }
      } catch (error) {
        console.log(error);
        rej({
          result: "error",
          value: {
            code: 5,
            message: error
          }
        });
      }
    })

    try {
      let result = await promise;
      return result;
    } catch (error) {
      return error;
    }
  },
  checkEmail: async function(email) {
    let promise = new Promise(async (res, rej) => {
      try {
        let oneAdmin = await admin.findOne({ email: email });
        if (!oneAdmin) {
          rej({
            result: "error",
            value: {
              code: 4,
              message: "email not found"
            }
          });
          return;
        }
        let result = await tokenDao.createToken(email)
        if (result.result == "success") {
          res({
            result: "success",
            value: {
              code: 0,
              message: "nice"
            }
          })
        } else {
          res(
            {
              result: "error",
              value: {
                code: 2,
                message: "not nice"
              }
            }
          )
        }
      } catch (error) {
        rej({
          result: "error",
          value: {
            code: 5,
            message: error
          }
        });
      }
    })

    try {
      let result = await promise;
      return result;
    } catch (error) {
      return error;
    }
  },
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

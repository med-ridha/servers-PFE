import bcrypt from 'bcrypt'
import user from '../module/user.js'
import tokenDao from '../Dao/tokenDao.js'

let saltRounds = 9;

let userDao = {

  checkEmail: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let userResult = await user.findOne({ email: email })
      if (userResult) {
        let token = await tokenDao.createToken(email);
        try {
          res({
            "result": "success",
            "vaule": token
          });
        } catch (err) {
          rej({
            "result": "error",
            "value": error
          });
        }
      } else {
        rej({
          "result": "error",
          "value": {
            "code": 401,
            "message": "email doesn't exists"
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
  newPassword: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let newPassword = body.newPassword;
      let userResult = await user.findOne({ email: email });
      if (userResult) {
        let hash = await bcrypt.hash(newPassword, saltRounds);
        let update = await user.updateOne({ email: email }, { password: hash });
        res({
          "result": "success",
          "value": update
        })
      } else {
        rej({
          "result": "error",
          "value": {
            code: 401,
            message: "email doesn't exists"
          }
        })
      }
    })

    try {
      let result = await promise;
      return result;
    } catch (error) {
      return error;
    }
  },

  updatePassword: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let password = body.password;
      let newPassword = body.newPassword;
      try {
        let oldUser = await user.findOne({ email: email })
        let hash = oldUser.password;
        let auth = await bcrypt.compare(password, hash);
        if (auth) {
          let newHash = await bcrypt.hash(newPassword, saltRounds);
          let data = {
            password: newHash
          }
          let update = await user.updateOne({ email: email }, data);
          res({
            "result": "success",
            "value": update
          })
        } else {
          rej({
            "result": "error",
            "value": {
              "code": 4,
              "message": "wrong password"
            }
          })
        }
      } catch (err) {
        rej({
          "result": "error",
          "value": {
            "code": 2,
            "message": err
          }
        })
      }
    })
    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },

  updateUser: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let password = body.password;
      try {
        let oldUser = await user.findOne({ email: email })
        let hash = oldUser.password;
        let auth = await bcrypt.compare(password, hash);
        if (auth) {
          let data = {
            name: body.name || oldUser.name,
            surname: body.surname || oldUser.surname,
            numFiscal: body.numFiscal || oldUser.numFiscal,
            phoneNumber: body.phoneNumber || oldUser.phoneNumber,
            codeVoucher: body.codeVoucher || oldUser.coudeVoucher,
            nomStructure: body.nomStructure || oldUser.nomStructure,
            phoneStructure: body.phoneStructure || oldUser.phoneStructure,
            adressStructure: body.adressStructure || oldUser.adressStructure
          }
          let update = await user.updateOne({ email: email }, data);
          res({
            "result": "success",
            "value": update
          })
        } else {
          rej({
            "result": "error",
            "value": {
              "code": 4,
              "message": "wrong password"
            }
          })
        }
      } catch (err) {
        rej({
          "result": "error",
          "value": {
            "code": 2,
            "message": "wrong password"
          }
        })
      }
    })
    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },

  createLoginToken: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let password = body.password;
      let userResult = await user.findOne({ email: email });
      if (userResult) {
        let hash = userResult.password;
        let result = await bcrypt.compare(password, hash);
        if (result) {
          let token = await tokenDao.createToken(email);
          console.log(token);
          res({
            "result": "success",
            "value": {
              "code": 200
            }
          })
        } else {
          rej({
            "result": "error",
            "value": {
              code: 402,
              message: "wrong password"
            }
          })
        }
      } else {
        rej({
          "result": "error",
          "value": {
            code: 401,
            message: "email doesn't exists"
          }
        })
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
      let notifId = body.notifId;
      let userResult = await user.findOne({ email: email });
      if (userResult) {
        let r = await tokenDao.checkToken(body);
        if (r.result == "success") {
          if (notifId)
            await user.updateOne({ email: email }, { notifId: notifId });
          res({
            "result": "success",
            "value": userResult
          })
        } else {
          rej({
            "result": "error",
            "value": "invalid token"
          })
        }
      } else {
        rej({
          "result": "error",
          "value": "email doesn't exists"
        })
      }
    })

    try {
      let result = await promise;
      return result;
    } catch (error) {
      return error;
    }
  },

  verifyEmail: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let userResult = await user.findOne({ email: email })
      if (!userResult) {
        try {
          let token = await tokenDao.createToken(email);
          res({
            "result": "success",
            "vaule": token
          });
        } catch (err) {
          rej({
            "result": "error",
            "value": error
          });
        }
      } else {
        rej({
          "result": "error",
          "value": {
            "code": 11000,
            "message": "email existe deja"
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

  createUser: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let r = await tokenDao.checkToken(body);
      if (r.result === "success") {
        let email = body.email;
        let name = body.name;
        let surname = body.surname;
        let phoneNumber = body.phoneNumber;
        let password = body.password;
        let nomStructure = body.nomStructure;
        let phoneStructure = body.phoneStructure;
        let adressStructure = body.adressStructure;
        let numFiscal = body.numFiscal;
        let newsletter = body.newsletter;
        let notifId = body.notifId;
        bcrypt.hash(password, saltRounds).then(hash => {
          (new user({
            email: email,
            name: name,
            surname: surname,
            phoneNumber: phoneNumber,
            password: hash,
            nomStructure: nomStructure,
            phoneStructure: phoneStructure,
            numFiscal: numFiscal,
            adressStructure: adressStructure,
            newsletter: newsletter,
            notifId: notifId
          })).save()
            .then(result => {
              res({
                "result": "success",
                "value": result
              });
            })
            .catch((error) => {
              rej({
                "result": "error",
                "value": error
              });
            });
        })
      } else {
        rej({
          "result": "error",
          "value": {
            "code": 4,
            "message": "invalid token"
          }
        })
      }
    })
    try {
      let result = await promise;
      return result;
    } catch (error) {
      return error;
    }
  },
}

export default userDao

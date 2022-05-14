import collab from '../module/collab.js'
import user from '../module/user.js';
import moment from 'moment'

let collabDao = {
  getCollabs: async function(collabId) {
    let promise = new Promise(async (res, rej) => {
      try {
        let collabs = await collab.findOne({ _id: collabId });
        let listUsers = collabs.listUsers;
        if (listUsers.length == 0) {
          res({
            "result": "success",
            "value": {
              code: 0,
              message: {
                "collab": collabs,
                "listUsers": collabs.listUsers,
              }
            }
          })
          return;
        }
        let bulkData = await user.find({ email: { $in: listUsers } })
        let data = []
        let one = {}
        for (let i = 0; i < bulkData.length; i++) {
          data[i] = one[bulkData[i].email] = {
            "id": bulkData[i]._id,
            "email": bulkData[i].email,
            "fullName": bulkData[i].name + " " + bulkData[i].surname,
            "phoneNumber": bulkData[i].phoneNumber,
            "listFavored": bulkData[i].listfavored
          }
        }
        res({
          "result": "success",
          "value": {
            code: 0,
            message: {
              "collab": collabs,
              "listUsers": data,
            }
          }
        })
      } catch (err) {
        rej({
          "result": "error",
          "value": err
        })
      }
    });

    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },

  isUserCollab: async function(user) {
    return user.collabId == null;
  },
  isUserExiste: async function(email) {
    let userExistes = await user.findOne({ email: email })
    return userExistes != null;
  },
  addToCollab: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let collabId = body.collabId;
      let isCollab = await collab.findOne({ _id: collabId });
      let userExistes = await this.isUserExiste(body.email);
      let oneUser;
      if (userExistes) {
        oneUser = await user.findOne({ email: email });
        let r = await this.isUserCollab(oneUser)
        if (!r) {
          rej({
            result: "error",
            value: {
              "code": 5,
              "message": "user already in a collab",
            }
          })
          return;
        }
        if (!isCollab) {
          rej({
            result: "error",
            value: {
              "code": 9,
              "message": "collab not found",
            }
          })
          return;
        }
        try {
          await collab.updateOne({ _id: collabId }, { $push: { listUsers: email } });
          await user.updateOne({ _id: oneUser._id }, { collabId: collabId })
          res({
            result: "success",
            value: {
              code: 0,
              message: "add to collab"
            }
          })
        } catch (err) {
          console.log(err)
          rej({
            result: "error",
            value: {
              code: 500,
              message: "something went wrong"
            }
          })
        }

      } else {
        rej({
          result: "error",
          value: {
            code: 404,
            message: "user not found"
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
  deleteUserCollab: async function(userToDelete, emailToDelete, collabId) {
    let promise = new Promise(async (res, rej) => {
      try {
        await user.updateOne({ _id: userToDelete._id }, { $set: { collabId: null } })
        await collab.updateOne({ _id: collabId }, { $pull: { listUsers: emailToDelete } });
        res({
          result: "success",
          value: {
            code: 0,
            message: "deleted from collab"
          }
        })

      } catch (error) {
        console.log(error)
        rej({
          result: "error",
          value: {
            code: 1,
            message: JSON.stringify(error)
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



  createCollab: async function(body) {
    let promise = new Promise((res, rej) => {
      let email = body.email;
      let name = body.name;

      (new collab({
        name: name,
        listUsers: [email],
        dateCreated: moment.now(),
        creator: email
      })).save()
        .then(async result => {
          let data = {
            collabId: result._id
          }

          let filter = {
            email: email
          }

          try {
            await user.updateOne(filter, data)
            res({
              "result": "success",
              "value": result
            })
          } catch (err) {
            rej({
              "result": "error",
              "value": err
            })
          }
        })
        .catch(error => {
          rej({
            "result": "error",
            "value": error
          })
        })
    })
    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err
    }
  }
}

export default collabDao;

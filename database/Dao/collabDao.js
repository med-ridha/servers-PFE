import collab from '../module/collab.js'
import user from '../module/user.js';
import moment from 'moment'

let collabDao = {
  getCollabs: async function(email) {
    let promise = new Promise(async (res, rej) => {
      try {
        let userData = await user.findOne({ email: email });
        if (!userData) {
          rej({
            "result": "error",
            "value": {
              code: 404,
              message: "user not found"
            }
          })
          return;
        }
        let collabId = userData.collabId;
        if (collabId === null) {
          rej({
            "result": "error",
            "value": {
              code: 4,
              message: "no collabs"
            }
          })
          return;
        }
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
          // data[bulkData[i].email] = {
          //   "fullName": bulkData[i].name + " " + bulkData[i].surname,
          //   "phoneNumber": bulkData[i].phoneNumber
          // }
        }
        console.log(data);

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

  addToCollab: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let collabId = body.collabId;
      let userExistes = await user.findOne({ email: email })
      let isCollab = await collab.findOne({ _id: collabId });
      console.log(isCollab);
      if (userExistes) {
        if (userExistes.collabId != null) {
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
          await user.updateOne({ _id: userExistes._id }, { collabId: collabId })
          await collab.updateOne({ _id: collabId }, { $push: { listUsers: email } });
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

  deleteCollab: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let email = body.email;
      let emailToDelete = body.userToDelete;
      let thisUser = await user.findOne({ email: email });
      let userToDelete = await user.findOne({ email: emailToDelete })
      if (!thisUser || !userToDelete) {
        rej({
          result: "error",
          value: {
            code: 4,
            message: "not found"
          }
        })
        return;
      }

      let collabId = thisUser.collabId;
      let result = await user.updateOne({ _id: userToDelete._id }, { $set: { collabId: null } })
      await collab.updateOne({ _id: collabId }, { $pull: { listUsers: emailToDelete } });
      res({
        result: "success",
        value: {
          code: 0,
          message: "deleted from collab"
        }
      })
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
          console.log(result._id)
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

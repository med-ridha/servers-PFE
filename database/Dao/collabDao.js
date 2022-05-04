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

  addUserToCollab: async function(collabId, email) {
    let promise = new Promise(async (res, rej) => {
      try {
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

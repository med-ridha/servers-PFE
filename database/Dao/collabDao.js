import collab from '../module/collab.js'
import user from '../module/user.js';
import moment from 'moment'

let collabDao = {
  getCollabs: async function(email) {
    let promise = new Promise(async (res, rej) => {
      try {
        let userData = await user.findOne({ email: email });
        let collabId = userData.collabId;
        if (collabId === null) {
          throw rej({
            "result": "error",
            "value": "no collabs"
          })
        }
        let collabs = await collab.findOne({ _id: collabId });
        let listUsers = collabs.listUsers;
        if (listUsers.length == 0) {
          res({
            "result": "success",
            "value": {
              "listUsers": collabs.listUsers,
            }
          })
        }

        let bulkData = await user.find({ email: { $in: listUsers } })
        let data = {};
        for (let i = 0; i < bulkData.length; i++) {
          data[bulkData[i].email] = {
            "fullName": bulkData[i].name + " " + bulkData[i].surname,
            "phoneNumber": bulkData[i].phoneNumber
          }
        }
        console.log(data);

        res({
          "result": "success",
          "value": {
            "listUsers": data,
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
      if (userExistes.collabId != null)
        throw rej({
          result: "error",
          value: {
            "code": 5,
            "message": "user already in a collab",
          }
        })
      if (userExistes) {
        try {
          let result = await collab.updateOne({ _id: collabId }, { $push: { listUsers: email } });
          res({
            result: "success",
            value: {
              code: 0,
              message: "add to collab"
            }
          })
        } catch (err) {
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
  createCollab: async function(body) {
    let promise = new Promise((res, rej) => {
      let email = body.email;
      let name = body.name;

      (new collab({
        name: name,
        listUsers: [],
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
              "result": "done",
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

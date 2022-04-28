import moment from 'moment';
import abonn from '../module/abonnements.js';
import users from '../module/user.js';

let abonnDao = {
  getAbonn: async function(email) {
    let promise = new Promise(async (res, rej) => {
      try {
        let user = await users.findOne({ email: email });
        if (!user) {
          rej({
            result: "error",
            value: {
              code: 4,
              message: "user not found"
            }
          })
          return;
        }
        let listAbonn = user.abonnement;
        let abonns = await abonn.find({ _id: { $in: listAbonn } });
        console.log(abonns);
        res({
          result: "success",
          value: {
            code: 0,
            message: abonns,
          }
        })
      } catch (error) {
        console.log(error);
        rej({
          result: "error",
          value: {
            code: 5,
            message: JSON.stringify(error)
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
  createAbonn: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let userEmail = body.email;
      try {
        let user = await users.findOne({ email: userEmail });
        if (!user) {
          rej({
            result: "error",
            value: {
              code: 4,
              message: "user not found"
            }
          })
          return;
        }
        let duree = body.duree;

        (new abonn({
          userEmail: userEmail,
          modules: body.modules.substring(1, body.modules.length - 1).split(",").map(item => item.trim()),
          dateStart: moment.now(),
          dateFinish: moment.now() + (31540000000 * duree),
          montant: Number(body.montant)
        })).save().then(async (result) => {
          let userUpdateResult = await users.updateOne({ email: userEmail }, { $push: { abonnement: result._id } })
          console.log(userUpdateResult)
          let finalResult = await users.findOne({ email: userEmail });
          res({
            result: "success",
            value: {
              code: 0,
              message: finalResult.abonnement,
            }
          })
        }).catch()
      } catch (error) {
        console.log(error);
        rej({
          result: "error",
          value: {
            code: 5,
            message: JSON.stringify(error)
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
  }
}

export default abonnDao;

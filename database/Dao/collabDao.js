import collab from '../module/collab.js'
import user from '../module/user.js'
import moment from 'moment'

let collabDao = {
    addToCollab: async function(body) {
        let promise = new Promise(async (res, rej) => {
            let email = body.email;
            let collabId = body.collabId;
            let userExistes = await user.findOne({ _id: email })
            if (userExistes) {
                try {
                    let result = await collab.updateOne({ _id: collabId }, { $push: { listUsers: email } });
                    res({
                        result: "done",
                        value: result
                    })
                }catch(err){
                    rej ({
                        result: "error",
                        value: err
                    })
                }
                
            } else {
                rej({
                    result: "error",
                    value: "user not found"
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
                        _id: email
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

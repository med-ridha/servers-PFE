import bcrypt from 'bcrypt'
import user from '../module/user.js'
import token from '../module/token.js'
import moment from 'moment'

let userDao = {
    login: async function(body) {
        let promise = new Promise(async (res, rej) => {
            let _id = body.email;
            let password = body.password;
            let userResult = await user.find({ _id: _id });
            if (userResult[0]) {
                let hash = userResult[0].password;
                let result = await bcrypt.compare(password, hash);
                if (result) {
                    (new token({
                        email: _id,
                        token: Math.random().toString(36).substring(2, 8),
                        used: false,
                        dateCreated: moment.now(),
                        dateExpo: moment.now() + 21600000 // 6 hours
                    })).save()
                        .then(result => {
                            res(result)
                        })
                        .catch((error) => {
                            rej(error)
                        });
                } else {
                    rej({ error: "wrong password" })
                }
            } else {
                rej({ error: "email doesn't exists" })
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
        let promise = new Promise((res, rej) => {
            let saltRounds = Math.floor(Math.random() * 8) + 8;

            let _id = body.email;
            let name = body.name;
            let surname = body.surname;
            let phoneNumber = body.phoneNumber;
            let password = body.password;
            let nomStructure = body.nomStructure;
            let phoneStructure = body.phoneStructure;
            let adressStructure = body.adressStructure;
            let numFiscal = body.numFiscal;
            let codeVoucher = body.codeVoucher;
            bcrypt.hash(password, saltRounds).then(hash => {
                (new user({
                    _id: _id,
                    name: name,
                    surname: surname,
                    phoneNumber: phoneNumber,
                    password: hash,
                    nomStructure: nomStructure,
                    phoneStructure: phoneStructure,
                    numFiscal: numFiscal,
                    codeVoucher: codeVoucher,
                    adressStructure: adressStructure
                })).save()
                    .then(_ => {
                        let result = {
                            status: "success",
                        }
                        res(result);
                    })
                    .catch((error) => {
                        let result = {
                            status: "error",
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
    checkToken: async function(body) {
        let userToken = body.token;
        let email = body.email;
        let result = await token.find({ token: userToken, email: email })
        if (result[0]) {
            for (let count = 0; count < result.length; count += 1) {
                let dateExpo = new Date(result[count].dateExpo).getTime();
                let now = new Date().getTime();
                if ((dateExpo - now) <= 21600000 && !result[count].used) {
                    console.log(dateExpo);
                    await token.updateOne({ _id: result[count].id }, { used: true })
                    return { result: "welcome" }
                }
            }
            return { result: "expired" }
        } else {
            return { result: "not found" }
        }
    },

}

export default userDao

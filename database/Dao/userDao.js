import bcrypt from 'bcrypt'
import user from '../module/user.js'

let userDao = {}

export default userDao = {
    login: async function(body) {
        let _id = body.email;
        let password = body.password;
        let userResult = await user.find({ _id: _id });
        if (userResult[0]) {
            let hash = userResult[0].password;
            console.log(userResult)
            let result = await bcrypt.compare(password, hash);
            if (result) {
                return {
                    status: "welcome",
                    userResult
                };
            } else {
                return { error: "wrong password" }
            }
        } else {
            return { error: "email doesn't exists" }
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
    }
}

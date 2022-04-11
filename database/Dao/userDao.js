import bcrypt from 'bcrypt'
import user from '../module/user.js'
import token from '../module/token.js'
import moment from 'moment'
import nodemailer from 'nodemailer'

let saltRounds = 9;

let userDao = {
    updateUser: async function (body) {
        let promise = new Promise(async (res, rej) => {
            let _id = body.email;
            try{
                let oldUser = await user.findOne({ _id: _id })
                let pass = body.password;
                let hash = await bcrypt.hash(pass, saltRounds)
                let data = {
                    name: body.name || oldUser.name,
                    surname: body.surname || oldUser.surname,
                    password: hash || oldUser.password,
                    numFiscal: body.numFiscal || oldUser.numFiscal,
                    phoneNumber: body.phoneNumber || oldUser.phoneNumber,
                    codeVoucher: body.codeVoucher || oldUser.coudeVoucher,
                    nomStructure: body.nomStructure || oldUser.nomStructure,
                    phoneStructure: body.phoneStructure || oldUser.phoneStructure,
                    adressStructure: body.adressStructure || oldUser.adressStructure
                }
                let update = await user.updateOne({_id: _id}, data);
                res ({
                    "result": "done",
                    "value": update
                })
            }catch (err) {
                rej ({
                    "result": "error",
                    "value": err
                })
            }
        })
        try{
            let result = await promise;
            return result;
        }catch (err) {
            return err;
        }
    },
    login: async function(body) {
        let promise = new Promise(async (res, rej) => {
            let _id = body.email;
            let password = body.password;
            let userResult = await user.findOne({ _id: _id });
            if (userResult) {
                let hash = userResult.password;
                let result = await bcrypt.compare(password, hash);
                if (result) {
                    (new token({
                        email: _id,
                        token: Math.random().toString(36).substring(2, 8),
                        used: false,
                        dateCreated: moment.now(),
                        dateExpo: moment.now() + 21600000 // 6 hours
                    })).save()
                        .then(async result => {
                            let transporter = nodemailer.createTransport({
                                host: "smtp-relay.sendinblue.com",
                                port:587,
                                secure:false,
                                auth: {
                                    user: "ridha.zemzem24@gmail.com",
                                    pass: "N43P8mJrDRCV1QWk"
                                },
                                tls: {
                                    rejectUnauthorized: false
                                }
                            })
                            let mailOptions = {
                                from: '"zarga" <ridha.zemzem24@gmail.com>', // sender address
                                to: _id, // list of receivers
                                subject: "token", // Subject line
                                text: result.token, // plain text body
                                html: `<b>${result.token}</b>`, // html body
                            }
                            try{
                                let info = await transporter.sendMail(mailOptions);
                                console.log("Message send" + info.messageId)
                            }catch(err){
                                console.log("message not sent " + err)
                            }
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

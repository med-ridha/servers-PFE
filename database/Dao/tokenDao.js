import moment from 'moment'
import token from '../module/token.js'
import nodemailer from 'nodemailer'
let tokenDao = {
    createToken: async function(_id) {
        let promise = new Promise((res, rej) => {
            (new token({
                email: _id,
                token: Math.random().toString(36).substring(2, 8),
                used: false,
                dateCreated: moment.now(),
                dateExpo: moment.now() + 21600000 // 6 hours
            })).save()
                .then(async result => {
                    // let transporter = nodemailer.createTransport({
                    //     host: "smtp-relay.sendinblue.com",
                    //     port: 587,
                    //     secure: false,
                    //     auth: {
                    //         user: "ridha.zemzem24@gmail.com",
                    //         pass: "N43P8mJrDRCV1QWk"
                    //     },
                    //     tls: {
                    //         rejectUnauthorized: false
                    //     }
                    // })
                    // let mailOptions = {
                    //     from: '"zarga" <ridha.zemzem24@gmail.com>', // sender address
                    //     to: _id, // list of receivers
                    //     subject: "token", // Subject line
                    //     text: result.token, // plain text body
                    //     html: `<b>${result.token}</b>`, // html body
                    // }
                    // try {
                    //     let info = await transporter.sendMail(mailOptions);
                    //     console.log("Message send" + info.messageId)
                    // } catch (err) {
                    //     console.log("message not sent " + err)
                    // }
                    console.log(result.token);
                    res(result)
                })
                .catch((error) => {
                    rej(error)
                });
        })
        try {
            let result = await promise;
            return {
                "result": "success",
                "value": result
            };
        } catch (err) {
            return {
                "result": "error",
                "value": err
            }
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
                    return { result: "success" }
                }
            }
            return { result: "expired" }
        } else {
            return { result: "not found" }
        }
    },
}

export default tokenDao;

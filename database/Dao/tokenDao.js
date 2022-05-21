import moment from 'moment'
import token from '../module/token.js'
import nodemailer from 'nodemailer'
let tokenDao = {
  createToken: async function(email) {
    let promise = new Promise(async (res, rej) => {
      let tokens = await token.find({ email: email });
      if (tokens[0]) {
        await token.updateMany({ email: email }, { valid: false });
      }
      (new token({
        email: email,
        token: Math.random().toString(36).substring(2, 8),
        used: false,
        valid: true,
        dateCreated: moment.now(),
        dateExpo: moment.now() + 21600000 // 6 hours
      })).save()
        .then(async result => {
           let transporter = nodemailer.createTransport({
               host: "smtp-relay.sendinblue.com",
               port: 587,
               secure: false,
               auth: {
                   user: process.env.SMTP_EMAIL,
                   pass: process.env.SMTP_AUTH
               },
               tls: {
                   rejectUnauthorized: false
               }
           })
           let mailOptions = {
               from: '"JURIDOCTN" <ridha.zemzem24@gmail.com>', // sender address
               to: email, // list of receivers
               subject: "token", // Subject line
               text: result.token, // plain text body
               html: `<b>voici votre code: ${result.token}</b>`, // html body
           }
           try {
               let info = await transporter.sendMail(mailOptions);
               console.log("Message send" + info.messageId)
           } catch (err) {
               console.log("message not sent " + err)
           }
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
    let result = await token.find({ token: userToken, email: email, valid: true })
    if (result[0]) {
      let dateExpo = new Date(result[0].dateExpo).getTime();
      let now = new Date().getTime();
      if ((dateExpo - now) <= 21600000 && !result[0].used) {
        console.log(dateExpo);
        await token.updateOne({ _id: result[0].id }, { used: true })
        return { result: "success" }
      }
      return { result: "expired" }
    } else {
      return { result: "not found" }
    }
  },
}

export default tokenDao;

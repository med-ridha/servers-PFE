import admin from 'firebase-admin'
import users from '../database/module/user.js';

import serviceAccount from "./juridoc-b18e9-firebase-adminsdk-4ixf9-6b2d679b7f.json" assert {type: "json"};


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

let firebase = {
  send: async function(data) {
    let message = {
      notification: {
        title: data.title,
        body: data.body
      },
     // android: {
     //   notification: {
     //     image: data.image,
     //     channel_id: "com.example.juridoc"
     //   }
     // },
     // apns: {
     //   payload: {
     //     aps: {
     //       'mutable-content': 1
     //     }
     //   },
     //   fcm_options: {
     //     image: data.image
     //   }
     // },
      //topic: 'new'
    };
    let user = await users.findOne({email: data.email})
    let r = await admin.messaging().sendToDevice(user.notifId, message);
    console.log(r);
  },
  sendToTopic: async function(data) {
    let message = {
      notification: {
        title: data.title,
        body: data.body
      },
      android: {
        notification: {
          image: data.image,
          channel_id: "com.example.juridoc"
        }
      },
      apns: {
        payload: {
          aps: {
            'mutable-content': 1
          }
        },
        fcm_options: {
          image: data.image
        }
      },
      topic: 'new'
    };
    let res = await admin.messaging().send(message)
    console.log(res);
  }
}

export default firebase

import admin from 'firebase-admin'

import serviceAccount from "./testpushnotif-ba6cb-firebase-adminsdk-ix8di-4b499dccd8.json" assert {type: "json"};


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

let firebase = { 
    sendToTopic : async function(data) {
        let message = {
            notification: {
                title: data.title,
                body: data.body
            },
            android: {
                notification: {
                    image: data.image,
                    channel_id: "com.example.mobileside"
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

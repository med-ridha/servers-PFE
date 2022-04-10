import mongoose from 'mongoose'

const collabSchema = new mongoose.Schema({
    name: { type: String, required: true },
    listUsers: { type: Array },
    dateCreated: { type: Date, required: true },
    creator: { type: String, required: true },
}, { versionKey: false })

const collab = mongoose.model('collab', collabSchema)

export default collab;

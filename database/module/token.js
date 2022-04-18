import mongoose from 'mongoose'

const tokenSchema = new mongoose.Schema({
    email: { type: String, required: true }, //email
    token: { type: String, required: true },
    used: { type: Boolean, required: true },
    valid: {type: Boolean, required: true },
    dateCreated: { type: Date, required: true },
    dateExpo: { type: Date, required: true },
}, { versionKey: false })

const token = mongoose.model('token', tokenSchema)

export default token;

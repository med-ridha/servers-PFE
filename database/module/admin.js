import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema({
    _id: { type: String, required: true }, //email
    name: { type: String, required: true },
    surname: { type: String, required: true },
    password: { type: String, required: true },
}, { versionKey: false })

const admin = mongoose.model('admin', adminSchema)

export default admin;

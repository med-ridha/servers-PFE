import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, //email
    name: { type: String, required: true },
    surname: { type: String, required: true },
    password: { type: String, required: true },
}, { versionKey: false })

const admin = mongoose.model('admin', adminSchema)

export default admin;

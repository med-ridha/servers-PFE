import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    collabId: { type: String, default: null },
    favored: { type: Array, default: [] },
    _id: { type: String, required: true }, //email
    name: { type: String, required: true },
    surname: { type: String, required: true },
    password: { type: String, required: true },
    numFiscal: { type: String, required: true },
    codeVoucher: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    nomStructure: { type: String, required: true },
    phoneStructure: { type: String, required: true },
    adressStructure: { type: String, required: true }
}, { versionKey: false })

const user = mongoose.model('user', userSchema)

export default user;


import mongoose from 'mongoose'

const docSchema = new mongoose.Schema({
    module: { type: String, required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    dateAdded: { type: String, required: true },
    datePublished: { type: String, required: true },
}, { versionKey: false })

const doc = mongoose.model('document', docSchema)

export default doc;

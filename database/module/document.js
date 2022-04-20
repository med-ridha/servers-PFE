import mongoose from 'mongoose'

const docSchema = new mongoose.Schema({
  module: { type: String, required: true },
  category: { type: String, required: true },
  titleFr: { type: String, required: true },
  bodyFr: { type: String, required: true },
  titleAr: { type: String, required: true },
  bodyAr: { type: String, required: true },
  ref: { type: String, required: true },
  dateAdded: { type: String, required: true },
  datePublished: { type: String, required: true },
}, { versionKey: false })

const doc = mongoose.model('document', docSchema)

export default doc;

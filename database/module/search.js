import mongoose from 'mongoose'

const searchSchema = new mongoose.Schema({
  email: { type: String, required: true }, //email
  searchString: { type: String, required: true },
  dateSearch: { type: Date, required: true },
  foundResult: { type: Boolean, required: true },
}, { versionKey: false })

const search = mongoose.model('search', searchSchema)

export default search;

import mongoose from 'mongoose'

const categorie = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  documentsIds: [String]
})

const moduleSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  categories: [categorie] ,
  numDoc: { type: Number, required: true }
}, { versionKey: false })

const module = mongoose.model('module', moduleSchema)

export default module;

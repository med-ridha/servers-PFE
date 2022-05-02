import mongoose from 'mongoose'

const abonnementSchema = new mongoose.Schema({
  email: {type: String, required: true},
  modules: {type: Array, required: true},
  dateStart: {type: Date, required: true},
  dateFinish: {type: Date, required: true},
  montant: {type: Number, required: true}
}, { versionKey: false })

const abonnement = mongoose.model('abonnement', abonnementSchema)

export default abonnement;

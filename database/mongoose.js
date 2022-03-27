import mongoose from 'mongoose'

mongoose.Promise = global.Promise;

mongoose.connect("mongodb://127.0.0.1:27017/juridoc")
            .then(() => console.log("database Connected"))
            .catch((error) => console.error(error));

export default mongoose; 

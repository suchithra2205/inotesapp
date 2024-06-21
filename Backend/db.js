const mongoose= require('mongoose');


const mongourl="mongodb://localhost:27017";
const connectToMongo =()=>{

    mongoose.connect(mongourl)
    .then(success =>console.log("sucess"))
    .catch((err) =>console.log(err.message))
}
module.exports=connectToMongo;
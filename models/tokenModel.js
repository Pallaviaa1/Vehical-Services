
const mongoose = require('mongoose');

const tokenSchema = mongoose.Schema({
    email: {
        type:String,
        required:true
    },
    token:
    {
        type:String,
        require:true
    }
})

module.exports=mongoose.model("token",tokenSchema)
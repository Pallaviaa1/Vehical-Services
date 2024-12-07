
const mongoose = require('mongoose');

const contactSchema = mongoose.Schema({
    phone: {
        type:String,
        required:true
    },
    email:
    {
        type:String,
        require:true
    },
    address:
    {
        type:String,
        require:true
    }
})

module.exports=mongoose.model("contact",contactSchema);
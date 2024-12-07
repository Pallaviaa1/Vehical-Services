
const mongoose = require('mongoose');

const privacySchema = mongoose.Schema({
    heading: {
        type:String,
        required:true
    },
    description:
    {
        type:String,
        require:true
    }
})

module.exports=mongoose.model("privacy",privacySchema);

const mongoose = require('mongoose');

const termSchema = mongoose.Schema({
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

module.exports=mongoose.model("term",termSchema);
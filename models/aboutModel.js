
const mongoose = require('mongoose');

const aboutSchema = mongoose.Schema({
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

module.exports=mongoose.model("about",aboutSchema);
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    firstname: {
        type: String,
        require: true
    },
    lastname: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    user_type: {
        type: String,
        enum: ['Customer', 'Admin', 'Merchant']
    },
    profile:
    {
        type: String,
        require: true
    },
    status:
    {
        type: Boolean,
        require: true,
        default: true
    },
    isDeleted:{
        type: Number,
        default: 0
    }
},
    { timestamps: true }
);

const AddressSchema= mongoose.Schema({
    user_id: {
        type:String,
        require: true
    },
    address:[
        {
            name:String,
            phone:Number,
            street:String,
            country:String,
            landmark:String,
            state:String,
            city:String,
            pincode:Number
        }
    ]
})

const User = mongoose.model("user", userSchema);
const Address = mongoose.model("Address", AddressSchema);

module.exports = { 
    User, Address
}


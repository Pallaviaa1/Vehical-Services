const mongoose = require("mongoose");

const Notificationschema = new mongoose.Schema({
    time: {
        type: String,
    },
    days: {
        type: [],
    },
    notification: {},
});


const DeviceSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
})

const Notification = mongoose.model("Notification", Notificationschema);

module.exports = Notification;
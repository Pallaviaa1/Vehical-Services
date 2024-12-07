const mongoose = require('mongoose');

const vehicleTypeSchema = mongoose.Schema({

    name: {
        type: String,
        require: true
    },
    image:
    {
        type: String,
        require: true
    }
},
    { timestamps: true }
);

const MakeSchema = mongoose.Schema({

    name: {
        type: String,
        require: true
    },
    vehicle_id:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vehicleType"
    }
},
    { timestamps: true }
);

const ModelSchema = mongoose.Schema({

    name: {
        type: String,
        require: true
    },
    vehicle_id:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vehicleType"
    },
    make_id:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VehicleMaker"
    }
},
    { timestamps: true }
);

const YearSchema = mongoose.Schema({

    year: {
        type: String,
        require: true
    },
    vehicle_id:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vehicleType"
    },
    model_id:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VehicleModel"
    }

},
    { timestamps: true }
);

const AddVehicleSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    make:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VehicleMaker"
    },
    model:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VehicleModel"
    },
    year:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VehicleYear"
    },
    fuel_type:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Modification"
    }

},
    { timestamps: true }
);

const AddServicesSchema = mongoose.Schema({
    name:
    {
        type: String,
        require: true
    },
    image:
    {
        type: String,
        require: true
    }

},
    { timestamps: true }
);

const AddModificationSchema = mongoose.Schema({
    name:
    {
        type: String,
        require: true
    },
    make_id:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VehicleMaker"
    },
    model_id:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VehicleModel"
    },
    year_id:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VehicleYear"
    }

},
    { timestamps: true }
);

const AddReminderSchema = mongoose.Schema({
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    vehicle:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AddVehicle"
    },
    service_type:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AddService"
    },
    date:
    {
        type:String
    },
    remarks:
    {
        type:String
    }
})

const Vehicle = mongoose.model("vehicleType", vehicleTypeSchema);
const Make = mongoose.model("VehicleMaker", MakeSchema);
const Model = mongoose.model("VehicleModel", ModelSchema);
const Year = mongoose.model("VehicleYear", YearSchema);
const AddVehicle = mongoose.model("AddVehicle", AddVehicleSchema);
const AddServices = mongoose.model("AddService", AddServicesSchema);
const Modification = mongoose.model("Modification", AddModificationSchema)
const AddReminder= mongoose.model("AddReminder", AddReminderSchema);

module.exports = {
    Vehicle, Make, Model, Year, AddVehicle, AddServices, AddReminder, Modification
}
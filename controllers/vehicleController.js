const { validationResult } = require('express-validator');
const { Vehicle, Make, Model, Year, AddServices, AddReminder, Modification } = require('../models/vehicleModel');
var jwt = require('jsonwebtoken');
const { models } = require('mongoose');
const { ellipse } = require('pdfkit');
const { Order_Item } = require('../models/productModel');
const { JWT_SECRET } = process.env;

//// start vehicle type operations

const addvehicleType = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { vehicle_name, image } = req.body;
        const vehicle = new Vehicle(
            {
                name: vehicle_name,
                image: req.file.filename
            }
        )
        const name = await Vehicle.find();
        if (name) {
            let checking = false;
            for (let i = 0; i < name.length; i++) {
                if (name[i].name.toLowerCase() === vehicle_name.toLowerCase()) {
                    checking = true;
                    break;
                }
            }
            if (checking == false) {
                const data = await vehicle.save();
                res.status(200).send(
                    {
                        success: true,
                        msg: "vehicle added successfully",
                        data: data
                    }
                )
            }
            else {
                res.status(400).send({
                    success: false,
                    msg: "Vehicle is already exist !"
                })
            }
        }
        else {
            const data = await vehicle.save();
            res.status(200).send(
                {
                    success: true,
                    msg: "vehicle added successfully",
                    data: data
                }
            )
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })

    }
}

const getVehTypes = async (req, res) => {
    const types = await Vehicle.find();
    if (types.length > 0) {
        res.status(200).send({
            success: true,
            msg: "",
            response: types
        })
    }
    else {
        res.status(400).send({
            success: false,
            msg: "vehicle not found"
        })
    }
}

const updateVehType = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { id } = req.params;
        const { vehicle_name } = req.body;
        const update = await Vehicle.findByIdAndUpdate({ _id: id }, { $set: { name: vehicle_name, image: req.file.filename } });
        if (update == null) {
            res.status(400).send({
                success: false,
                msg: "id doesn't exist"
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: "update vehicle type successfully"
            })
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const deleteVehType = async (req, res) => {
    const { id } = req.params;
    const data = await Vehicle.findByIdAndDelete({ _id: id });
    if (data == null) {
        res.status(400).send({
            success: false,
            msg: "id doesn't exist"
        })
    }
    else {
        res.status(200).send({
            success: true,
            msg: "Vehicle type deleted successfully !"
        })
    }
}

const VehicleTypeById = async (req, res) => {
    const { vehicleId } = req.body;
    if (!vehicleId) {
        res.status(400).send({
            success: false,
            msg: "Please enter vehicle type id !"
        })
    }
    else {
        const vehicle = await Vehicle.findById({ _id: vehicleId });
        if (!vehicle) {
            res.status(400).send({
                success: false,
                msg: 'Vehicle not exist !'
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: '',
                data: vehicle
            })
        }
    }
}

//// start make operations

const AddVehicleMake = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { vehicle_id, name } = req.body;
        const make = new Make({
            vehicle_id: vehicle_id,
            name: name
        })
        const makefind = await Make.find({ vehicle_id: vehicle_id });
        if (makefind) {
            let checking = false;
            for (let i = 0; i < makefind.length; i++) {
                if (makefind[i].name.toLowerCase() === name.toLowerCase()) {
                    checking = true;
                    break;
                }
            }
            if (checking == false) {
                const data = await make.save();
                res.status(200).send(
                    {
                        success: true,
                        msg: "Make added successfully",
                        data: data
                    }
                )
            }
            else {
                res.status(400).send({
                    success: false,
                    msg: "Make is already exist !"
                })
            }
        }
        else {
            const data = await make.save();
            res.status(200).send(
                {
                    success: true,
                    msg: "Make added successfully",
                    data: data
                }
            )
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const getMakeList = async (req, res) => {
    const data = await Make.find().populate({ path: "vehicle_id", select: "_id name" }).select('_id name');
    if (data.length > 0) {
        res.status(200).send(
            {
                success: true,
                msg: "",
                data: data
            }
        )
    }
    else {
        res.status(400).send(
            {
                success: false,
                msg: "Make not found !"
            }
        )
    }

}


const getMakewithcat = async (req, res) => {
    const data = await Vehicle.aggregate([
        {
            $project:
            {
                "_id": "$_id",
                "name": "$name"
            }
        },
        {
            $lookup: {
                from: "vehiclemakers",
                localField: "_id",
                foreignField: "vehicle_id",
                as: "make"
            }
        }
        ,
        {
            "$project": {
                "_id": 1,
                "name": 1,
                "make._id": 1,
                "make.name": 1
            }
        }

    ]);
    res.status(200).send(
        {
            success: true,
            msg: "",
            data: data
        }
    )
}

const updateMake = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { id } = req.params;
        const { vehicle_id, name } = req.body;
        const data = await Make.findByIdAndUpdate({ _id: id }, { $set: { vehicle_id: vehicle_id, name: name } });
        if (data == null) {
            res.status(400).send({
                success: false,
                msg: "Id not exist !"
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: "Update Make successfully !"
            })
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const deleteMake = async (req, res) => {
    const { id } = req.params;
    const data = await Make.findByIdAndDelete({ _id: id });
    if (data == null) {
        res.status(400).send({
            success: false,
            msg: " Id not exist !"
        })
    }
    else {
        res.status(200).send({
            success: true,
            msg: "Make deleted successfully !"
        })
    }
}

const MakeById = async (req, res) => {
    const { makeId } = req.body;
    try {
        if (!makeId) {
            res.status(400).send({
                success: false,
                msg: "Please enter make id !"
            })
        }
        else {
            const make = await Make.findById({ _id: makeId }).populate({ path: "vehicle_id", select: "_id name" });
            if (!make) {
                res.status(400).send({
                    success: false,
                    msg: 'Make not exist !'
                })
            }
            else {
                res.status(200).send({
                    success: true,
                    msg: '',
                    data: make
                })
            }
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}


// start model operations

const AddVehicleModel = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { name, vehicle_id, make_id } = req.body;
        const model = new Model({
            vehicle_id: vehicle_id,
            make_id: make_id,
            name: name
        })
        const modelfind = await Model.find({ $and: [{ vehicle_id: vehicle_id }, { make_id: make_id }] });
        if (modelfind) {
            let checking = false;
            for (let i = 0; i < modelfind.length; i++) {
                if (modelfind[i].name.toLowerCase() === name.toLowerCase()) {
                    checking = true;
                    break;
                }
            }
            if (checking == false) {
                const data = await model.save();
                res.status(200).send(
                    {
                        success: true,
                        msg: "Model added successfully",
                        data: data
                    }
                )
            }
            else {
                res.status(400).send({
                    success: false,
                    msg: "Model is already exist !"
                })
            }
        }
        else {
            const data = await model.save();
            res.status(200).send(
                {
                    success: true,
                    msg: "Model added successfully",
                    data: data
                }
            )
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const getModel = async (req, res) => {
    const data = await Model.find().populate({ path: 'vehicle_id', select: '_id, name' }).populate({ path: 'make_id', select: '_id name' }).select('_id name')
    if (data.length > 0) {
        res.status(200).send({
            success: true,
            msg: "",
            data: data
        })
    }
    else {
        res.status(400).send({
            success: false,
            msg: "Data not found"
        })
    }
}

const updateModel = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { id } = req.params;
        const { vehicle_id, make_id, name } = req.body
        const data = await Model.findByIdAndUpdate({ _id: id }, { $set: { vehicle_id: vehicle_id, make_id: make_id, name: name } })
        if (data == null) {
            res.status(400).send({
                success: false,
                msg: "id not exist"
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: "Model updated successfully"
            })
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const deleteModel = async (req, res) => {
    const { id } = req.params;
    const data = await Model.deleteOne({ _id: id });
    if (data.deletedCount == 0) {
        res.status(400).send(
            {
                success: false,
                msg: "id not exist !"
            }
        )
    }
    else {
        res.status(200).send(
            {
                success: true,
                msg: "Deleted model successfully !"
            }
        )
    }
}

const ModelById = async (req, res) => {
    const { modelId } = req.body;
    try {
        if (!modelId) {
            res.status(400).send({
                success: false,
                msg: 'Please enter model id !'
            })
        }
        else {
            const model = await Model.findById({ _id: modelId }).populate({ path: 'vehicle_id', select: 'name _id' }).populate({ path: 'make_id', select: 'name _id' })
            if (!model) {
                res.status(400).send({
                    success: false,
                    msg: 'Model not exist !'
                })
            }
            else {
                res.status(200).send({
                    success: true,
                    msg: '',
                    data: model
                })
            }
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

//start year operations

const AddvehicleYear = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { vehicle_id, model_id, year } = req.body;
        const yeardata = new Year({
            vehicle_id: vehicle_id,
            model_id: model_id,
            year: year
        })
        const yearfind = await Year.find({ $and: [{ vehicle_id: vehicle_id }, { model_id: model_id }] });
        if (yearfind) {
            let checking = false;
            for (let i = 0; i < yearfind.length; i++) {
                if (yearfind[i].year === year) {
                    checking = true;
                    break;
                }
            }
            if (checking == false) {
                const data = await yeardata.save();
                res.status(200).send(
                    {
                        success: true,
                        msg: "Year added successfully",
                        data: data
                    }
                )
            }
            else {
                res.status(400).send({
                    success: false,
                    msg: "Year is already exist !"
                })
            }
        }
        else {
            const data = await yeardata.save();
            res.status(200).send(
                {
                    success: true,
                    msg: "Year added successfully",
                    data: data
                }
            )
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const getYear = async (req, res) => {
    const data = await Year.find().populate({ path: 'vehicle_id', select: '_id, name' }).populate({ path: 'model_id', select: '_id name' }).select('_id year');
    if (data.length > 0) {
        res.status(200).send(
            {
                success: true,
                msg: "",
                data: data
            }
        )
    }
    else {
        res.status(400).send(
            {
                success: false,
                msg: "year not found !"
            }
        )
    }
}

const updateYear = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const { id } = req.params;
    const { year, vehicle_id, model_id } = req.body;
    const data = await Year.findByIdAndUpdate({ _id: id }, { $set: { year: year, vehicle_id: vehicle_id, model_id: model_id } });
    if (data == null) {
        res.status(400).send({
            success: false,
            msg: "id not exist"
        })
    }
    else {
        res.status(200).send({
            success: true,
            msg: "Year updated successfully !"
        })
    }
}

const deleteYear = async (req, res) => {
    const { id } = req.params;
    const data = await Year.findByIdAndDelete({ _id: id })
    if (data == null) {
        res.status(400).send(
            {
                success: false,
                msg: "id not exist"
            }
        )
    }
    else {
        res.status(200).send(
            {
                success: true,
                msg: "Year deleted successfully !"
            }
        )
    }
}

const yearById = async (req, res) => {
    const { yearId } = req.body;
    try {
        if (!yearId) {
            res.status(400).send({
                success: false,
                msg: 'Please enter year id !'
            })
        }
        else {
            const year = await Year.findById({ _id: yearId }).populate({ path: 'vehicle_id', select: 'name _id' })
                .populate({ path: 'model_id', select: 'name _id' });
            if (!year) {
                res.status(400).send({
                    success: false,
                    msg: 'Year not exist !'
                })
            }
            else {
                res.status(200).send({
                    success: true,
                    msg: '',
                    data: year
                })
            }
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

// add modifications

const addModification = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { make_id, model_id, year_id, name } = req.body;
        const modification = new Modification({
            name: name,
            make_id: make_id,
            model_id: model_id,
            year_id: year_id
        })
        const modificationfind = await Modification.find({ $and: [{ make_id: make_id }, { model_id: model_id }, { year_id: year_id }] });
        if (modificationfind) {
            let checking = false;
            for (let i = 0; i < modificationfind.length; i++) {
                if (modificationfind[i].name === name) {
                    checking = true;
                    break;
                }
            }
            if (checking == false) {
                const data = await modification.save();
                res.status(200).send(
                    {
                        success: true,
                        msg: "Modification added successfully",
                        data: data
                    }
                )
            }
            else {
                res.status(400).send({
                    success: false,
                    msg: "Modification is already exist !"
                })
            }
        }
        else {
            const data = await modification.save();
            res.status(200).send(
                {
                    success: true,
                    msg: "Modification added successfully",
                    data: data
                }
            )
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const getModification = async (req, res) => {
    const data = await Modification.find().populate({ path: 'make_id', select: '_id, name' }).populate({ path: 'model_id', select: '_id name' }).populate({ path: 'year_id', select: '_id, year' }).select('_id name');
    if (data.length > 0) {
        res.status(200).send(
            {
                success: true,
                msg: "",
                data: data
            }
        )
    }
    else {
        res.status(400).send(
            {
                success: false,
                msg: "Modification not found !"
            }
        )
    }
}

const updateModification = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const { id } = req.params;
    //console.log(id)
    const { name, make_id, model_id, year_id } = req.body;
    const data = await Modification.findByIdAndUpdate({ _id: id }, { $set: { name: name, make_id: make_id, model_id: model_id, year_id: year_id } });
    if (data == null) {
        res.status(400).send({
            success: false,
            msg: "id not exist"
        })
    }
    else {
        res.status(200).send({
            success: true,
            msg: "Year updated successfully !"
        })
    }
}

const deleteModification = async (req, res) => {
    const { id } = req.params;
    const data = await Modification.findByIdAndDelete({ _id: id })
    if (data == null) {
        res.status(400).send(
            {
                success: false,
                msg: "id not exist"
            }
        )
    }
    else {
        res.status(200).send(
            {
                success: true,
                msg: "Year deleted successfully !"
            }
        )
    }
}

const modfyById = async (req, res) => {
    const { modifyId } = req.body;
    try {
        if (!modifyId) {
            res.status(400).send({
                success: false,
                msg: 'Please enter Modification id !'
            })
        }
        else {
            const modify = await Modification.findById({ _id: modifyId }).populate({ path: 'make_id', select: 'name _id' }).populate({ path: 'model_id', select: 'name _id' })
                .populate({ path: 'year_id', select: 'year _id' });
            if (!modify) {
                res.status(400).send({
                    success: false,
                    msg: 'Modification not exist !'
                })
            }
            else {
                res.status(200).send({
                    success: true,
                    msg: '',
                    data: modify
                })
            }
        }
    }
    catch (error) {
        res.status(400).send({
            success: false,
            msg: error.message
        })
    }
}

// start service operations

const addServices = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { name } = req.body;
        const service = new AddServices(
            {
                name: name,
                image: req.file.filename
            }
        )
        const servicesfind = await AddServices.find();
        if (name) {
            let checking = false;
            for (let i = 0; i < servicesfind.length; i++) {
                if (servicesfind[i].name.toLowerCase() === name.toLowerCase()) {
                    checking = true;
                    break;
                }
            }
            if (checking == false) {
                const data = await service.save();
                res.status(200).send(
                    {
                        success: true,
                        msg: "Service added successfully",
                        data: data
                    }
                )
            }
            else {
                res.status(400).send({
                    success: false,
                    msg: "This Service already exists!"
                })
            }
        }
        else {
            const data = await service.save();
            res.status(200).send(
                {
                    success: true,
                    msg: "Service added successfully",
                    data: data
                }
            )
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const getServicesList = async (req, res) => {
    const data = await AddServices.find().select('_id name image');
    if (data.length > 0) {
        res.status(200).send({
            success: true,
            msg: '',
            response: data
        })
    }
    else {
        res.status(400).send({
            success: false,
            msg: "services not found !"
        })
    }
}

const editServices = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const id = req.params.id;
        const { name } = req.body;
        const data = await AddServices.findByIdAndUpdate({ _id: id }, { $set: { name: name, image: req.file.filename } });
        if (data == null) {
            res.status(400).send({
                success: false,
                msg: "id not exist"
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: "Service updated successfully !"
            })
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const deleteServices = async (req, res) => {
    const { id } = req.params;
    const data = await AddServices.deleteOne({ _id: id });
    if (data.deletedCount > 0) {
        res.status(200).send({
            success: true,
            msg: "Service deleted successfully !"
        })
    }
    else {
        res.status(400).send({
            success: false,
            msg: "id not exist !"
        })
    }
}

//start reminders operations

const addReminder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const authtoken = req.headers.authorization.split(' ')[1];
        const user = jwt.verify(authtoken, JWT_SECRET);
        const { vehicle_id, service_type, date, remarks } = req.body;
        const reminder = await AddReminder({
            user: user.id,
            vehicle: vehicle_id,
            service_type: service_type,
            date: date,
            remarks: remarks
        })
        const data = await AddReminder.find({ $and: [{ user: user.id, vehicle: vehicle_id, service_type: service_type, date: date }] });
        if (data.length > 0) {
            res.status(400).send({
                success: false,
                msg: "This Reminders already exists!"
            })
        }
        else {
            const add = await reminder.save();
            res.status(200).send({
                success: true,
                msg: 'Reminder added successfully !',
                response: add
            })
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const getReminders = async (req, res) => {
    const data = await AddReminder.find().populate({ path: 'service_type', select: '_id name image' });
    if (data.length > 0) {
        res.status(200).send({
            success: true,
            msg: '',
            response: data
        })
    }
    else {
        res.status(400).send({
            success: false,
            msg: "Reminder not found !"
        })
    }
}

const UserReminders = async (req, res) => {
    const data = await AddReminder.find({ user: req.user.id }).populate({ path: 'service_type', select: '_id name image' });
    if (data.length > 0) {
        res.status(200).send({
            success: true,
            msg: '',
            response: data
        })
    }
    else {
        res.status(400).send({
            success: false,
            msg: "Reminder not found !"
        })
    }
}
const updateReminder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { id } = req.params;
        const { service_type, date, remarks } = req.body;
        const data = await AddReminder.findByIdAndUpdate({ _id: id }, { $set: { service_type: service_type, date: date, remarks: remarks } });
        if (data == null) {
            res.status(400).send({
                success: false,
                msg: "id not exist"
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: "Reminder updated successfully !"
            })
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const deleteReminder = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await AddReminder.findByIdAndDelete({ _id: id });
        if (data == null) {
            res.status(400).send({
                success: false,
                msg: "id not exist"
            })
        }
        else {
            res.status(200).send({
                success: false,
                msg: "Reminder deleted successfully !"
            })
        }
    }
    catch (error) {
        res.status(400).send({
            success: false,
            msg: error.message
        })
    }
}

const getReminderById = async (req, res) => {
    const { reminderId } = req.params;
    const reminder = await AddReminder.find({ _id: reminderId });
    try {
        if (!reminder) {
            res.status(200).send({
                success: false,
                msg: 'Reminder not found! '
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: '',
                data: reminder
            })
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }

}

/// get  based on category

const getMake = async (req, res) => {
    try {
        const make = await Make.find().select('name');
        if (make.length < 1) {
            res.status(400).send({
                success: false,
                msg: "Make not found !"
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: '',
                data: make
            })
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const getModelbymake = async (req, res) => {
    const { makeId } = req.params;
    const data = await Model.find({ make_id: makeId }).select('name');
    if (data.length > 0) {
        res.status(200).send({
            success: true,
            msg: '',
            data: data
        })
    }
    else {
        res.status(400).send({
            success: false,
            msg: 'Model not found !'
        })
    }
}

const getYearbyModel = async (req, res) => {
    const { modelId } = req.params;
    const data = await Year.find({ model_id: modelId }).select('year').sort({ createdAt: -1 });
    if (data.length > 0) {
        res.status(200).send({
            success: true,
            msg: '',
            data: data
        })
    }
    else {
        res.status(400).send({
            success: false,
            msg: 'Year not found !'
        })
    }
}

const getmodificationbycat = async (req, res) => {
    const { makeId, modelId, yearId } = req.body;
    //const {  makeId, modelId, yearId }=req.params;

    const data = await Modification.find({ make_id: makeId, model_id: modelId, year_id: yearId }).select('name');
    if (data.length > 0) {
        res.status(200).send({
            success: true,
            msg: '',
            data: data
        })
    }
    else {
        res.status(400).send({
            success: false,
            msg: 'Modification not found !'
        })
    }
}

////////////////// new

const findMake = async (req, res) => {
    try {
        const make = await Make.find().select('name');
        const data = [];
        make.forEach((item) => {
            data.push({
                id: item._id,
                name: item.name
            })
        })
        if (make.length < 1) {
            res.status(200).send({
                success: false,
                msg: "Make not found !"
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: '',
                data: data
            })
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const findModel = async (req, res) => {
    const { makeId } = req.params;
    const model = await Model.find({ make_id: makeId }).select('name');
    const data = [];
    model.forEach((item) => {
        data.push({
            id: item._id,
            name: item.name
        })
    })
    if (data.length > 0) {
        res.status(200).send({
            success: true,
            msg: '',
            data: data
        })
    }
    else {
        res.status(200).send({
            success: false,
            msg: 'Model not found !'
        })
    }
}

const findYear = async (req, res) => {
    const { modelId } = req.params;
    const year = await Year.find({ model_id: modelId }).select('year').sort({ createdAt: -1 });
    const data = [];
    year.forEach((item) => {
        data.push({
            id: item._id,
            name: item.year
        })
    })
    if (data.length > 0) {
        res.status(200).send({
            success: true,
            msg: '',
            data: data
        })
    }
    else {
        res.status(200).send({
            success: false,
            msg: 'Year not found !'
        })
    }
}

const findModification = async (req, res) => {
    const { makeId, modelId, yearId } = req.body;
    //const {  makeId, modelId, yearId }=req.params;

    const modify = await Modification.find({ make_id: makeId, model_id: modelId, year_id: yearId }).select('name');
    const data = [];
    modify.forEach((item) => {
        data.push({
            id: item._id,
            name: item.name
        })
    })
    if (data.length > 0) {
        res.status(200).send({
            success: true,
            msg: '',
            data: data
        })
    }
    else {
        res.status(200).send({
            success: false,
            msg: 'Modification not found !'
        })
    }
}

const ServicesList = async (req, res) => {
    const service = await AddServices.find().select('_id name image');
    const data = [];
    service.forEach((item) => {
        data.push({
            id: item._id,
            name: item.name,
            image: item.image
        })
    })
    if (data.length > 0) {
        res.status(200).send({
            success: true,
            msg: '',
            response: data
        })
    }
    else {
        res.status(400).send({
            success: false,
            msg: "services not found !"
        })
    }
}


module.exports = {
    addvehicleType, AddVehicleMake, AddVehicleModel, AddvehicleYear, getVehTypes, updateVehType, deleteVehType, updateMake, deleteMake, getMakewithcat, getMake, getModel, updateModel, deleteModel, getYear, updateYear, deleteYear, addServices, getServicesList, addReminder, editServices, deleteServices, addModification, getModification,
    getReminders, updateReminder, deleteReminder, updateModification, deleteModification, getModelbymake, getYearbyModel, getmodificationbycat, getMakeList, UserReminders, getReminderById,
    VehicleTypeById, MakeById, ModelById, yearById, modfyById, findMake, findModel, findYear, findModification, ServicesList
}

// server:  http://52.15.47.207:4000/
// make api for get User ordered history and option for reorders in node js and mongoose

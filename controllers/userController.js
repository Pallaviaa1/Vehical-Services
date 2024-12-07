const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { User, Address, Data, Value } = require('../models/usersModel');
const { AddVehicle } = require('../models/vehicleModel')
const sendMail = require('../helpers/sendMail')
const rendomString = require('randomstring');
const Token = require('../models/tokenModel');
var jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}
const userReg = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const { firstname, lastname, email, phone } = req.body;
    var password = await hashPassword(req.body.password);
    const user = new User({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
        phone: phone,
        user_type: "Customer"
    })

    try {
        var userfind = await User.find({ $and: [{ $or: [{ email: email }, { phone: phone }] }, { user_type: "Customer" }] });
        if (userfind.length > 0) {
            res.status(400).send({
                success: false,
                msg: "Email or phone number already exist"
            })
        }
        else {
            await user.save();
            res.status(200).send({
                success: true,
                msg: "user registered successfully"
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

const userlogin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { email, password } = req.body;
        const user = await User.find({ $and: [{ email: email }, { user_type: "Customer" }] });
        if (user.length > 0) {
            const usercheck = await validatePassword(password, user[0].password);
            if (usercheck) {
                const token = jwt.sign({ id: user[0]._id, firstname: user[0].firstname, lastname: user[0].lastname, user_type: user[0].user_type }, JWT_SECRET, { expiresIn: '2h' });
                if (user[0].status === true && user[0].isDeleted === 0) {
                    res.cookie('token', token, {
                        httpOnly: true,
                        // You can set additional cookie options here, such as 'secure: true' for HTTPS only
                    });
                    res.status(200).send({
                        success: true,
                        msg: "user login successfully",
                        data: user[0],
                        token: token
                    })
                }
                else {
                    if (user[0].isDeleted == 1) {
                        res.status(400).send({
                            success: false,
                            msg: "Your account is Deleted by admin !"
                        })
                    }
                    else {
                        res.status(400).send({
                            success: false,
                            msg: "Your account is Inactive by admin !"
                        })
                    }
                }
            }
            else {
                res.status(400).send({
                    success: false,
                    msg: "Incorrect password"
                })
            }
        }
        else {
            res.status(400).send({
                success: false,
                msg: "Incorrect email id"
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


const userUpdate = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        var { firstname, lastname, email, phone } = req.body;
        const existingUser = await User.findOne({
            $and: [{ $or: [{ phone }, { email }] }, { user_type: "Customer" }],
            _id: { $ne: req.user.id } // Exclude the current user from the check
        });
        if (existingUser) {
            return res.status(400).send({
                success: false,
                msg: "Mobile number or email already exists !"
            });
        }
        else {
            if (req.file == undefined) {
                var update = await User.findByIdAndUpdate({ _id: req.user.id }, { $set: { firstname: firstname, lastname: lastname, email: email, phone: phone } })

                if (update == null) {
                    res.status(400).send({
                        success: false,
                        msg: "id doesn't exist"
                    })
                }
                else {
                    res.status(200).send({
                        success: true,
                        msg: "Update details successfully"
                    })
                }
            }
            else {
                var update = await User.findByIdAndUpdate({ _id: req.user.id }, { $set: { firstname: firstname, lastname: lastname, email: email, profile: req.file.filename, phone: phone } })

                if (update == null) {
                    res.status(400).send({
                        success: false,
                        msg: "id doesn't exist"
                    })
                }
                else {
                    res.status(200).send({
                        success: true,
                        msg: "Update details successfully"
                    })
                }
            }
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const userChangePassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        var { oldpassword, newpassword, confirmpassword } = req.body;
        const old = await User.find({ _id: req.user.id }).select('password -_id');
        const usercheck = await validatePassword(oldpassword, old[0].password);
        if (usercheck) {
            if (newpassword !== confirmpassword) {
                res.status(400).send({
                    success: false,
                    msg: "New Password and Confirm Password doesn't match !"
                })
            }
            else {
                let password = await bcrypt.hash(confirmpassword, 10);
                let reset = await User.findByIdAndUpdate({ _id: req.user.id }, { $set: { password: password } })
                if (reset) {
                    res.status(200).send({
                        success: true,
                        msg: "Changed password sucessfully !"
                    })
                }
                else {
                    res.status(400).send({
                        success: false,
                        msg: "id doesn't exist!"
                    })
                }
            }
        }
        else {
            res.status(400).send({
                success: false,
                msg: "Old password Incorret !"
            })
        }

    } catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const userForgotPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        var { mobile } = req.body;
        const phone = await User.find({ _id: req.user.id }).select('phone -_id');
        if (phone.length > 0) {
            if (mobile == phone[0].phone) {
                res.status(200).send({
                    success: true,
                    msg: 'Otp send Successfully !'
                })
            }
            else {
                res.status(400).send({
                    success: false,
                    msg: 'Incorrect phone number !'
                })
            }
        }
        else {
            res.status(400).send({
                success: false,
                msg: "User not Exist!"
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

const userResetPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { phone, resetPassword } = req.body;
        const mobile = await User.find({ $and: [{ phone: phone }, { user_type: "Customer" }] });
        if (mobile.length > 0) {
            let password = await bcrypt.hash(resetPassword, 10);
            const data = await User.findByIdAndUpdate({ _id: mobile[0]._id }, { $set: { password: password } })
            res.status(200).send({
                success: true,
                msg: 'Password reset successfully !'
            })
        }
        else {
            res.status(400).send({
                success: false,
                msg: "Incorrect phone number !"
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

const addVehicles = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const { make, model, year, fuel_type } = req.body;
    const add = new AddVehicle(
        {
            userId: req.user.id,
            make: make,
            model: model,
            year: year,
            fuel_type: fuel_type
        }
    )
    try {
        const data = await AddVehicle.find({ $and: [{ make: make, model: model, year: year, fuel_type: fuel_type }, { userId: req.user.id }] });
        if (data.length > 0) {
            res.status(400).send({
                success: false,
                msg: "vehicle already added!"
            })
        }
        else {
            const vehicle = await add.save();
            res.status(200).send({
                success: true,
                msg: "Vehicle added successfully!",
                response: vehicle
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

const getAllVehicles = async (req, res) => {
    const data = await AddVehicle.find({ userId: req.user.id }).populate({ path: 'make', select: '_id name' }).populate({ path: 'model', select: '_id name' }).
        populate({ path: 'year', select: '_id year' }).populate({ path: 'fuel_type', select: '_id, name' });

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
            msg: "Vehicle not found !"
        })
    }
}

const DeleteVehicle = async (req, res) => {
    const { vehicleId } = req.params;
    try {
        const data = await AddVehicle.deleteOne({ _id: vehicleId });
        if (data.deletedCount < 1) {
            res.status(400).send({
                success: false,
                msg: 'Vehicle not Exist !'
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: 'Vehicle deleted successfully !'
            })
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            error: error.message
        })
    }
}

const addAddress = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { name, phone, street, country, state, city, pincode, landmark } = req.body;
        const useraddress = new Address({
            user_id: req.user.id,
            address: [{
                name: name,
                phone: phone,
                street: street,
                country: country,
                state: state,
                city: city,
                pincode: pincode,
                landmark: landmark
            }]
        })

        const data = await Address.findOne({ user_id: req.user.id });
        if (data == null) {
            const add = await useraddress.save();
            res.status(200).send({
                success: true,
                msg: 'Add address successfully',
                data: add
            })
        }
        else {
            var addaddress = [];
            for (let i = 0; i < data.address.length; i++) {
                addaddress.push(data.address[i]);
            }
            addaddress.push({
                name: name,
                phone: phone,
                street: street,
                country: country,
                state: state,
                city: city,
                pincode: pincode,
                landmark: landmark
            });

            const updatedata = await Address.findOneAndUpdate({ user_id: req.user.id }, { $set: { address: addaddress } }, { returnDocument: "after" });
            res.status(200).send({
                success: true,
                msg: "Add address successfully",
                data: updatedata
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

const getAllAddress = async (req, res) => {
    try {
        const data = await Address.findOne({ user_id: req.user.id });
        if (data == null) {
            res.status(400).send({
                success: false,
                msg: 'No address found'
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

const editAddress = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { id, name, phone, street, country, state, city, pincode, landmark } = req.body;
        const userfind = await Address.findOne({ user_id: req.user.id })
        if (userfind == null) {
            res.status(400).send({
                success: false,
                msg: "There is no address data for user !"
            })
        }
        else {
            const data = await Address.findOneAndUpdate({ 'address._id': id }, {
                '$set': {
                    'address.$.name': name, 'address.$.phone': phone,
                    'address.$.street': street, 'address.$.country': country,
                    'address.$.state': state, 'address.$.city': city, 'address.$.pincode': pincode, 'address.$.landmark': landmark
                }
            });
            if (data == null) {
                res.status(400).send({
                    success: false,
                    msg: " address id not exist !"
                })
            }
            else {
                res.status(200).send({
                    success: true,
                    msg: "Address updated successfullly !"
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

const deleteAddress = async (req, res) => {
    try {
        const { id } = req.body;
        const data = await Address.findOne({ user_id: req.user.id });
        if (data == null) {
            res.status(400).send({
                success: false,
                msg: "There is no address data for user !"
            })
        }
        else {
            const dataadd = await Address.updateOne({ user_id: req.user.id },
                { "$pull": { "address": { "_id": id } } },
                { safe: true, multi: true });

            if (dataadd.modifiedCount > 0) {
                res.status(200).send({
                    success: true,
                    msg: "Address deleted  successfully !"
                })
            }
            else {
                res.status(400).send({
                    success: false,
                    msg: "Id not exist !"
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

const getprofile = async (req, res) => {
    try {
        const data = await User.findById({ _id: req.user.id }).select('firstname lastname email phone profile');
        res.status(200).send({
            success: true,
            msg: '',
            data: data
        })
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const logout = async (req, res) => {
    res.clearCookie('token');
    res.status(200).send({
        success: true,
        msg: "Logged out successfully."
    })
}

module.exports = {
    userReg, userlogin, userUpdate, userChangePassword, userForgotPassword, userResetPassword,
    addVehicles, getAllVehicles, addAddress, getAllAddress, editAddress, deleteAddress, getprofile,
    logout, DeleteVehicle
}



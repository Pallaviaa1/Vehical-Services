
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { User } = require('../models/usersModel');
const sendMail = require('../helpers/sendMail')
const rendomString = require('randomstring');
const Token = require('../models/tokenModel');

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

const loginAdmin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { email, password } = req.body;

        const admin = await User.find({ email: email });
        if (admin.length > 0) {
            var adminLogin = await bcrypt.compare(req.body.password, admin[0].password);
            if (adminLogin) {
                if (admin[0].user_type === "Admin") {
                    res.status(200).send({
                        success: true,
                        msg: "Admin login successfully!",
                        data: admin
                    })
                }
                else {
                    res.status(400).send({
                        success: false,
                        msg: "Invalid Email Id and password"
                    })
                }
            }
            else {
                res.status(400).send({
                    success: false,
                    msg: "Password Incorrect!"
                })
            }
        }
        else {
            res.status(400).send({
                success: false,
                msg: "Invalid email Id!"
            })
        }

    } catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const changePasswordAdmin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const { id, newpassword, confirmpassword } = req.body;

    try {
        if (!id) {
            res.status(400).send({
                success: false,
                msg: 'please provide id !'
            })
        }
        else {
            if (newpassword !== confirmpassword) {
                res.status(400).send({
                    success: false,
                    msg: "New Password and Confirm Password doesn't match !"
                })
            }
            else {
                let password = await bcrypt.hash(confirmpassword, 10);
                let reset = await User.findByIdAndUpdate({ _id: id }, { $set: { password: password } })
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
    } catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}


const updateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { id } = req.params;
        var { firstname, lastname, email, phone } = req.body;
        const existingUser = await User.findOne({
            $and: [{ $or: [{ phone }, { email }] }, { user_type: "Admin" }],
            _id: { $ne: id } // Exclude the current user from the check
        });
        if (existingUser) {
            return res.status(400).send({
                success: false,
                msg: "Mobile number or email already exists !"
            });
        }
        else {
            if (req.file == undefined) {
                var update = await User.findByIdAndUpdate({ _id: id }, { $set: { firstname: firstname, lastname: lastname, email: email, phone: phone } })

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
                var update = await User.findByIdAndUpdate({ _id: id }, { $set: { firstname: firstname, lastname: lastname, email: email, profile: req.file.filename, phone: phone } })

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

const forgotPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const user = await User.findOne({ email: req.body.email })
        if (user) {
            email = user.email;
            mailSubject = "Forgot Password";
            const randomToken = rendomString.generate();
            content = 'Hi ' + user.firstname + ', <p> Please click the link below to reset your password. </p> <p> <span style="background: #6495ED; padding: 5px;"> <a style="color: white; text-decoration: none;  font-weight: 600;" href="http://localhost:4000/api/reset-password?token=' + randomToken + '">Click Here </a> </span> </p>';
            sendMail(email, mailSubject, content);

            const token = new Token({
                email: user.email,
                token: randomToken
            })
            await Token.deleteOne({ email: user.email });
            await token.save();
            res.status(200).send({
                success: true,
                msg: "Email send successfully for reset password !",
                token: randomToken
            })
        }
        else {
            res.status(400).send({
                success: false,
                msg: "Email doesn't exist !"
            })
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const resetPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {

        let tokenfind = await Token.findOne({ token: req.query.token });
        if (tokenfind) {

            let userfind = await User.findOne({ email: tokenfind.email });

            if (userfind) {

                if (req.body.password != req.body.confirmpassword) {
                    res.status(400).send({
                        success: false,
                        msg: "new password and confirm password do not match !"
                    })
                }
                else {
                    let password = await bcrypt.hash(req.body.confirmpassword, 10);
                    await Token.deleteOne({ email: userfind.email })
                    let reset = await User.findByIdAndUpdate({ _id: userfind._id }, { $set: { password: password } })
                    if (!reset) {
                        res.status(400).send({
                            success: false,
                            msg: "Password Not Reset !"
                        })
                    }
                    else {
                        res.status(200).send({
                            success: true,
                            msg: "Password Reset Successfully  !"
                        })
                    }
                }
            }
        }
        else {
            res.status(400).send({
                success: false,
                msg: "This link has been expired !"
            })
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const GetAdminProfile = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            res.status(400).send({
                success: false,
                msg: 'Please provide id !'
            })
        }
        else {
            const admin = await User.findById({ _id: id });
            if (!admin) {
                res.status(400).send({
                    success: false,
                    msg: "Admin not found !"
                })
            }
            else {
                res.status(200).send({
                    success: true,
                    msg: '',
                    data: admin
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

const getUserList = async (req, res) => {
    const user = await User.find({$and: [{user_type: "Customer"}, { isDeleted: 0} ] });
    if (user.length > 0) {
        res.status(200).send({
            success: true,
            msg: "",
            data: user
        })
    }
    else {
        res.status(400).send({
            success: false,
            msg: "User not found",
            data: user
        })
    }
}

const addUser = async (req, res) => {
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
        profile: req.file.filename,
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

const updateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        var { firstname, lastname, email, phone } = req.body;
        const existingUser = await User.findOne({
            $and: [{ $or: [{ phone }, { email }] }, { user_type: "Customer" }],
            _id: { $ne: userId } // Exclude the current user from the check
        });
        if (existingUser) {
            return res.status(400).send({
                success: false,
                msg: "Mobile number or email already exists !"
            });
        }
        else {
            if (req.file == undefined) {
                var update = await User.findByIdAndUpdate({ _id: userId }, { $set: { firstname: firstname, lastname: lastname, email: email, phone: phone } })

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
                var update = await User.findByIdAndUpdate({ _id: userId }, { $set: { firstname: firstname, lastname: lastname, email: email, profile: req.file.filename, phone: phone } })

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

const deleteUser = async (req, res) => {
    const { userId } = req.params;
    const user = await User.find({ _id: userId });
    if (user.length > 0) {
        await User.updateOne({ _id: userId }, { $set: { isDeleted: 1 } })
        res.status(200).send({
            success: true,
            msg: "User deleted successfully"
        })
    }
    else {
        res.status(400).send({
            success: false,
            msg: "User not exist !"
        })
    }
}

const GetUserById = async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById({ _id: userId });
    if (!user) {
        res.status(400).send({
            success: false,
            msg: "User not exist !"
        })
    }
    else {
        res.status(200).send({
            success: true,
            msg: '',
            data: user
        })
    }
}

const getMerchant = async (req, res) => {
    const merchant = await User.find({ user_type: "Merchant" });
    if (merchant.length > 0) {
        res.status(200).send({
            success: true,
            msg: "",
            data: merchant
        })
    }
    else {
        res.status(400).send({
            success: false,
            msg: "Merchant not found"
        })
    }
}

const addMerchant = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const { firstname, lastname, email, phone } = req.body;
    var password = await hashPassword(req.body.password);
    const user = new User(
        {
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: password,
            phone: phone,
            user_type: "Merchant"
        }
    )
    try {
        const find = await User.find({ $and: [{ $or: [{ email: email }, { phone: phone }] }, { user_type: "Merchant" }] });
        if (find.length > 0) {
            res.status(400).send({
                success: false,
                msg: "Email or phone number already exist"
            })
        }
        else {
            await user.save();
            res.status(200).send({
                success: true,
                msg: "Merchant registered successfully"
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

const updateMerchant = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { merchantId } = req.params;
        var { firstname, lastname, email, phone } = req.body;
        const existingUser = await User.findOne({
            $and: [{ $or: [{ phone }, { email }] }, { user_type: "Merchant" }],
            _id: { $ne: merchantId } // Exclude the current user from the check
        });
        if (existingUser) {
            return res.status(400).send({
                success: false,
                msg: "Mobile number or email already exists !"
            });
        }
        else {
            if (req.file == undefined) {
                var update = await User.findByIdAndUpdate({ _id: merchantId }, { $set: { firstname: firstname, lastname: lastname, email: email, phone: phone } })
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
                var update = await User.findByIdAndUpdate({ _id: merchantId }, { $set: { firstname: firstname, lastname: lastname, email: email, profile: req.file.filename, phone: phone } })

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

const deleteMerchant = async (req, res) => {
    const { id } = req.body;
    const user = await User.find({ _id: id });
    if (user.length > 0) {
        await User.deleteOne({ _id: id })
        res.status(200).send({
            success: true,
            msg: "Merchant deleted successfully"
        })
    }
    else {
        res.status(400).send({
            success: false,
            msg: "Merchant not exist !"
        })
    }
}

const updateStatus = async (req, res) => {
    try {
        const { id } = req.body;
        var status;
        const data = await User.find({ _id: id }).select('status');
        if (data[0].status == true) {
            status = false;
        }
        else {
            status = true;
        }
        await User.updateOne({ _id: id }, { $set: { status: status } });
        res.status(200).send(
            {
                success: true,
                msg: "update status successfully !"
            }
        )
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

module.exports = {
    loginAdmin, changePasswordAdmin, updateProfile, forgotPassword,
    resetPassword, getUserList, addUser, updateUser, deleteUser, getMerchant, addMerchant, deleteMerchant,
    updateMerchant, updateStatus, GetAdminProfile, GetUserById
};

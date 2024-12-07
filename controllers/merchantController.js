const { User } = require('../models/usersModel');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const sendMail = require('../helpers/sendMail')
const rendomString = require('randomstring');
const Token = require('../models/tokenModel');
var jwt = require('jsonwebtoken');
const { Product } = require('../models/productModel');
const { JWT_SECRET } = process.env;


async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

const regMerchant = async (req, res) => {
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
        const find = await User.find({ $or: [{ email: email }, { phone: phone }] });
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
                msg: "Merchant registered successfully",
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


const loginMerchant = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const { email, password } = req.body;
    const user = await User.find({ $and: [{ email: email }, { user_type: "Merchant" }] });

    if (user.length > 0) {
        const usercheck = await validatePassword(password, user[0].password);
        if (usercheck) {
            const token = jwt.sign({ id: user[0]._id, firstname: user[0].firstname, lastname: user[0].lastname, user_type: user[0].user_type }, JWT_SECRET, { expiresIn: '2h' });
            if (user[0].user_type === "Merchant") {
                res.status(200).send({
                    success: true,
                    msg: "Merchant login successfully",
                    data: user,
                    Token: token
                })
            }
            else {
                res.status(400).send({
                    success: false,
                    msg: "Email or password incorrect  !"
                })
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

const merChangePass = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { newpassword, confirmpassword } = req.body;
        if (newpassword !== confirmpassword) {
            res.status(400).send({
                success: false,
                msg: "New Password and Confirm Password doesn't match !"
            })
        }
        else {
            var password = await hashPassword(confirmpassword);
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
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const merForgotPass = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        var { email } = req.body;
        const user = await User.findOne({ $and: [{ email: email }, { user_type: "Merchant" }] });
        if (user) {
            email = user.email;
            mailSubject = "Forget Password";
            const randomToken = rendomString.generate();
            content = 'hii ' + user.firstname + ', Please <a href="http://localhost:8000/api/merchant/reset-password?token=' + randomToken + '">Click Here </a> to reset your pasword';
            sendMail(email, mailSubject, content);


            const token = new Token({
                email: user.email,
                token: randomToken
            })
            await Token.deleteOne({ email: user.email });
            await token.save();
            res.status(200).send({
                success: true,
                msg: "Email send successfully for reset password !"
            })
        }
        else {
            res.status(400).send({
                success: false,
                msg: "Email doesn't exist !"
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

const merchResetPass = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        let tokenfind = await Token.findOne({ token: req.query.token });
        if (tokenfind) {

            let userfind = await User.findOne({ $and: [{ email: tokenfind.email }, { user_type: "Merchant" }] });

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
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const merUpdateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        var { firstname, lastname, email, phone } = req.body;
        const existingUser = await User.findOne({
            $and: [{ $or: [{ phone }, { email }] }, { user_type: "Merchant" }],
            _id: { $ne: req.user.id } // Exclude the current user from the check
        });
        if (existingUser) {
            return res.status(400).send({
                success: false,
                msg: "Mobile number or email already exists !"
            });
        }
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

    } catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

module.exports = {
    regMerchant, loginMerchant, merChangePass, merForgotPass,
    merchResetPass, merUpdateProfile
}
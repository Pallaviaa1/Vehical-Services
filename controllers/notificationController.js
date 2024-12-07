const { validationResult, body } = require('express-validator');
const { User } = require('../models/usersModel');
const admin = require("../services/firebaseAdmin");
const { Product } = require('../models/productModel');


// first of all need to craete a collection and store token and userID to database

let send_notification = (tokens, payload) => {

    let options = {
        priority: "normal",
        timeToLive: 60 * 60
    };
    return new Promise(function (resolve, reject) {
        admin.messaging().send(tokens, payload, options)
            .then(function (response) {
                resolve({ message: response });
            })
            .catch(function (error) {
                reject({ error: error });
            });
    })

};

const send_notification_to_all = async (req, res) => {
    const { title, msg, data } = req.body;
    if (msg === undefined || msg === "" || title === undefined || title === "" || data === undefined) {
        res.status(400).send({
            success: false,
            msg: "Title, msg and data are required"
        })
    }
    else {
        let payload;
        payload = {
            notification: {
                title: title,
                body: msg,
            },
            data: data
        }
        await User.find().exec().then(users => {
            let tokens = users.map((user) => {
                return user.token;
            });

            if (tokens.length > 0) {
                let returnJson = [];
                let statusCode = 200;
                let noOfLoads = tokens.length / 1000;
                if (tokens.length % 1000 !== 0) {
                    noOfLoads++;
                }
                noOfLoads = Math.floor(noOfLoads);

                for (let i = 0; i < noOfLoads; i++) {
                    let start = i * 1000, end = (i + 1) * 1000;
                    let batchTokens = tokens.slice(start, end);
                    send_notification(batchTokens, payload).then(jsonObj => {
                        returnJson.push({ loadNumber: i + 1, success: jsonObj });
                        if (i + 1 === noOfLoads) {
                            res.status(statusCode).json(returnJson);
                        }
                    }).catch(error => {
                        returnJson.push({ loadNumber: i + 1, error: error });
                        statusCode = 500;
                        if (i + 1 === noOfLoads) {
                            res.status(statusCode).json(returnJson);
                        }
                    });
                }
            }
            else {
                res.status(200).json({ message: "no tokens to send to" })
            }
        }).catch(err => {
            res.status(500).json({
                error: err,
            });
        });
    }
}


const send_notification_to_specific = async (req, res) => {
    const { ids, title, msg, data } = req.body;
    if (ids === undefined || title === undefined || msg === undefined || data === undefined || title === "" || msg === "") {
        res.status(400).send({
            success: false,
            msg: "ids, title, msg, and data are required !"
        })
    }
    else {
        let payload = {
            notification: {
                title: title,
                body: msg
            },
            data: data
        }
        await User.find({ userId: ids }).select('_id token').then(users => {
            let tokens = users.map((user) => {
                return user.token;
            })
            if (tokens.length > 0) {
                send_notification(tokens, payload).then(jsonObj => {
                    res.status(200).json(jsonObj);
                }).catch(error => {
                    res.status(500).json(error);
                })
            }
            else {
                res.status(400).json({ message: 'No valid ids' });
            }
        }).catch(error => {
            res.status(500).json({
                error: error
            })
        })
    }
}

module.exports = {
    send_notification_to_all, send_notification_to_specific
}

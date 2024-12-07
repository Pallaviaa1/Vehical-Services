const { validationResult } = require('express-validator');
const { Product, Category, Cart, Order_Item, RequestItem, orderitem } = require('../models/productModel');
const { Address } = require('../models/usersModel');
const _ = require("lodash");
const scheduleLib = require("node-schedule");
const admin = require("../services/firebaseAdmin");
const { User } = require('../models/usersModel');
const Notification = require("../models/notificationModel");
const shortid = require('shortid');
const { response } = require('express');
const { access } = require('fs');


function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

const addCategory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { name } = req.body;
        const category = new Category({
            name: name,
            image: req.file.filename
        })
        const namefind = await Category.find();
        if (namefind) {
            let checking = false;
            for (let i = 0; i < namefind.length; i++) {
                if (namefind[i].name === name) {
                    checking = true;
                    break;
                }
            }
            if (checking == false) {
                const data = await category.save();
                res.status(200).send(
                    {
                        success: true,
                        msg: "Category added successfully",
                        data: data
                    }
                )
            }
            else {
                res.status(400).send({
                    success: false,
                    msg: "Category is already exist !"
                })
            }
        }
        else {
            const data = await category.save();
            res.status(200).send(
                {
                    success: true,
                    msg: "Category added successfully",
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

const getCategory = async (req, res) => {
    try {
        const category = await Category.find({ $and: [{ status: true }, { isDeleted: 0 }] });
        if (category.length > 0) {
            res.status(200).send({
                success: true,
                msg: "",
                response: category
            })
        }
        else {
            res.status(400).send({
                success: false,
                msg: "Category not found"
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

const updateCategory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { id } = req.params;
        const { name } = req.body;
        const update = await Category.findByIdAndUpdate({ _id: id }, { $set: { name: name, image: req.file.filename } });
        if (update == null) {
            res.status(400).send({
                success: false,
                msg: "id doesn't exist"
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: "update category successfully !"
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

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Category.updateOne({ _id: id }, { $set: { isDeleted: 1 } });
        if (data.modifiedCount < 1) {
            res.status(400).send({
                success: false,
                msg: " Id not exist !"
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: "Category deleted successfully !"
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

const getCategoryById = async (req, res) => {
    const { CategoryId } = req.body;
    try {
        if (!CategoryId) {
            res.status(400).send({
                success: false,
                msg: "Please enter Category id !"
            })
        }
        else {
            const category = await Category.findById({ _id: CategoryId });
            if (!category) {
                res.status(400).send({
                    success: false,
                    msg: "Category not exist !"
                })
            }
            else {
                res.status(200).send({
                    success: true,
                    msg: '',
                    data: category
                })
            }
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            error: error.message
        })
    }
}

const addProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { title, description, category, vehicle_type, make, model, year, modification, price, qty } = req.body;
        const { files } = req;
        const images = files.map((file) => file.filename);
        const product = new Product({
            //merchant: req.user.id,
            title: title,
            description: description,
            image: images,
            category: category,
            vehicle_type: vehicle_type,
            make: make,
            model: model,
            year: year,
            modification: modification,
            price: price,
            qty: qty
        })

        const data = await product.save();
        res.status(200).send({
            success: true,
            msg: "Product added sucessfully !",
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

const getProductList = async (req, res) => {
    const data = await Product.find().populate({ path: 'vehicle_type', select: '_id name' }).
        populate({ path: 'make', select: '_id name' }).populate({ path: 'model', select: '_id name' }).populate({ path: 'year', select: '_id year' }).populate({ path: 'category', select: 'name' });
    if (data.length > 0) {
        res.status(200).send({
            success: true,
            msg: "",
            response: data
        })
    }
    else {
        res.status(400).send({
            success: false,
            msg: "Product not found !"
        })
    }
}

const editProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const id = req.params.id;
        const { title, description, vehicle_type, make, model, year, price, qty } = req.body;
        const { files } = req;
        const images = files.map((file) => file.filename);
        const product = await Product.findByIdAndUpdate({ _id: id }, { $set: { title: title, description: description, image: images, vehicle_type: vehicle_type, make: make, model: model, year: year, price: price, qty: qty } })
        if (product == null) {
            res.status(400).send({
                success: false,
                msg: "id not exist !"
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: "Update product sucessfully !"
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

const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Product.findByIdAndDelete({ _id: id });
        if (data == null) {
            res.status(400).send({
                success: false,
                msg: "Id not exist !"
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: "Deleted product sucessfully !"
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


const addToCart = async (req, res) => {
    try {
        const { productId, quantity, name, price } = req.body;

        /* let product = await Product.find({ _id: productId }).select('merchant');
        const merchantId = product[0].merchant; */
        let cart = await Cart.findOne({ userId: req.user.id });
        if (cart) {
            //cart exists for user
            let itemIndex = cart.products.findIndex(p => p.productId == productId);

            if (itemIndex > -1) {
                //product exists in the cart, update the quantity
                let productItem = cart.products[itemIndex];
                productItem.quantity = productItem.quantity + quantity;

                cart.products[itemIndex] = productItem;
                cart.bill = cart.products.reduce((acc, curr) => {
                    return acc + curr.quantity * curr.price;
                }, 0)

            } else {
                //product does not exists in cart, add new item
                cart.products.push({ productId, quantity, name, price });
                cart.bill = cart.products.reduce((acc, curr) => {
                    return acc + curr.quantity * curr.price;
                }, 0)
            }
            cart = await cart.save();

            return res.status(200).send({
                success: true,
                msg: "",
                data: cart
            })
        }
        else {
            const newCart = await Cart.create({
                userId: req.user.id,
                products: [{ productId, quantity, name, price }],
                bill: quantity * price
            });
            return res.status(200).send({
                success: true,
                msg: "",
                data: newCart
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

const getCartProduct = async (req, res) => {
    try {
        const cartproduct = await Cart.find({ userId: req.user.id });
        res.status(200).send({
            success: true,
            data: cartproduct
        })
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const removeToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        var cart = await Cart.findOne({ userId: req.user.id });
        const itemIndex = cart.products.findIndex((product) => product.productId == productId);
        if (itemIndex > -1) {
            let item = cart.products[itemIndex];
            cart.bill -= item.quantity * item.price;
            if (cart.bill < 0) {
                cart.bill = 0
            }
            cart.products.splice(itemIndex, 1);
            cart.bill = cart.products.reduce((acc, curr) => {
                return acc + curr.quantity * curr.price;
            }, 0)
            cart = await cart.save();

            res.status(200).send({
                success: true,
                msg: 'Item successfully remove from cart'
            });
        } else {
            res.status(404).send({
                success: false,
                msg: "item not found"
            });
        }
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const updateProductQty = async (req, res) => {
    try {
        const { id, quantity } = req.body;
        var cart = await Cart.findOne({ userId: req.user.id });
        if (cart) {
            if (cart.products[0]._id == id) {
                const product = await Cart.findOne({ "products._id": id });
                const data = await Cart.updateOne(
                    { 'products._id': id },
                    { '$set': { "products.$.quantity": quantity } }
                )
                if (data.modifiedCount > 0) {
                    const item = await Cart.findOne({ "products._id": id });
                    var total = item.products.reduce((acc, curr) => {
                        return acc + curr.quantity * curr.price;
                    }, 0)
                    const billupdate = await Cart.updateOne({ 'products._id': id },
                        { '$set': { bill: total } })
                }
                res.status(200).send({
                    success: true,
                    msg: "Update quantity of product !"
                })
            }
            else {
                res.status(400).send({
                    success: false,
                    msg: "Product id not exist !"
                })
            }
        }
        else {
            res.status(400).send({
                success: false,
                msg: "There is no product in cart !"
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

const OrderProduct = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });

        var orderNumber = shortid.generate();
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 7);
        const date = formatDate(deliveryDate);
        if (cart == null) {
            res.status(400).send({
                success: true,
                msg: 'user has no items in the cart !'
            })
        }
        else {
            const cartdata = cart.products;
            const { addressId } = req.body;
            let address = await Address.find(
                { "address._id": addressId },
                { "address.$": 1 });
            var addressarray;
            address.forEach((item) => {
                addressarray = item;
            })
            var totalQty = 0;
            for (let i = 0; i < cart.products.length; i++) {
                totalQty = totalQty + cart.products[i].quantity
            }
            const order = new Order({
                user: req.user.id,
                cart: {
                    totalQty: totalQty,
                    totalCost: cart.bill[0],
                    items: cart.products
                },
                address: addressarray.address,
                paymentId: req.body.paymentId,
                orderNumber: orderNumber,
                deliveryDate: date
            })

            const neworder = await order.save();
            let order_Item;
            cartdata.forEach(item => {
                order_Item = new Order_Item({
                    userId: req.user.id,
                    productId: item.productId,
                    orderId: neworder._id,
                    quantity: item.quantity,
                    totalamount: item.quantity * item.price
                })
            })
            await order_Item.save();
            await Cart.findByIdAndDelete(cart._id);

            res.status(200).send({
                success: true,
                msg: '',
                response: neworder
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

const orderConfirmation = async (req, res) => {
    const { orderId } = req.body;
    if (!orderId) {
        res.status(400).send({
            success: false,
            msg: "Please enter order id!"
        })
    }
    else {
        const order = await Order.findById(orderId).select('orderNumber deliveryDate');
        //console.log(order.deliveryDate)
        try {
            const date = (formatDate(order.deliveryDate))
            const orders = {
                _id: order._id,
                orderNumber: order.orderNumber,
                deliveryDate: date,
            }
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.status(200).send({
                success: true,
                msg: 'order confirmation',
                data: orders
            })
        }
        catch (error) {
            res.status(500).send({
                success: false,
                msg: error.message
            })
        }
    }
}

// user get orders list
const getOrderDetails = async (req, res) => {
    const data = await Order_Item.find({ userId: req.user.id }).populate({ path: 'productId', select: ('title image -_id') })
        .populate({ path: 'orderId', select: ('address order_status -_id') }).sort({ createdAt: -1 });
    if (data.length > 0) {
        res.status(200).send({
            success: true,
            response: data
        })
    }
    else {
        res.status(400).send({
            success: false,
            msg: 'User with no order history !'
        })
    }
}


///merchant have own product ordered list
const getOrderList = async (req, res) => {
    try {
        const data = await Order_Item.find().populate({ path: 'userId', select: 'firstname lastname' }).
            populate({ path: 'productId', select: 'title image price' }).populate({ path: 'orderId', select: 'order_status' });
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
                msg: "No oreders list",
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

//merchant update order status
const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const dataadd = await Order.findByIdAndUpdate({ _id: orderId }, { $set: { order_status: status } });
    if (dataadd == null) {
        res.status(400).send({
            success: false,
            msg: "order id not exist !"
        })
    }
    else {
        res.status(200).send({
            success: true,
            msg: "update order status successfully !"
        })
    }
}

const orderCancel = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            res.status(400).send({
                success: false,
                msg: "Please enter order id!"
            })
        }
        else {
            const order = await Order_Item.find({ _id: orderId });
            if (order.length > 0) {
                if (order[0].order_cancel == false) {
                    await Order_Item.findByIdAndUpdate({ _id: orderId }, { $set: { order_cancel: true } });
                    res.status(200).send({
                        success: true,
                        msg: 'order cancel successfully !'
                    })
                }
                else {
                    res.status(400).send({
                        success: false,
                        msg: "order already cancelled !"
                    })
                }
            }
            else {
                res.status(400).send({
                    success: false,
                    msg: "order not found !"
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

const buynow = async (req, res) => {
    try {

    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}


/* const schedule = {};
schedule.createSchedule = async function (data) {
    try {
        const scheduledNotification = new Notification({
            time: data.time,
            days: data.days,
            notification: {
                title: data.title,
                body: data.body,
            },
        });
        const notification = await scheduledNotification.save();
        const dayOfWeek = data.days.join(",");
        const timeToSent = data.time.split(":");
        const hours = timeToSent[0];
        const minutes = timeToSent[1];
        const scheduleId = notification._id.toString();
        const scheduleTimeout = `${minutes} ${hours} * * ${dayOfWeek}`;
        scheduleLib.scheduleJob(scheduleId, scheduleTimeout, async () => {
            const users = await User.find();
            const chunks = _.chunk(users, 500);
            console.log(chunks)
            const promises = chunks.map((u) => {
                /* const tokens = [];
                u.forEach((item) => {
                    if (item.token) {
                        tokens.push(item.token);
                    }
                }); */
/*const payload = {
    //tokens,
    title: data.title,
    body: data.body,
};
return firebaseAdmin.sendMulticastNotification(payload);
});
await Promise.all(promises);
});
}
catch (e) {
throw e;
}
}; */

/* chedule.getJobs = function () {
    return scheduleLib.scheduledJobs;
};

const pushNotification = async (req, res) => {
    try {
        const payload = {
            time: req.body.time,
            days: req.body.days,
            title: req.body.title,
            body: req.body.body,
        };
        await schedule.createSchedule(payload);
        res.send({
            data: {},
            message: "Success",
            success: true,
        });
    }
    catch (e) {
        res.status(400).json({ message: e.message, success: false });
    }

} */

/* 
{
    "days":[3],
    "time":"16:03",
    "title": "this is a title",
    "body": "this is body"
} */

const pushNotification = async (req, res) => {
    const { title, body } = req.body;
    const message = {
        token: 'DEVICE_TOKEN',
        notification: {
            title: title,
            body: body,
        },
    };
    admin.messaging().send(message)
        .then((response) => {
            res.status(200).send({
                success: true,
                msg: 'Successfully sent notification',
                data: response
            })
            //console.log('Successfully sent notification:', response);
        })
        .catch((error) => {
            res.status(500).send({
                success: false,
                msg: 'Error sending notification:',
                data: error
            })
            //console.log('Error sending notification:', error);
        });
}

const multiNotification = async (req, res) => {
    const customers = [
        { token: '<customer1_fcm_token>', userId: 'customer1' },
        { token: '<customer2_fcm_token>', userId: 'customer2' },
        // Add more customers as needed
    ];

    const notifications = customers.map((customer) => {
        const message = {
            token: customer.token,
            notification: {
                title: 'Notification Title',
                body: 'Notification Body',
            }
        };

        // Send the notification for each customer
        return admin.messaging().send(message)
            .then((response) => {
                //console.log(`Successfully sent notification to ${customer.userId}:`, response);
                res.status(200).send({
                    success: true,
                    msg: 'Successfully sent notification',
                    data: response
                })
            })
            .catch((error) => {
                //console.error(`Error sending notification to ${customer.userId}:`, error);
                res.status(500).send({
                    success: false,
                    msg: 'Error sending notification',
                    data: error
                })
            });
    });
}

const reminderNotification = async (req, res) => {

}

const requestItem = async (req, res) => {
    try {
        const { productName, make, model, year, modification } = req.body;
        const Item = new RequestItem({
            user: req.user.id,
            productName: productName,
            make: make,
            model: model,
            year: year,
            modification: modification
        })

        const data = await Item.save();
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

const getProductById = async (req, res) => {
    const { id } = req.body;
    try {
        const product = await Product.findById({ _id: id });
        if (!product) {
            res.status(400).send({
                success: false,
                msg: 'Product not found !'
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: '',
                data: product
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

const categoryStatus = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            res.status(400).send({
                success: false,
                msg: "Please specify category id !"
            })
        }
        else {
            var status;
            const data = await Category.findById({ _id: id }).select('status');
            //console.log(status.status);
            if (data) {
                if (data.status == true) {
                    status = false;
                }
                else {
                    status = true;
                }
                await Category.updateOne({ _id: id }, { status: status });
                res.status(200).send({
                    success: true,
                    msg: 'Successfully updated category status !'
                })
            }
            else {
                res.status(400).send({
                    success: false,
                    msg: 'Category not found !'
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

const orderHistory = async (req, res) => {
    try {
        const order = await Order_Item.find({ userId: req.user.id }).populate({ path: 'productId', select: 'title image' })
            .populate({ path: 'orderId', select: 'address deliveryDate' });
        if (!order) {
            res.status(400).send({
                success: false,
                msg: 'Order not found !'
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: 'Order history',
                data: order
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

const ReOrder = async (req, res) => {
    const { orderId } = req.body;
    try {

        const order = await Order_Item.findOne({ orderId: orderId }).populate({ path: 'productId', select: 'title' }).populate({ path: 'orderId', select: 'address cart' });
        console.log(order)
        if (!order) {
            res.status(400).send({
                success: false,
                msg: "Order not found !"
            })
        }
        else {
            const Address = order.orderId.address;
            //const Cart = order.orderId.cart.items;
            var orderNumber = shortid.generate();
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + 7);
            const date = formatDate(deliveryDate);
            const neworder = new Order({
                user: order.userId,
                cart: {
                    "totalQty": order.quantity,
                    "totalCost": order.totalamount,
                    "items": {
                        "productId": order.productId._id,
                        "quantity": order.quantity,
                        "price": order.totalamount,
                        "name": order.productId.title
                    }
                },
                address: Address,
                paymentId: "456788df322",
                orderNumber: orderNumber,
                deliveryDate: deliveryDate
            })
            const orders = await neworder.save();
            const order_Item = new Order_Item({
                userId: req.user.id,
                productId: order.productId._id,
                orderId: orders._id,
                quantity: order.quantity,
                totalamount: order.totalamount
            })
            await order_Item.save();
            res.status(200).send({
                success: true,
                msg: '',
                response: orders
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

const OrderProducts = async (req, res) => {
    const { addressId, productId, taxPrice, shippingPrice } = req.body;
    let address = await Address.find(
        { "address._id": addressId },
        { "address.$": 1 });
    var addressarray;
    address.forEach((item) => {
        addressarray = item;
    })
    if (req.body.key == 0) {
        const cart = await Cart.find({ userId: req.user.id });
        if (cart.length < 1) {
            res.status(400).send({
                success: true,
                msg: 'user has no items in the cart !'
            })
        }
        else {
            //console.log(cart[0].products.length)
            var totalQty = 0;
            for (let i = 0; i < cart[0].products.length; i++) {
                totalQty = totalQty + cart[0].products[i].quantity
            }
            // console.log(cart[0].bill[0])
            var Allamount;
            if (taxPrice || shippingPrice) {
                if (taxPrice && shippingPrice) {
                    Allamount = cart[0].bill[0] + taxPrice + shippingPrice;
                }
                else {
                    if (shippingPrice) {
                        Allamount = cart[0].bill[0] + shippingPrice;
                    }
                    else {
                        Allamount = cart[0].bill[0] + taxPrice;
                    }
                }
            }
            else {
                Allamount = cart[0].bill[0];
            }
            //console.log(Allamount)
            const orders = new orderitem({
                orderItems: cart[0].products,
                user: req.user.id,
                shipping: addressarray.address[0],
                payment: req.body.payment,
                itemsPrice: cart[0].bill[0],
                taxPrice: req.body.taxPrice,
                shippingPrice: req.body.shippingPrice,
                totalPrice: Allamount,
                totalQty: totalQty
            });
            const neworder = await orders.save();
            let order_Item;
            cart[0].products.forEach(item => {
                order_Item = new Order_Item({
                    userId: req.user.id,
                    productId: item.productId,
                    orderId: neworder._id,
                    quantity: item.quantity,
                    totalamount: item.quantity * item.price
                })
            })
            await order_Item.save();
            await Cart.findByIdAndDelete(cart[0]._id);

            res.status(200).send({
                success: true,
                msg: 'Successfully item ordered !',
                data: neworder
            })
        }
    }
    else {
        if (!productId) {
            res.status(400).send({
                success: false,
                msg: 'Provide productId !'
            })
        }
        else {
            const product = await Product.find({ _id: productId });
            //console.log(product[0].title)
            var Allamount;
            if (taxPrice || shippingPrice) {
                if (taxPrice && shippingPrice) {
                    Allamount = product[0].price + taxPrice + shippingPrice;
                }
                else {
                    if (shippingPrice) {
                        Allamount = product[0].price + shippingPrice;
                    }
                    else {
                        Allamount = product[0].price + taxPrice;
                    }
                }
            }
            else {
                Allamount = product[0].price;
            }
            //console.log(addressarray.address[0]);
            const orders = new orderitem({
                orderItems: {
                    name: product[0].title,
                    image: product[0].image[0],
                    price: product[0].price,
                    quantity: product[0].qty,
                    productId: product[0]._id
                },
                user: req.user.id,
                shipping: addressarray.address[0],
                payment: req.body.payment,
                itemsPrice: product[0].price,
                taxPrice: req.body.taxPrice,
                shippingPrice: req.body.shippingPrice,
                totalPrice: Allamount,
                totalQty: totalQty
            });
            const item = await orders.save();
            let order_Item;
            item.orderItems.forEach(items => {
                order_Item = new Order_Item({
                    userId: req.user.id,
                    productId: items._id,
                    orderId: item._id,
                    quantity: items.quantity,
                    totalamount: items.quantity * items.price
                })
            })
            await order_Item.save();
            res.status(200).send({
                success: true,
                msg: 'Successfully item ordered !',
                response: item
            })
        }
    }
}


const updatePayment = async (req, res) => {
    try {
        const { orderId, payerId, paymentId } = req.body;
        if (!orderId || !paymentId) {
            res.status(400).send({
                success: false,
                msg: 'Provide order id or payment id !'
            })
        }
        else {
            const order = await orderitem.findByIdAndUpdate({ _id: orderId },
                { $set: { paidAt: Date.now(), isPaid: true, "payment.paymentResult": { payerID: payerId, paymentID: paymentId, orderID: orderId } } });
            //console.log(order);
            if (order) {
                res.status(200).send({
                    success: true,
                    mag: 'Order Paid !'
                })
            }
            else {
                res.status(404).send({ success: false, message: 'Order Not Found' });
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

const delivered = async (req, res) => {
    const { orderId } = req.body;
    try {
        if (!orderId) {
            res.status(400).send({
                success: false,
                msg: 'Provide order id !'
            })
        }
        else {
            const order = await orderitem.findByIdAndUpdate({ _id: orderId }, { $set: { isDelivered: true, deliveredAt: Date.now() } })
            // console.log(!order);
            if (order) {
                res.status(200).send({
                    success: true,
                    message: 'Order Delivered !'
                })
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Order Not Found !'
                });
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

module.exports = {
    addProduct, getProductList, editProduct, deleteProduct, addToCart, removeToCart, getCartProduct, updateProductQty, getOrderDetails, getOrderList, updateOrderStatus, orderCancel, buynow, pushNotification, multiNotification, orderConfirmation,
    reminderNotification, requestItem, addCategory, getCategory, updateCategory, deleteCategory, getProductById,
    getCategoryById, categoryStatus, ReOrder, orderHistory, OrderProducts, updatePayment, OrderProduct, delivered
}

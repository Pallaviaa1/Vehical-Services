const { validationResult } = require('express-validator');
const About = require('../models/aboutModel');
const Contact = require('../models/contactUsModel');
const Privacy = require('../models/privacyModel');
const Term = require('../models/termsModel');
const { User, Address } = require('../models/usersModel');
const { Order, Product, Order_Item, Category } = require('../models/productModel');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const aboutUs = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { heading, description } = req.body;
        var findAbout = await About.find();
        if (findAbout.length > 0) {
            var update = await About.findByIdAndUpdate({ _id: findAbout[0]._id }, { $set: { heading: heading, description: description } })
            if (update) {
                res.status(200).send(
                    {
                        success: true,
                        msg: "Update details successfully !"
                    }
                )
            }
        }
        else {
            const about = new About({
                heading: heading,
                description: description
            })
            await about.save();
            res.status(200).send(
                {
                    success: true,
                    msg: "Add details successfully !"
                }
            )
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const getAbout = async (req, res) => {
    const about = await About.find();
    if (about.length < 1) {
        res.status(400).send({
            success: false,
            msg: "About not found !"
        })
    }
    else {
        res.status(200).send({
            success: true,
            msg: '',
            data: about
        })
    }

}

const contactUs = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    try {
        const { phone, email, address } = req.body;
        var findContact = await Contact.find();
        if (findContact.length > 0) {

            var update = await Contact.findByIdAndUpdate({ _id: findContact[0]._id }, { $set: { email: email, phone: phone, address: address } })
            if (update) {
                res.status(200).send(
                    {
                        success: true,
                        msg: "Update details successfully !"
                    }
                )
            }
        }
        else {
            const contact = new Contact({
                phone: phone,
                email: email,
                address: address
            })
            await contact.save();
            res.status(200).send(
                {
                    success: true,
                    msg: "Add details successfully !"
                }
            )
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const getContact = async (req, res) => {
    try {
        const contact = await Contact.find().select(' -_id phone email address');
        if (contact.length < 1) {
            res.status(400).send({
                success: false,
                msg: 'Contact not found !'
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: '',
                data: contact
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


const privacyPolicy = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { heading, description } = req.body;
        var findPrivacy = await Privacy.find();
        if (findPrivacy.length > 0) {
            var update = await Privacy.findByIdAndUpdate({ _id: findPrivacy[0]._id }, { $set: { heading: heading, description: description } })
            if (update) {
                res.status(200).send(
                    {
                        success: true,
                        msg: "Update details successfully !"
                    }
                )
            }
        }
        else {
            const privacy = new Privacy({
                heading: heading,
                description: description
            })
            await privacy.save();
            res.status(200).send(
                {
                    success: true,
                    msg: "Add details successfully !"
                }
            )
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const getPrivacy = async (req, res) => {
    try {
        const privacy = await Privacy.find().select('-_id heading description');
        if (privacy.length < 1) {
            res.status(400).send({
                success: false,
                msg: 'Contact not found !'
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: '',
                data: privacy
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

const termsConditions = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const { heading, description } = req.body;
        var findTerms = await Term.find();
        if (findTerms.length > 0) {
            var update = await Term.findByIdAndUpdate({ _id: findTerms[0]._id }, { $set: { heading: heading, description: description } })
            if (update) {
                res.status(200).send(
                    {
                        success: true,
                        msg: "Update details successfully !"
                    }
                )
            }
        }
        else {
            const term = new Term({
                heading: heading,
                description: description
            })
            await term.save();
            res.status(200).send(
                {
                    success: true,
                    msg: "Add details successfully !"
                }
            )
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

const getTerms = async (req, res) => {
    try {
        const terms = await Term.find().select('-_id heading description');
        if (terms.length < 1) {
            res.status(400).send({
                success: false,
                msg: "Term not found !"
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: '',
                data: terms
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

const count = async (req, res) => {
    try {
        // Get the count of new customers within the last 24 hours
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const newCustomers = await User.countDocuments({ user_type: "Customer", createdAt: { $gte: yesterday } });

        const totalCustomers = await User.countDocuments({ user_type: "Customer" });

        const totalOrders = await Order_Item.countDocuments();

        const cancelOrder = await Order_Item.countDocuments({ order_cancel: true });

        const totalearn = await Order_Item.aggregate(
            [
                {
                    $group: {
                        _id: null,
                        "totalEarning": {
                            $sum: "$totalamount"
                        }
                    }
                },
                {
                    $project: {
                        _id: 0
                    }
                }
            ])

        const totalEarning = totalearn[0].totalEarning;
        const data = {
            newCustomers,
            totalCustomers,
            totalOrders,
            cancelOrder,
            totalEarning
        }
        res.status(200).send({
            success: true,
            msg: '',
            data: data
        })
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}

const filterProducts = async (req, res) => {
    const { make, model, year, modification } = req.query;
    // Build the filter object dynamically based on query parameters
    const filter = {};

    if (make) filter.make = make;
    if (model) filter.model = model;
    if (year) filter.year = year;
    if (modification) filter.modification = modification;
    try {
        const products = await Product.find(filter);
        if (products.length > 0) {
            res.status(200).send({
                success: true,
                msg: '',
                data: products
            })
        }
        else {
            res.status(400).send({
                success: false,
                msg: 'product not found !'
            })
        }
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
}

const filterSortProducts = async (req, res) => {
    try {
        const { category, make, model, year, modification, sort } = req.query;
        let query = Product.find({ category: category }).populate({ path: 'make', select: 'name _id' }).populate({ path: 'model', select: 'name _id' }).populate({ path: 'year', select: 'year _id' });

        // Filter by category IDs
        if (make) query = query.where('make', make);
        if (model) query = query.where('model', model);
        if (year) query = query.where('year', year);
        if (modification) query = query.where('modification', modification);

        // Sort by price
        if (sort === 'asc') query = query.sort({ price: 1 });
        if (sort === 'desc') query = query.sort({ price: -1 });

        const products = await query.exec();
        if (products.length > 0) {
            res.status(200).send({
                success: true,
                msg: '',
                data: products
            })
        }
        else {
            res.status(400).send({
                success: false,
                msg: 'product not found !'
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

const searchProductsbyCat = async (req, res) => {

    const { category, make, model, year, modification } = req.query;
    // Build the query
    const query = { category: category };

    if (make) query.make = make;
    if (model) query.model = model;
    if (year) query.year = year;
    if (modification) query.modification = modification;
    // Find products based on the query
    const products = await Product.find(query).populate({ path: 'make', select: 'name _id' }).populate({ path: 'model', select: 'name _id' }).populate({ path: 'year', select: 'year _id' });
    if (products.length < 1) {
        res.status(400).send({
            success: false,
            msg: 'Product not found !'
        })
    }
    else {
        res.status(200).send({
            success: true,
            msg: '',
            data: products
        })
    }
}

const search = async (req, res) => {
    try {
        const { key } = req.body;
        if (!key) {
            let result = await Category.find();
            if (!result) {
                res.status(400).send({
                    success: false,
                    msg: 'Category not found !'
                })
            }
            else {
                res.status(200).send({
                    success: true,
                    msg: '',
                    data: result
                })
            }
        }
        else {
            let result = await Category.find({ name: { $regex: key, $options: "i" } });
            if (!result) {
                res.status(400).send({
                    success: false,
                    msg: 'Category not found !'
                })
            }
            else {
                res.status(200).send({
                    success: true,
                    msg: '',
                    data: result
                })
            }
        }
    } catch (error) {
        res.status(404).send({
            success: false,
            msg: error.message
        })
    }
}

const todayOrders = async (req, res) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const orders = await Order_Item.find({ createdAt: { $gte: today } });
        if (orders.length < 1) {
            res.status(400).send({
                success: false,
                msg: "No orders today !"
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: "Today orders list",
                data: orders
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

const weekOrders = async (req, res) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const weekStartDay = new Date(today);
    weekStartDay.setDate(today.getDate() - today.getDay());
    try {
        const orders = await Order_Item.find({ createdAt: { $gte: weekStartDay } });
        if (orders.length < 1) {
            res.status(400).send({
                success: false,
                msg: "No orders this week!"
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: "This week orders list !",
                data: orders
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

const monthOrders = async (req, res) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const monthStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
    try {
        const orders = await Order_Item.find({ createdAt: { $gte: monthStartDate } });
        if (orders.length < 1) {
            res.status(400).send({
                success: false,
                msg: "No orders this month !"
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: "This month orders list !",
                data: orders
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

// admin update order status

const updateStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order_Item.findOneAndUpdate(
            { orderId: orderId },
            { order_status: req.body.status },
            { new: true }
        );
        if (order == null) {
            res.status(400).send({
                success: false,
                msg: "Cannot update order status"
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: "Update order status successfully !"
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

const getAddressById = async (req, res) => {
    const { AddressId } = req.params;
    const address = await Address.findOne({
        "address._id": AddressId
    }, {
        address: {
            "$elemMatch": {
                "_id": AddressId
            }
        }
    })
    if (!address) {
        res.status(400).send({
            success: false,
            msg: "Address not found !"
        })
    }
    else {
        let data = [];
        address.address.forEach(element => {
            data.push(element);
        });
        res.status(200).send({
            success: true,
            msg: '',
            data: data
        })
    }
}

const NewOrders = async (req, res) => {
    try {
        //const orders = await Order_Item.find({ order_status: 'pending' }).count();
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const orders = await Order_Item.find({ createdAt: { $gte: today } }).count();
        if (!orders) {
            res.status(400).send({
                success: false,
                msg: 'No new orders !'
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: '',
                data: { New_orders: orders }
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

const onGoingOrders = async (req, res) => {
    try {
        const orders = await Order_Item.find({ order_status: { $ne: 'delivered' } }).count();
        if (!orders) {
            res.status(400).send({
                success: false,
                msg: 'No Ongoing Orders are Exist !'
            })
        }
        else {
            res.status(200).send({
                success: true,
                msg: '',
                data: { ongoing_orders: orders }
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

const customerReport = async (req, res) => {
    function generateExcelReport(customers) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Customers');

        // Add headers
        worksheet.addRow(['Name', 'Email']);

        // Add customer data
        customers.forEach((customer) => {
            worksheet.addRow([customer.firstname, customer.email]);
        });

        return workbook;
    }

    function generatePDFReport(customers) {
        const pdfDoc = new PDFDocument();

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="customers.pdf"');

        // Generate PDF content
        pdfDoc.font('Helvetica-Bold').fontSize(14).text('Customers Report', { align: 'center' });
        pdfDoc.moveDown();

        customers.forEach((customer) => {
            pdfDoc.font('Helvetica').fontSize(12).text(`Name: ${customer.firstname}`);
            pdfDoc.font('Helvetica').fontSize(12).text(`Email: ${customer.email}`);
            pdfDoc.moveDown();
        });

        pdfDoc.end();
        return pdfDoc;
    }
    try {
        const customers = await User.find({ user_type: 'Customer' });
        // Generate Excel report
        /*  const excelReport = generateExcelReport(customers);
        res.attachment('customers.xlsx');
        excelReport.xlsx.write(res);
        res.end(); */

        // Generate PDF report
        const pdfReport = generatePDFReport(customers);
        res.attachment('customers.pdf');
        pdfReport.pipe(res);

    } catch (error) {
        res.status(500).send(error);
    }
}

const UserAmountPaid = async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        res.status(400).send({
            success: false,
            msg: 'Please provide user id !'
        })
    }
    else {
        const data = await Order_Item.aggregate(
            [{
                $match: {
                    $expr: { $eq: ['$userId', { $toObjectId: userId }] }
                }
            },
            {
                $group: {
                    _id: null,
                    "total": {
                        $sum: "$totalamount"
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
            ])
        if (data.length < 1) {
            res.status(400).send({
                success: false,
                msg: "User have no orders !"
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
}

const totalOrders = async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        res.status(400).send({
            success: false,
            msg: 'Please provide user id !'
        })
    }
    else {
        const data = await Order_Item.aggregate(
            [{
                $match: {
                    $expr: { $eq: ['$userId', { $toObjectId: userId }] }
                }
            },
            {
                $group: {
                    _id: null,
                    "total": {
                        $sum: "$quantity"
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
            ])
        if (data.length < 1) {
            res.status(400).send({
                success: false,
                msg: "User have no orders !"
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
}

const totalEarning = async (req, res) => {
    const data = await Order_Item.aggregate(
        [/* {
            $match: {
                $expr: { $eq: ['$userId', { $toObjectId: userId }] }
            }
        }, */
            {
                $group: {
                    _id: null,
                    "totalEarning": {
                        $sum: "$totalamount"
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ])
    if (data.length < 1) {
        res.status(400).send({
            success: false,
            msg: "User have no orders !"
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

const userHistory= async(req,res)=>
{
    const { userId }=req.body;
    const order = await Order_Item.find({ userId: userId }).populate({ path: 'productId', select: 'title image' })
            .populate({ path: 'orderId', select: 'deliveryDate' });
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

module.exports = {
    aboutUs, contactUs, privacyPolicy, termsConditions, count, filterProducts,
    filterSortProducts, searchProductsbyCat, todayOrders, weekOrders, monthOrders, updateStatus,
    getAbout, getContact, getPrivacy, getTerms, getAddressById, NewOrders, onGoingOrders, customerReport,
    search, UserAmountPaid, totalOrders, totalEarning, userHistory
}

// make api for Download System Reports as excel or pdf of All list of Customers and show data horizontally with design in node js and mongoose

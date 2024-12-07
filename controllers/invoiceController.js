const { validationResult } = require('express-validator');
const { Order } = require('../models/productModel');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateInvoice = async (req, res) => {
    try {
        const { orderId } = req.body;
        const shipping = await Order.findOne({ $and: [{ user: req.user.id }, { _id: orderId }] }).populate('cart.items.productId').select('address cart.items cart.totalCost cart.totalQty');
        var product;
        shipping.cart.items.forEach(item => {
            product = [
                {
                    name: item.name,
                    description: item.productId.description,
                    quantity: item.quantity,
                    price: item.price
                }
            ]
        })
        var invoice = {
            shipping: {
                name: shipping.address[0].name,
                phone: shipping.address[0].phone,
                street: shipping.address[0].street,
                country: shipping.address[0].country,
                state: shipping.address[0].state,
                city: shipping.address[0].city,
                pincode: shipping.address[0].pincode
            },
            items: product,
            subtotal: shipping.cart.totalCost,
            quantity: shipping.cart.totalQty,
            invoiceNo: "523436273"
        }
        const data = Date.now() + '-invoice.pdf';
        createInvoice(invoice, 'public/invoices/' + data);
        function createInvoice(invoice, path) {
            let doc = new PDFDocument({ size: "A4", margin: 50 });

            generateHeader(doc);
            generateCustomerInformation(doc, invoice);
            generateInvoiceTable(doc, invoice);
            generateFooter(doc);

            doc.end();
            doc.pipe(fs.createWriteStream(path));
        }

        function generateHeader(doc) {
            doc
                .image("vehicle_logo.png", 50, 45, { width: 100 })
                .fillColor("#444444")
                .fontSize(20)
                .text("Payment Invoice", 150, 57)
                .fontSize(10)
                .text("ACME Inc.", 200, 50, { align: "right" })
                .text("123 Main Street", 200, 65, { align: "right" })
                .text("New York, NY, 10025", 200, 80, { align: "right" })
                .moveDown();
        }

        function generateCustomerInformation(doc, invoice) {
            doc
                .fillColor("#444444")
                .fontSize(20)
                .text("Invoice", 50, 160);

            generateHr(doc, 185);

            const customerInformationTop = 200;

            doc
                .fontSize(10)
                .text("Invoice Number:", 50, customerInformationTop)
                .font("Helvetica-Bold")
                .text(invoice.invoiceNo, 150, customerInformationTop)
                .font("Helvetica")
                .text("Invoice Date:", 50, customerInformationTop + 15)
                .text(formatDate(new Date()), 150, customerInformationTop + 15)
                .text("Balance Due:", 50, customerInformationTop + 30)
                /* .text(
                  formatCurrency(invoice.subtotal - invoice.paid),
                  150,
                  customerInformationTop + 30
                ) */

                .font("Helvetica-Bold")
                .text(invoice.shipping.name, 300, customerInformationTop)
                .font("Helvetica")
                .text(invoice.shipping.street, 300, customerInformationTop + 15)
                .text(
                    invoice.shipping.city +
                    ", " +
                    invoice.shipping.state +
                    ", " +
                    invoice.shipping.country,
                    300,
                    customerInformationTop + 30
                )
                .moveDown();

            generateHr(doc, 252);
        }

        function generateInvoiceTable(doc, invoice) {
            let i;
            const invoiceTableTop = 330;

            doc.font("Helvetica-Bold");
            generateTableRow(
                doc,
                invoiceTableTop,
                "Item",
                "Description",
                "Unit Cost",
                "Quantity",
                "Line Total"
            );
            generateHr(doc, invoiceTableTop + 20);
            doc.font("Helvetica");
            var position;
            for (i = 0; i < invoice.items.length; i++) {
                const item = invoice.items[i];
                position = invoiceTableTop + (i + 1) * 30;
                generateTableRow(
                    doc,
                    position,
                    item.name,
                    item.description,
                    formatCurrency(item.price / item.quantity),
                    item.quantity,
                    formatCurrency(item.price)
                );
                generateHr(doc, position + 85);
            }

            const subtotalPosition = position + 100;
            generateTableRow(
                doc,
                subtotalPosition,
                "",
                "",
                "Subtotal",
                "",
                formatCurrency(invoice.subtotal)
            );

            /* const paidToDatePosition = subtotalPosition + 20;
            generateTableRow(
                doc,
                paidToDatePosition,
                "",
                "",
                "Paid To Date",
                "",
                formatCurrency(invoice.paid)
            ); */
            const duePosition = subtotalPosition + 20;
            doc.font("Helvetica-Bold");
            generateTableRow(
                doc,
                duePosition,
                "",
                "",
                "Balance Due",
                "",
                //formatCurrency(invoice.subtotal - invoice.paid)
                formatCurrency(invoice.subtotal)
            );
            doc.font("Helvetica");
        }

        function generateFooter(doc) {
            doc
                .fontSize(10)
                .text(
                    "Payment is due within 15 days. Thank you for your business.",
                    50,
                    780,
                    { align: "center", width: 500 }
                );
        }

        function generateTableRow(
            doc,
            y,
            item,
            description,
            unitCost,
            quantity,
            lineTotal
        ) {
            doc
                .fontSize(10)
                .text(item, 60, y)
                .text(description, 175, y, { width: 150 })
                .text(unitCost, 295, y, { width: 90, align: "right" })
                .text(quantity, 370, y, { width: 90, align: "right" })
                .text(lineTotal, 0, y, { align: "right" });
        }

        function generateHr(doc, y) {
            doc
                .strokeColor("#aaaaaa")
                .lineWidth(1)
                .moveTo(50, y)
                .lineTo(550, y)
                .stroke();
        }

        function formatCurrency(cents) {
            return "$" + (cents / 100).toFixed(2);
        }

        function formatDate(date) {
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            return year + "/" + month + "/" + day;
        }

        res.status(200).send({
            success: true,
            msg: "generate pdf successfully !"
        })
    }
    catch (error) {
        res.status(500).send({
            success: false,
            msg: error.message
        })
    }
}

module.exports = { generateInvoice }

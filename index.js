require('dotenv').config();
const express= require('express');
const app=express();
const bodyParser= require('body-parser');
const mongoose = require('mongoose');


var PORT=4000;
const adminRoute=require('./routes/adminRoute');
const commonRoute=require('./routes/commonRoute');
const userRoute=require('./routes/userRoute');
const vehicleRoute=require('./routes/vehicleRoute');
const merchant_route=require('./routes/merchantRoute');
const product_route=require('./routes/productRoute');
const invoice_route=require('./routes/invoiceRoute');
const notification_route=require('./routes/notificationRoute');

var cors=require('cors');

app.use(cors({
    origin: '*'
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

app.use('/api',adminRoute);
app.use('/api',commonRoute);
app.use('/api',userRoute);
app.use('/api',vehicleRoute);
app.use('/api',merchant_route);
app.use('/api',product_route);
app.use('/api',invoice_route);
app.use('/api',notification_route)

mongoose.connect("mongodb+srv://root:root123@cluster0.zkghqdw.mongodb.net/ViehclesServices").then(()=>console.log("Database Connected successfully"));
//mongodb+srv://root:root123@cluster0.zkghqdw.mongodb.net/ViehclesServices
app.listen(PORT,(err)=>
{
    if(err) throw err;
    else
    {
        console.log('server listing on port:', PORT);
    }
})
const express=require('express');
const invoice_route=express();
const auth=require('../helpers/auth')
const invoiceController=require('../controllers/invoiceController')
const path=require('path');
const multer=require('multer');

var storage=multer.diskStorage({
    destination:function(err,file,cb)
    {
        cb(null,path.join(__dirname,'../public/images'),(err,success)=>
        {
            if (err) {
                console.log(err)
            }
        });
    },
    filename:function(err,file,cb)
    {
        cb(null,Date.now()+'-'+file.originalname,(err,success)=>
        {
            if (err) {
               console.log(err); 
            }
        });
    }
})

var upload=multer({storage:storage})


invoice_route.post('/create/invoice', auth.isauthorize, invoiceController.generateInvoice);

module.exports= invoice_route;
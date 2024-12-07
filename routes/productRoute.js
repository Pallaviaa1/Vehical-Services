const express=require('express');
const product_route=express();
const { addProductValidation, addCategoryValidation }=require('../helpers/validation')
const auth=require('../helpers/auth')
const productController=require('../controllers/productController')
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
/* const upload = multer({
    storage:storage
}).fields([ { name: 'image', maxCount: 5 }]); */

product_route.post('/add/product', upload.array('image', 4), addProductValidation, productController.addProduct);
product_route.get('/get/products', productController.getProductList);
product_route.put('/edit/product/:id', upload.array('image', 4), addProductValidation, productController.editProduct);
product_route.delete('/delete/product/:id', productController.deleteProduct);

product_route.post('/addtocart/product', auth.isauthorize, productController.addToCart);
product_route.get('/get/cartproduct', auth.isauthorize, productController.getCartProduct)
product_route.delete('/removetocart/product', auth.isauthorize, productController.removeToCart);
product_route.put('/update/productqty', auth.isauthorize, productController.updateProductQty);

product_route.post('/chekout', auth.isauthorize, productController.OrderProduct);
product_route.get('/get/orderdetails', auth.isauthorize, productController.getOrderDetails);
product_route.post('/order/confirmation', productController.orderConfirmation )

product_route.get('/get/orderList', productController.getOrderList); 

product_route.put('/order/status/:orderId', productController.updateOrderStatus);
product_route.post('/order/cancel', productController.orderCancel);

product_route.post('/single/notification', productController.pushNotification);
product_route.post('/multi/notification', productController.multiNotification);
product_route.post('/reminder/notification', productController.reminderNotification);

product_route.post('/request/item', auth.isauthorize, productController.requestItem);

product_route.post('/add/category', upload.single('image'), addCategoryValidation, productController.addCategory);
product_route.get('/get/category', productController.getCategory);
product_route.put('/update/category/:id', upload.single('image'), addCategoryValidation, productController.updateCategory);
product_route.delete('/delete/category/:id', productController.deleteCategory);
product_route.post('/category', productController.getCategoryById);
product_route.post('/category/status', productController.categoryStatus);

//product_route.get('/get/notification', productController.getNotification)
product_route.post('/product', productController.getProductById);
product_route.post('/reorder', auth.isauthorize, productController.ReOrder);
product_route.get('/oredrs/history', auth.isauthorize, productController.orderHistory);

product_route.put('/payment', productController.updatePayment);
product_route.put('/delivered', productController.delivered);

//new
product_route.post('/order/items', auth.isauthorize, productController.OrderProducts);


module.exports= product_route;   


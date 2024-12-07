const express=require('express');
const merchant_route=express();
const { userRegValidation, userLoginValidation, changePassValidation, forgotPasswordValidation, resetPasswordValidation, userUpdateValidation }=require('../helpers/validation')

const merchantController=require('../controllers/merchantController')
const path=require('path');
const multer=require('multer');
const auth=require('../helpers/auth');


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

merchant_route.post('/merchant/reg', userRegValidation, merchantController.regMerchant);
merchant_route.post('/merchant/login', userLoginValidation, merchantController.loginMerchant);
merchant_route.put('/merchant/changePass', auth.isauthorize, changePassValidation, merchantController.merChangePass);
merchant_route.post('/merchant/forgotPassword', forgotPasswordValidation, merchantController.merForgotPass);
merchant_route.post('/merchant/reset-password', resetPasswordValidation, merchantController.merchResetPass);
merchant_route.put('/merchant/update/profile', upload.single('profile'), auth.isauthorize, userUpdateValidation, merchantController.merUpdateProfile)

module.exports= merchant_route;
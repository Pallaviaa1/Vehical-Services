const express=require('express');
const user_route=express();
const userController=require('../controllers/userController')
const {userRegValidation, userLoginValidation, userUpdateValidation, changePassValidation,
     forgotPasswordValidation, uresetPasswordValidation,
    addvehicleValidation, addAddressValidation }=require('../helpers/validation')
const auth=require('../helpers/auth')
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

user_route.post('/user/reg',  userRegValidation, userController.userReg);
user_route.post('/user/login',  userLoginValidation, userController.userlogin);
user_route.put('/user/update', upload.single('profile'), auth.isauthorize, userUpdateValidation, userController.userUpdate);
user_route.put('/user/changepassword', auth.isauthorize, changePassValidation, userController.userChangePassword);
user_route.post('/user/forgotpassword', auth.isauthorize, forgotPasswordValidation, userController.userForgotPassword);
user_route.post('/user/reset-password', uresetPasswordValidation, userController.userResetPassword);
user_route.post('/user/logout', userController.logout);

user_route.post('/add/vehicle', auth.isauthorize, addvehicleValidation, userController.addVehicles);
user_route.get('/get/vehicles', auth.isauthorize, userController.getAllVehicles);
user_route.delete('/vehicle/:vehicleId', userController.DeleteVehicle);

user_route.post('/add/address', auth.isauthorize, addAddressValidation, userController.addAddress);
user_route.get('/get/address', auth.isauthorize,  userController.getAllAddress);
user_route.put('/edit/address', auth.isauthorize, addAddressValidation, userController.editAddress);
user_route.delete('/delete/address', auth.isauthorize, userController.deleteAddress)

user_route.get('/get/profile', auth.isauthorize, userController.getprofile);

module.exports= user_route;

// http://52.15.47.207:4000
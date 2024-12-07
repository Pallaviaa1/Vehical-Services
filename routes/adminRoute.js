const express=require('express');
const admin_route=express();
const {  loginValidation, changePassValidation, updateProfileValidation, aforgotPasswordValidation, resetPasswordValidation, userRegValidation, userUpdateValidation}=require('../helpers/validation')

const adminController=require('../controllers/adminController')
const path=require('path');
const multer=require('multer');
admin_route.set('view engine','ejs');
admin_route.set('views','./views');

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


admin_route.post('/login/admin', loginValidation, adminController.loginAdmin);
admin_route.put('/admin/changepassword', changePassValidation, adminController.changePasswordAdmin);
admin_route.put('/admin/:id',  upload.single('profile'), updateProfileValidation, adminController.updateProfile)
admin_route.post('/admin/forgotpassword', aforgotPasswordValidation, adminController.forgotPassword)
admin_route.post('/reset-password', resetPasswordValidation, adminController.resetPassword);
admin_route.post('/admin/profile', adminController.GetAdminProfile);

admin_route.get('/get/users', adminController.getUserList);
admin_route.post('/add/user', upload.single('profile'), userRegValidation, adminController.addUser);
admin_route.put('/update/user/:userId', upload.single('profile'), userUpdateValidation, adminController.updateUser);
admin_route.post('/delete/user/:userId', adminController.deleteUser);
admin_route.post('/get/user/:userId', adminController.GetUserById);


admin_route.get('/get/merchant', adminController.getMerchant);
admin_route.post('/add/merchant', userRegValidation, adminController.addMerchant);
admin_route.put('/update/merchant/:merchantId', upload.single('profile'), userUpdateValidation, adminController.updateMerchant)
admin_route.delete('/delete/merchant/:merchantId', adminController.deleteMerchant);

admin_route.post('/update/status', adminController.updateStatus);

module.exports= admin_route;


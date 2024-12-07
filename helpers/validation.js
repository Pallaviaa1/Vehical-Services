const {check}=require('express-validator');

exports.loginValidation=[
    check('email','please enter a valid email').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('password','password min 6 length').isLength({min:6})
]

exports.changePassValidation=[
    check('oldpassword','please enter your old password'),
    check('newpassword','new password min 6 length').isLength({min:6}),
    check('confirmpassword','confirm password min 6 length').isLength({min:6}),

]

exports.updateProfileValidation=[
    check('id','please enter id').not().isEmpty(),
    check('firstname','please enter firstname').not().isEmpty(),
    check('lastname','please enter lastname').not().isEmpty(),
    check('email','please enter a valid email').isEmail().normalizeEmail({gmail_remove_dots:true})
]

exports.forgotPasswordValidation=[
    check('mobile','please enter correct mobile number')
]

exports.aforgotPasswordValidation=[
    check('email','please enter a valid email').isEmail().normalizeEmail({gmail_remove_dots:true})

] 

exports.resetPasswordValidation=[
    check('password','new password min 6 length').isLength({min:6}),
    check('confirmpassword','confirm password min 6 length').isLength({min:6}),
]
exports.uresetPasswordValidation=[
    check('phone','please enter correct phone number'),
    check('resetPassword','enter reset password min 6 length').isLength({min:6}),
]

exports.aboutUsValidation=[
    check('heading','please enter a heading').not().isEmpty(),
    check('description','please enter descriptions').not().isEmpty()

]

exports.contactUsValidation=[
    check('phone','please enter a valid Phone Number').isLength({min:10,max:10}),
    check('email','please enter a valid email').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('address','please enter address').not().isEmpty()

]

exports.privacyPolicyValidation=[
    check('heading','please enter a heading').not().isEmpty(),
    check('description','please enter descriptions').not().isEmpty()
]

exports.termsConditionsValidation=[
    check('heading','please enter a heading').not().isEmpty(),
    check('description','please enter descriptions').not().isEmpty() 
]

exports.userRegValidation=[
    check('firstname','please enter firstname').not().isEmpty(),
    check('lastname','please enter lastname').not().isEmpty(),
    check('email','please enter a valid email').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('password', 'new password min 6 length').isLength({min:6}),
    check('phone','please enter a valid Phone Number').isLength({min:10,max:10})
]

exports.userLoginValidation=[
    check('email','please enter a valid email').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('password','password min 6 length').isLength({min:6})
]


exports.userUpdateValidation=[
    check('firstname','please enter firstname').not().isEmpty(),
    check('lastname','please enter lastname').not().isEmpty(),
    check('email','please enter a valid email').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('phone','please enter a valid Phone Number').isLength({min:10,max:10})
]


exports.addvehicleTypeValidation=[
    check('vehicle_name','please enter vehicle type').not().isEmpty(),
]

exports.addMakeValidation=[
    check('vehicle_id','please select vehicle type').not().isEmpty(),
    check('name','please enter Make name').not().isEmpty(),
]

exports.addModelValidation=[
    check('vehicle_id','please select vehicle type').not().isEmpty(),
    check('make_id','please select make').not().isEmpty(),
    check('name','please enter Model name').not().isEmpty(),
]

exports.addYearValidation=[
    check('vehicle_id','please select vehicle type').not().isEmpty(),
    check('model_id','please select model type').not().isEmpty(),
    check('year','please enter year').not().isEmpty(),
]

exports.addProductValidation=[
    check('title','please enter product title').not().isEmpty(),
    check('description','please enter product description').not().isEmpty(),
    check('vehicle_type','please select vehicle type').not().isEmpty(),
    check('make','please select make').not().isEmpty(),
    check('model','please select model').not().isEmpty(),
    check('year','please enter year').not().isEmpty(),
    check('price','please enter product price').not().isEmpty(),
    check('qty', 'please enter product quantity').not().isEmpty()
]

exports.addvehicleValidation=[
    check('make','please select make').not().isEmpty(),
    check('model','please select model').not().isEmpty(),
    check('year','please select year').not().isEmpty(),
    check('fuel_type','please select fuel type').not().isEmpty()
]

exports.addServicesValidation=[
    check('name','please enter service name').not().isEmpty(),
]

exports.addModificationValidation=[
    check('name','please enter modification name').not().isEmpty(),
    check('make_id','please select make').not().isEmpty(),
    check('model_id','please select model').not().isEmpty(),
    check('year_id','please select year').not().isEmpty(),
]

exports.addReminderValidation=[
    check('service_type', 'please select service type').not().isEmpty(),
    check('date', 'please enter service date').not().isEmpty()
]

exports.addAddressValidation=[
    check('name','please enter name').not().isEmpty(),
    check('phone','please enter a valid Phone Number').isLength({min:10,max:10}),
    check('street','please enter street and area details').not().isEmpty(),
    check('country', 'please enter country').not().isEmpty(),
    check('state', 'please enter state').not().isEmpty(),
    check('city', 'please select city').not().isEmpty(),
    check('pincode', 'please enter valid pincode').not().isEmpty().isNumeric()
]

exports.addCategoryValidation=[
    check('name','please enter name').not().isEmpty()
]
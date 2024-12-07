const express=require('express');
const common_route=express();
const { aboutUsValidation, contactUsValidation, privacyPolicyValidation, termsConditionsValidation  }=require('../helpers/validation')

const commonController=require('../controllers/commonController')

common_route.post('/aboutUs', aboutUsValidation, commonController.aboutUs)
common_route.post('/contactUs', contactUsValidation, commonController.contactUs)
common_route.post('/privacyPolicy', privacyPolicyValidation, commonController.privacyPolicy)
common_route.post('/termsConditions', termsConditionsValidation, commonController.termsConditions)

common_route.get('/count', commonController.count);
common_route.get('/filter/products', commonController.filterProducts);
common_route.post('/filtersort/products', commonController.filterSortProducts);
common_route.post('/search/products', commonController.searchProductsbyCat);

common_route.get('/orders/today', commonController.todayOrders);
common_route.get('/orders/week', commonController.weekOrders);
common_route.get('/orders/month', commonController.monthOrders);     

common_route.put('/orderstatus/:orderId', commonController.updateStatus);

common_route.get('/get/about', commonController.getAbout);
common_route.get('/get/contact', commonController.getContact);
common_route.get('/get/privacy', commonController.getPrivacy);
common_route.get('/get/terms', commonController.getTerms);

common_route.get('/get/address/:AddressId', commonController.getAddressById);

common_route.get('/new/orders', commonController.NewOrders);
common_route.get('/ongoing/orders', commonController.onGoingOrders);

common_route.get('/customer/report', commonController.customerReport);
common_route.post('/search', commonController.search);

common_route.get('/total/amount', commonController.UserAmountPaid);
common_route.get('/total/orders', commonController.totalOrders);


common_route.get('/total/earning', commonController.totalEarning);
common_route.post('/user/orders', commonController.userHistory);

module.exports= common_route;
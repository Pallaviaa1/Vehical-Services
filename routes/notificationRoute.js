const express=require('express');
const notification_route=express();
const notificationController=require('../controllers/notificationController')

notification_route.post('/notification/all', notificationController.send_notification_to_all);
notification_route.post('/notification/specific', notificationController.send_notification_to_specific);

module.exports= notification_route;



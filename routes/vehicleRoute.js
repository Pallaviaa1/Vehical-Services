const express=require('express');
const vehicle_route=express();
const { addvehicleTypeValidation, addMakeValidation, addModelValidation, addYearValidation, 
    addServicesValidation, addReminderValidation, addModificationValidation }=require('../helpers/validation')

const vehicleController=require('../controllers/vehicleController')
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

vehicle_route.post('/add/vehicle/type', upload.single('image'), addvehicleTypeValidation, vehicleController.addvehicleType);
vehicle_route.get('/get/vehicle/types', vehicleController.getVehTypes);
vehicle_route.put('/update/type/:id', upload.single('image'), addvehicleTypeValidation, vehicleController.updateVehType);
vehicle_route.delete('/delete/type/:id', vehicleController.deleteVehType);
vehicle_route.post('/type', vehicleController.VehicleTypeById);

vehicle_route.post('/add/vehicle/make', addMakeValidation, vehicleController.AddVehicleMake);
vehicle_route.get('/get/vehicle/make', vehicleController.getMake);
vehicle_route.put('/update/make/:id', addMakeValidation, vehicleController.updateMake);
vehicle_route.delete('/delete/make/:id', vehicleController.deleteMake);
vehicle_route.post('/make', vehicleController.MakeById);

vehicle_route.post('/add/vehicle/model', addModelValidation, vehicleController.AddVehicleModel);
vehicle_route.get('/get/vehicle/model', vehicleController.getModel);
vehicle_route.put('/update/model/:id', addModelValidation, vehicleController.updateModel)
vehicle_route.delete('/delete/model/:id', vehicleController.deleteModel);
vehicle_route.post('/model', vehicleController.ModelById);

vehicle_route.post('/add/vehicle/year', addYearValidation, vehicleController.AddvehicleYear);
vehicle_route.get('/get/year', vehicleController.getYear);
vehicle_route.put('/update/year/:id', addYearValidation, vehicleController.updateYear);
vehicle_route.delete('/delete/year/:id', vehicleController.deleteYear);
vehicle_route.post('/year', vehicleController.yearById);

vehicle_route.post('/add/modification', addModificationValidation, vehicleController.addModification);
vehicle_route.get('/get/modification', vehicleController.getModification);
vehicle_route.put('/update/modification/:id', addModificationValidation, vehicleController.updateModification);
vehicle_route.delete('/delete/modification/:id', vehicleController.deleteModification);
vehicle_route.post('/modification', vehicleController.modfyById);

vehicle_route.get('/get/make',vehicleController.getMakewithcat);

vehicle_route.post('/add/services', upload.single('image'), addServicesValidation, vehicleController.addServices);
vehicle_route.get('/get/services', vehicleController.getServicesList);
vehicle_route.put('/edit/service/:id', upload.single('image'), addServicesValidation, vehicleController.editServices);
vehicle_route.delete('/delete/services/:id', vehicleController.deleteServices);

vehicle_route.post('/add/reminder', auth.isauthorize, addReminderValidation, vehicleController.addReminder);
vehicle_route.get('/get/reminder', vehicleController.getReminders);
vehicle_route.put('/edit/reminder/:id', addReminderValidation, vehicleController.updateReminder);
vehicle_route.delete('/delete/reminder/:id', vehicleController.deleteReminder);

vehicle_route.get('/get/makelist', vehicleController.getMakeList);
vehicle_route.get('/models/:makeId', vehicleController.getModelbymake);
vehicle_route.get('/year/:modelId', vehicleController.getYearbyModel);
vehicle_route.post('/modific', vehicleController.getmodificationbycat);

vehicle_route.get('/user/reminders', auth.isauthorize, vehicleController.UserReminders);
vehicle_route.get('/reminder/:reminderId', vehicleController.getReminderById);

/// new
vehicle_route.get('/make/list', vehicleController.findMake);
vehicle_route.get('/model/:makeId', vehicleController.findModel);
vehicle_route.get('/years/:modelId', vehicleController.findYear);
vehicle_route.post('/modification/list', vehicleController.findModification);
vehicle_route.get('/services', vehicleController.ServicesList);


module.exports= vehicle_route;

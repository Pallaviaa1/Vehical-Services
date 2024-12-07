const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-account.json");
// add your firebase db url here
const FIREBASE_DATABASE_URL = "https://vehicles-services-7a2e3-default-rtdb.asia-southeast1.firebasedatabase.app";
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: FIREBASE_DATABASE_URL
});


module.exports = admin;
const cors = require('cors');
const express = require('express');
const formidable = require('express-formidable');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

console.log('TEST');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Allow server to use formidable for post messsages
const app = express();
app.use(cors());
app.use(formidable());

//Mongodb connection
mongoose.connect('mongodb://localhost/vinted');

//Import signup routes
const userRoutes = require('./routes/user-routes');
app.use(userRoutes);

//Import offer routes
const offerRoutes = require('./routes/offer-routes');
app.use(offerRoutes);

// server initiation
app.listen(3000, () => {
  console.log('Server started');
});

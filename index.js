const express = require('express');
const formidable = require('express-formidable');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dkbzj9jcc',
  api_key: '796283575114837',
  api_secret: 'VH720cmw19TqcjYLI3Dz-Z11HDk',
});

//Allow server to use formidable for post messsages
const app = express();
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

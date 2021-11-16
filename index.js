require('dotenv').config();
const express = require('express');
const formidable = require('express-formidable');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
mongoose.connect(process.env.MONGODB_URI);

//Import signup routes
const userRoutes = require('./routes/user-routes');
app.use(userRoutes);

//Import offer routes
const offerRoutes = require('./routes/offer-routes');
app.use(offerRoutes);

app.post('/payment', async (req, res) => {
  // Réception du token créer via l'API Stripe depuis le Frontend
  const stripeToken = req.fields.stripeToken;
  // Créer la transaction
  const response = await stripe.charges.create({
    amount: req.fields.amount,
    currency: 'eur',
    description: req.fields.description,
    // On envoie ici le token
    source: stripeToken,
  });
  console.log(response.status);

  // TODO
  // Sauvegarder la transaction dans une BDD MongoDB

  res.json(response);
});

app.get('/', (req, res) => {
  res.json({ message: 'BIENVENUE !' });
});

// server initiation
app.listen(process.env.PORT, () => {
  console.log('Server started');
});

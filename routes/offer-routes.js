const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

//Import des models
const Offer = require('../models/Offer-model');
const User = require('../models/User-model');

//Impport middleware
const isAuthenticated = require('../middlewares/Authentication');

//Route for publishing offer
router.post('/offer/publish', isAuthenticated, async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: 'vinted/offers',
    });
    const newOffer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        { MARQUE: req.fields.brand },
        { TAILLE: req.fields.size },
        { ÉTAT: req.fields.condition },
        { COULEUR: req.fields.color },
        { EMPLACEMENT: req.fields.city },
      ],
      product_image: result,
      owner: req.user,
    });

    await newOffer.save();
    res.json({
      _id: newOffer._id,
      product_name: newOffer.product_name,
      product_description: newOffer.product_description,
      product_price: newOffer.product_price,
      product_details: newOffer.product_details,
      product_image: { secure_url: newOffer.product_image.secure_url },
      owner: {
        account: {
          username: req.user.account.username,
          phone: req.user.account.phone,
        },
        _id: req.user._id,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Update a post offer
router.put('/offer/update', isAuthenticated, async (req, res) => {
  try {
    const offerToFind = await Offer.findById(req.fields.id)
      .populate({ path: 'owner', select: 'account' })
      .select(
        '_id product_name produc_description product_price product_details product_image.secure_url owner'
      );

    if (offerToFind) {
      const result = await cloudinary.uploader.upload(req.files.picture.path, {
        folder: 'vinted/offers',
      });
      (offerToFind.product_name = req.fields.title),
        (offerToFind.product_description = req.fields.description),
        (offerToFind.product_price = req.fields.price),
        (offerToFind.product_details = [
          { MARQUE: req.fields.brand },
          { TAILLE: req.fields.size },
          { ÉTAT: req.fields.condition },
          { COULEUR: req.fields.color },
          { EMPLACEMENT: req.fields.city },
        ]),
        (offerToFind.product_image = result),
        (offerToFind.owner = req.user),
        await offerToFind.save();

      res.json({
        _id: offerToFind._id,
        product_name: offerToFind.product_name,
        product_description: offerToFind.product_description,
        product_price: offerToFind.product_price,
        product_details: offerToFind.product_details,
        product_image: { secure_url: offerToFind.product_image.secure_url },
        owner: {
          account: {
            username: req.user.account.username,
            phone: req.user.account.phone,
          },
          _id: req.user._id,
        },
      });
    } else {
      res.status(400).json({ error: 'Offer not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//route to get all offer based on query sent by the client
router.get('/offers', async (req, res) => {
  try {
    const filter = {};
    //check the details parameter defined
    if (req.query.title) {
      filter.product_name = new RegExp(req.query.title, 'i');
    }
    if (req.query.priceMin) {
      filter.product_price = { $gte: req.query.priceMin };
    }
    if (req.query.priceMax) {
      if (filter.product_price.$gte) {
        filter.product_price.$lte = req.query.priceMax;
      } else {
        filter.product_price = { $lte: req.query.priceMax };
      }
    }
    //Take to account the sort and the pagination
    const sort = {};
    let page = 0;
    if (req.query.page) {
      page = 2 * (Number(req.query.page) - 1);
    }
    if (req.query.sort === 'price-asc') {
      sort.product_price = 'asc';
    }
    if (req.query.sort === 'price-desc') {
      sort.product_price = 'desc';
    }

    const offers = await Offer.find(filter)
      .populate({ path: 'owner', select: 'account' })
      .sort(sort)
      .limit(2)
      .skip(page)
      .select(
        '_id product_name produc_description product_price product_details product_image.secure_url owner'
      );
    const count = await Offer.countDocuments(filter);

    res.json({ count: count, offers: offers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Get detail on a specific id
router.get('/offer/:id', async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate({ path: 'owner', select: 'account' })
      .select(
        '_id product_name produc_description product_price product_details product_image.secure_url owner'
      );
    if (offer) {
      res.json(offer);
    } else {
      res.status(400).json({ message: 'Article not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

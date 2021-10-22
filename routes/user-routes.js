const express = require('express');
const router = express.Router();
const SHA256 = require('crypto-js/sha256');
const encBase64 = require('crypto-js/enc-base64');
const uid2 = require('uid2');

//Import model
const User = require('../models/User-model');
const Offer = require('../models/Offer-model');

//Signup route for new user
router.post('/user/signup', async (req, res) => {
  try {
    //remove all blank space before and after the word
    const reqEmail = req.fields.email.trim();
    const reqUsername = req.fields.username.trim();
    const reqPhone = req.fields.phone.trim();
    const reqPassword = req.fields.password.trim();

    const email = await User.findOne({ email: reqEmail });
    const username = await User.findOne({ account: { username: reqUsername } });

    if (reqUsername && reqEmail && reqPassword) {
      //Check if email, username are not already used and phone number length
      if (!email && !username && reqPhone.length === 10) {
        //Generate hash and token for the user
        const password = reqPassword;
        const salt = uid2(16);
        const hash = SHA256(password + salt).toString(encBase64);
        const token = uid2(16);

        //Create the user in DataBase
        const newUser = new User({
          email: reqEmail,
          account: { username: reqUsername, phone: reqPhone },
          token: token,
          hash: hash,
          salt: salt,
        });

        await newUser.save();

        res.json({
          _id: newUser._id,
          token: newUser.token,
          account: {
            username: newUser.account.username,
            phone: newUser.account.phone,
          },
        });
      } else {
        res.status(400).json({
          message: 'Email or username already used or phone number incorrect',
        });
      }
    } else {
      res.status(400).json({
        message: 'Please fill mail, username and password',
      });
    }
  } catch (error) {
    res.json({ error: { message: error.message } });
  }
});

//Login route
router.post('/user/login', async (req, res) => {
  try {
    const reqEmail = req.fields.email.trim();
    const reqPassword = req.fields.password.trim();

    if (reqEmail && reqPassword) {
      const user = await User.findOne({ email: reqEmail });
      if (user) {
        //Calculate hash base on user password input with the salt stored
        const salt = user.salt;
        const password = reqPassword;
        const hash = SHA256(password + salt).toString(encBase64);
        //compare the hash calculated with the password of use and the hash stored
        if (hash === user.hash) {
          res.json({
            _id: user._id,
            token: user.token,
            account: {
              username: user.account.username,
              phone: user.account.phone,
            },
          });
        } else {
          res.status(400).json({ message: 'Password incorrect' });
        }
      } else {
        res.status(400).json({ message: "This mail doesn't exist" });
      }
    } else {
      res.status(400).json({ message: 'Please fill a mail and password' });
    }
  } catch (error) {
    res.json({ error: { message: error.message } });
  }
});

module.exports = router;

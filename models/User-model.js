const mongoose = require('mongoose');

//user BDD format
const User = mongoose.model('User', {
  email: { unique: true, type: String },
  account: {
    username: { required: true, type: String },
    phone: String,
    avatar: Object,
  },
  token: String,
  hash: String,
  salt: String,
});

//test
module.exports = User;

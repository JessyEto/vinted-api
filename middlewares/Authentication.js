//Import des models
const User = require('../models/User-model');

const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      res.status(400).json({ error: 'Missing token' });
    } else {
      const token = req.headers.authorization.replace('Bearer ', '');
      const user = await User.findOne({ token: token });
      if (user) {
        req.user = user;
        return next();
      } else {
        res.status(401).json({ message: 'Unauthorized' });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = isAuthenticated;

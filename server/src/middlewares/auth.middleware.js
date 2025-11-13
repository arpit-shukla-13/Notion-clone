// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

exports.protect = async (req, res, next) => {
  let token;

  // Header check: 'Bearer TOKEN'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Token extract karein
      token = req.headers.authorization.split(' ')[1];

      // Verify karein
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User ko req object mein attach karein (password chhod kar)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
         return res.status(401).json({ message: 'User not found' });
      }

      next(); // Agle step par jaayein
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
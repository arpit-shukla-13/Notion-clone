// src/routes/document.routes.js
const express = require('express');
const router = express.Router();
const { 
  createDocument, 
  getDocumentsByWorkspace,
  // ----- YEH DO FUNCTIONS ADD KAREIN -----
  getDocumentById,
  updateDocument
} = require('../controllers/document.controller');
const { protect } = require('../middlewares/auth.middleware');

// Secure all document routes
router.use(protect);

router.route('/')
  .post(createDocument);

router.route('/ws/:workspaceId')
  .get(getDocumentsByWorkspace);

// ----- YEH DO NAYE ROUTES ADD KAREIN -----
router.route('/:id')
  .get(getDocumentById)    // Ek document fetch karne ke liye
  .put(updateDocument);    // Ek document ko save/update karne ke liye

module.exports = router;
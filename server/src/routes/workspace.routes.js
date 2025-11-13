// src/routes/workspace.routes.js
const express = require('express');
const router = express.Router();
const { createWorkspace, getMyWorkspaces } = require('../controllers/workspace.controller');
const { protect } = require('../middlewares/auth.middleware');

// 'protect' middleware ensures only logged-in users can access these routes
router.route('/')
  .post(protect, createWorkspace)
  .get(protect, getMyWorkspaces);

module.exports = router;
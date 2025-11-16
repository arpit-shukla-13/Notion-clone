// --- English Comments Only ---
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { 
  getWorkspaceStats, 
  getActivityFeed 
} = require('../controllers/analytics.controller');

// All routes in this file are protected
router.use(protect);

// Route to get summarized stats (Cards, Charts)
// GET /api/analytics/stats/12345
router.get('/stats/:workspaceId', getWorkspaceStats);

// Route to get the live activity feed (List)
// GET /api/analytics/feed/12345
router.get('/feed/:workspaceId', getActivityFeed);

module.exports = router;
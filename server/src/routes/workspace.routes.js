// --- English Comments Only ---
const express = require('express');
const router = express.Router();
const { 
  createWorkspace, 
  getMyWorkspaces,
  inviteUserToWorkspace // <-- 1. IMPORT THE NEW FUNCTION
} = require('../controllers/workspace.controller');
const { protect } = require('../middlewares/auth.middleware');

// All routes in this file are protected
router.use(protect);

// @route   POST /api/workspaces/
// @route   GET  /api/workspaces/
router.route('/')
  .post(createWorkspace)
  .get(getMyWorkspaces);

// --- 2. ADDED: New route for inviting users ---
// @route   POST /api/workspaces/:workspaceId/invite
router.route('/:workspaceId/invite')
  .post(inviteUserToWorkspace);

module.exports = router;
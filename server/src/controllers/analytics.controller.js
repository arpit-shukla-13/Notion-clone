// --- English Comments Only ---
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Document = require('../models/Document');
const Workspace = require('../models/Workspace');

// @desc    Get summarized stats for a workspace
// @route   GET /api/analytics/stats/:workspaceId
// @access  Private
exports.getWorkspaceStats = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.user._id;

  try {
    // --- 1. Check permission ---
    const workspace = await Workspace.findOne({ 
      _id: workspaceId, 
      'members.user': userId 
    });

    if (!workspace) {
      return res.status(403).json({ message: 'Not authorized for this workspace' });
    }

    // --- 2. Get Stats using separate counts (fastest way) ---
    
    // Count total documents in this workspace
    const totalDocuments = await Document.countDocuments({ 
      workspace: workspaceId 
    });

    // Count total edits logged in activities
    const totalEdits = await Activity.countDocuments({ 
      workspace: workspaceId, 
      action: 'EDITED_DOCUMENT' 
    });
    
    // Count total file uploads (we will use this when we re-add Req 4)
    const totalUploads = await Activity.countDocuments({
      workspace: workspaceId,
      action: 'UPLOADED_FILE'
    });

    // Get member count from the workspace object
    const totalMembers = workspace.members.length;

    // --- 3. Send the summarized data ---
    res.json({
      totalDocuments,
      totalEdits,
      totalUploads,
      totalMembers,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};


// @desc    Get the recent activity feed for a workspace
// @route   GET /api/analytics/feed/:workspaceId
// @access  Private
exports.getActivityFeed = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.user._id;

  try {
    // --- 1. Check permission (same as above) ---
    const workspace = await Workspace.findOne({ 
      _id: workspaceId, 
      'members.user': userId 
    });

    if (!workspace) {
      return res.status(403).json({ message: 'Not authorized for this workspace' });
    }

    // --- 2. Get last 15 activities ---
    const feed = await Activity.find({ workspace: workspaceId })
      .populate('user', 'username email') // Get user info (e.g., "Arpit")
      .populate('document', 'title')     // Get document info (e.g., "My Doc")
      .sort({ createdAt: -1 })           // Show newest first
      .limit(15);                         // Only get the last 15 items

    // --- 3. Send the feed ---
    res.json(feed);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
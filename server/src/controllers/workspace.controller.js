// src/controllers/workspace.controller.js
const Workspace = require('../models/Workspace');

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
exports.createWorkspace = async (req, res) => {
  const { name } = req.body;
  const ownerId = req.user._id; // Yeh auth.middleware se aa raha hai

  try {
    const workspace = await Workspace.create({
      name,
      owner: ownerId,
    });
    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get all workspaces for the logged-in user
// @route   GET /api/workspaces
// @access  Private
exports.getMyWorkspaces = async (req, res) => {
  const userId = req.user._id;
  try {
    // Woh saare workspaces dhoondo jahan user ek member hai
    
    // ----- YAHAN UPDATE KIYA GAYA HAI -----
    const workspaces = await Workspace.find({ 'members.user': userId })
      .populate('owner', 'username email'); // Owner ki details fetch karein
    
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
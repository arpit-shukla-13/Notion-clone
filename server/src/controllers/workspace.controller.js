// --- English Comments Only ---
// This file handles logic for Workspaces

const Workspace = require('../models/Workspace');
const Document = require('../models/Document'); // We might need this later
const Activity = require('../models/Activity'); // <-- 1. IMPORT THE NEW ACTIVITY MODEL

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
exports.createWorkspace = async (req, res) => {
  const { name } = req.body;
  const ownerId = req.user._id; // This comes from the 'protect' middleware

  try {
    const workspace = await Workspace.create({
      name,
      owner: ownerId,
    });
    
    // We populate the owner info to send back to the frontend
    const populatedWorkspace = await Workspace.findById(workspace._id).populate('owner', 'username email');
    
    // --- 2. ADDED: Log this action to the Activity feed ---
    // We log this *before* sending the response, to make sure it's saved.
    await Activity.create({
      action: 'CREATED_WORKSPACE',
      user: ownerId,
      workspace: workspace._id,
      document: null // No specific document for this action
    });
    // --- End of Added Code ---

    res.status(201).json(populatedWorkspace);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get all workspaces for the logged-in user
// @route   GET /api/workspaces
// @access  Private
exports.getMyWorkspaces = async (req, res) => {
  const userId = req.user._id;
  try {
    // Find all workspaces where the user is listed as a member
    const workspaces = await Workspace.find({ 'members.user': userId })
      .populate('owner', 'username email') // Populate owner details
      .sort({ createdAt: -1 }); // Show newest first
      
    res.json(workspaces);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
// --- English Comments Only ---
// This file handles logic for Workspaces

const Workspace = require('../models/Workspace');
const Document = require('../models/Document'); // We might need this later
const Activity = require('../models/Activity');
const User = require('../models/User'); // <-- 1. IMPORT User model (to find user by email)
const Notification = require('../models/Notification'); // <-- 2. IMPORT Notification model

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
exports.createWorkspace = async (req, res) => {
  // ... (This function is unchanged from 8:35 PM) ...
  const { name } = req.body;
  const ownerId = req.user._id; 

  try {
    const workspace = await Workspace.create({
      name,
      owner: ownerId,
    });
    
    const populatedWorkspace = await Workspace.findById(workspace._id).populate('owner', 'username email');
    
    await Activity.create({
      action: 'CREATED_WORKSPACE',
      user: ownerId,
      workspace: workspace._id,
      document: null 
    });

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
  // ... (This function is unchanged from 8:35 PM) ...
  const userId = req.user._id;
  try {
    const workspaces = await Workspace.find({ 'members.user': userId })
      .populate('owner', 'username email') 
      .sort({ createdAt: -1 }); 
      
    res.json(workspaces);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// --- 3. NEW FUNCTION ADDED FOR INVITATIONS ---

// @desc    Invite a user to a workspace
// @route   POST /api/workspaces/:workspaceId/invite
// @access  Private (Only Admin should do this - we'll add role check later)
exports.inviteUserToWorkspace = async (req, res) => {
  const { email } = req.body; // Email of the user to invite
  const { workspaceId } = req.params;
  const senderUser = req.user; // The user sending the invite (e.g., "Arpit")

  try {
    // --- 1. Find the user to invite ---
    const userToInvite = await User.findOne({ email: email });
    if (!userToInvite) {
      return res.status(404).json({ message: 'User with that email not found.' });
    }
    
    // --- 2. Find the workspace ---
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found.' });
    }

    // --- 3. Check if user is already a member ---
    const isAlreadyMember = workspace.members.some(
      (member) => member.user.toString() === userToInvite._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this workspace.' });
    }

    // --- 4. Add the new user as a member (default role 'Editor') ---
    workspace.members.push({
      user: userToInvite._id,
      role: 'Editor', // We can make this dynamic later
    });
    await workspace.save();

    // --- 5. Create a notification for the invited user ---
    const notificationText = `${senderUser.username || 'Someone'} invited you to join the workspace: ${workspace.name}`;
    
    await Notification.create({
      user: userToInvite._id,    // Notification is FOR the invited user
      sender: senderUser._id,    // Notification is FROM the admin
      type: 'WORKSPACE_INVITE',
      text: notificationText,
      workspace: workspace._id
    });

    // --- 6. TODO: Send real-time notification via Socket.io (Part 3) ---
    // We will add this logic later, after Part 2 is done.
    
    res.status(200).json({ message: `User ${email} invited successfully.` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
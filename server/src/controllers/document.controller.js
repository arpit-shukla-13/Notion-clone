// --- English Comments Only ---
const Document = require('../models/Document');
const Workspace = require('../models/Workspace');
const Activity = require('../models/Activity'); // <-- 1. IMPORT THE NEW ACTIVITY MODEL

// @desc    Create a new document in a workspace
// @route   POST /api/documents
// @access  Private
exports.createDocument = async (req, res) => {
  const { title, workspaceId, parentId = null } = req.body;
  const wsId = workspaceId || req.body.workspace;
  const userId = req.user._id;

  try {
    // Check if user is part of the workspace
    const workspace = await Workspace.findOne({ 
      _id: wsId, 
      'members.user': userId 
    });

    if (!workspace) {
      return res.status(403).json({ message: 'Not authorized for this workspace' });
    }

    const document = await Document.create({
      title: title || 'Untitled',
      workspace: wsId,
      parentId,
      createdBy: userId,
    });

    // --- 2. ADDED: Log this action to the Activity feed ---
    await Activity.create({
      action: 'CREATED_DOCUMENT',
      user: userId,
      workspace: wsId,
      document: document._id
    });
    // --- End of Added Code ---

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get all documents for a workspace (top-level only)
// @route   GET /api/documents/ws/:workspaceId
// @access  Private
exports.getDocumentsByWorkspace = async (req, res) => {
  // ... (This function remains unchanged) ...
  const { workspaceId } = req.params;
  const userId = req.user._id;

  try {
    const workspace = await Workspace.findOne({ 
      _id: workspaceId, 
      'members.user': userId 
    });

    if (!workspace) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const documents = await Document.find({ 
      workspace: workspaceId, 
      parentId: null 
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};


// @desc    Get a single document by its ID
// @route   GET /api/documents/:id
// @access  Private
exports.getDocumentById = async (req, res) => {
  // ... (This function remains unchanged) ...
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const workspace = await Workspace.findOne({
      _id: document.workspace,
      'members.user': req.user._id
    });

    if (!workspace) {
      return res.status(403).json({ message: 'Not authorized for this document' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Update a document's content
// @route   PUT /api/documents/:id
// @access  Private
exports.updateDocument = async (req, res) => {
  const { content, title } = req.body; 

  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const workspace = await Workspace.findOne({
      _id: document.workspace,
      'members.user': req.user._id
    });

    if (!workspace) {
      return res.status(403).json({ message: 'Not authorized to edit' });
    }

    // Check if content actually changed
    const contentChanged = content !== undefined && document.content !== content;
    
    if (contentChanged) {
      document.content = content;
    }
    if (title) {
      document.title = title;
    }

    const updatedDocument = await document.save();

    // --- 3. ADDED: Log this action ONLY if content changed ---
    if (contentChanged) {
      await Activity.create({
        action: 'EDITED_DOCUMENT',
        user: req.user._id,
        workspace: document.workspace,
        document: document._id
      });
    }
    // --- End of Added Code ---

    res.json(updatedDocument);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
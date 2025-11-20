// src/controllers/document.controller.js
const Document = require('../models/Document');
const Workspace = require('../models/Workspace');
const Activity = require('../models/Activity'); 

// @desc    Create a new document in a workspace
// @route   POST /api/documents
// @access  Private
exports.createDocument = async (req, res) => {
  const { title, workspaceId, parentId = null } = req.body;
  const wsId = workspaceId || req.body.workspace;
  const userId = req.user._id;

  try {
    // --- 1. Check permission (User workspace ka member hai ya nahi) ---
    const workspace = await Workspace.findOne({ 
      _id: wsId, 
      'members.user': userId 
    });

    if (!workspace) {
      return res.status(403).json({ message: 'Not authorized for this workspace' });
    }

    // --- 2. NEW CODE: Duplicate Name Check (Yahan add kiya hai) ---
    // Hum check karenge ki kya is workspace mein same title wala document pehle se hai?
    if (title) { // Sirf tab check karein agar title provided hai
        const existingDoc = await Document.findOne({
            workspace: wsId,
            title: title
        });

        if (existingDoc) {
            return res.status(400).json({ message: 'A document with this name already exists.' });
        }
    }
    // --- End of New Code ---

    const document = await Document.create({
      title: title || 'Untitled',
      workspace: wsId,
      parentId,
      createdBy: userId,
    });

    // --- 3. Log this action to the Activity feed ---
    await Activity.create({
      action: 'CREATED_DOCUMENT',
      user: userId,
      workspace: wsId,
      document: document._id
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get all documents for a workspace (top-level only)
// @route   GET /api/documents/ws/:workspaceId
// @access  Private
exports.getDocumentsByWorkspace = async (req, res) => {
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

    // --- Log this action ONLY if content changed ---
    if (contentChanged) {
      await Activity.create({
        action: 'EDITED_DOCUMENT',
        user: req.user._id,
        workspace: document.workspace,
        document: document._id
      });
    }

    res.json(updatedDocument);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
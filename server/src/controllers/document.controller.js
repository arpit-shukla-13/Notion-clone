// src/controllers/document.controller.js
const Document = require('../models/Document');
const Workspace = require('../models/Workspace');

// @desc    Create a new document in a workspace
// @route   POST /api/documents
// @access  Private
exports.createDocument = async (req, res) => {
  const { title, workspaceId, parentId = null } = req.body;
  // NOTE: Aapke naye frontend ne 'workspaceId' ki jagah 'workspace' bheja hai
  // Hum dono ko handle kar lete hain
  const wsId = workspaceId || req.body.workspace;
  const userId = req.user._id;

  try {
    // Check if user is part of the workspace (Security check)
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
    // Check if user is part of the workspace
    const workspace = await Workspace.findOne({ 
      _id: workspaceId, 
      'members.user': userId 
    });

    if (!workspace) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Sirf top-level documents (jinka parentId null hai) fetch karein
    const documents = await Document.find({ 
      workspace: workspaceId, 
      parentId: null 
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};


// ----- NAYA FUNCTION (Editor ke liye) -----
// @desc    Get a single document by its ID
// @route   GET /api/documents/:id
// @access  Private
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Security Check: Kya user is document ke workspace ka member hai?
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

// ----- NAYA FUNCTION (Editor ke liye) -----
// @desc    Update a document's content
// @route   PUT /api/documents/:id
// @access  Private
exports.updateDocument = async (req, res) => {
  const { content, title } = req.body; // Hum content ya title update kar sakte hain

  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Security Check (same as above)
    const workspace = await Workspace.findOne({
      _id: document.workspace,
      'members.user': req.user._id
    });

    if (!workspace) {
      return res.status(403).json({ message: 'Not authorized to edit' });
    }

    // Data update karein
    if (content !== undefined) {
      document.content = content;
    }
    if (title) {
      document.title = title;
    }

    const updatedDocument = await document.save();
    res.json(updatedDocument);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
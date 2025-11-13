// src/models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Untitled',
  },
  content: {
    type: String, // Hum yahan TipTap ka JSON ya Markdown save karenge
    default: '',
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    default: null, // Agar null hai, toh yeh top-level page hai
  },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
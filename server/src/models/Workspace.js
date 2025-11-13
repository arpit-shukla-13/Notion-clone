// src/models/Workspace.js
const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Shuru mein, owner hi member hai. Baad mein hum aur add kar payenge.
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['Admin', 'Editor', 'Viewer'],
        default: 'Editor',
      },
    },
  ],
}, { timestamps: true });

// Jab workspace bane, toh owner ko Admin role ke saath add kar dein
workspaceSchema.pre('save', function(next) {
  if (this.isNew) {
    this.members.push({ user: this.owner, role: 'Admin' });
  }
  next();
});

module.exports = mongoose.model('Workspace', workspaceSchema);
// --- English Comments Only ---
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This schema will store individual notifications for users
// e.g., "Arpit invited you to 'Project X'"
const notificationSchema = new Schema({
  
  // The user who this notification is FOR (e.g., the person being invited)
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // The user who *caused* the notification (e.g., the person who sent the invite)
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // The type of notification (e.g., an invitation)
  type: {
    type: String,
    required: true,
    enum: [
      'WORKSPACE_INVITE',
      'DOCUMENT_MENTION',
      // We can add more types later
    ]
  },
  
  // The main text of the notification
  text: {
    type: String,
    required: true,
  },
  
  // (Optional) The workspace this notification is related to
  workspace: {
    type: Schema.Types.ObjectId,
    ref: 'Workspace',
    default: null
  },
  
  // Has the user seen this notification?
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Automatically adds 'createdAt'
});

// Use CJS 'module.exports'
module.exports = mongoose.model('Notification', notificationSchema);
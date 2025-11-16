// --- English Comments Only ---
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This schema will act as a "logbook" for all important user actions.
// We will create a new 'Activity' document every time a user
// creates a document, edits a document, etc.
const activitySchema = new Schema({
  
  // The type of action performed (e.g., 'EDITED_DOCUMENT')
  action: {
    type: String,
    required: true,
    enum: [
      // We list all possible actions we want to track
      'CREATED_WORKSPACE',
      'CREATED_DOCUMENT',
      'EDITED_DOCUMENT', // We will trigger this on 'Save Backup'
      'DELETED_DOCUMENT',
      'UPLOADED_FILE'    // We will trigger this on file upload
      // We can add 'USER_JOINED_WORKSPACE' later
    ]
  },
  
  // The user who performed the action
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // The workspace where the action took place
  workspace: {
    type: Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  
  // (Optional) The specific document that was affected
  document: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    default: null
  }
}, {
  // This automatically adds a 'createdAt' field,
  // which is essential for our analytics.
  timestamps: true 
});

// Use CJS 'module.exports'
module.exports = mongoose.model('Activity', activitySchema);
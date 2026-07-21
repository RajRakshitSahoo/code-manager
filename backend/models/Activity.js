const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'project_created', 'project_updated', 'project_deleted', 'project_archived',
      'snippet_created', 'snippet_updated', 'snippet_deleted', 'snippet_copied',
      'note_created', 'note_updated', 'note_deleted',
      'data_exported', 'data_imported',
      'user_login', 'user_registered'
    ]
  }, 
  resource: {
    type: String,
    enum: ['project', 'snippet', 'note', 'user'],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  resourceName: {
    type: String,
    default: ''
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

activitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);

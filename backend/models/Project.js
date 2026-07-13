const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Project name is required'], 
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  category: {
    type: String,
    enum: ['Web Development', 'Frontend', 'Backend', 'Full Stack', 'React', 'JavaScript', 'Python', 'Java', 'AI Projects', 'College Projects', 'Other'],
    default: 'Other'
  },
  techStack: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'archived', 'on-hold'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isFavorite: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#007acc'
  },
  githubUrl: {
    type: String,
    default: ''
  },
  liveUrl: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

projectSchema.index({ user: 1, createdAt: -1 });
projectSchema.index({ user: 1, isFavorite: 1 });

module.exports = mongoose.model('Project', projectSchema);

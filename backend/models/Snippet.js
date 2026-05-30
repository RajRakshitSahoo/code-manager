const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  version: Number,
  code: String,
  summary: String,
  createdAt: { type: Date, default: Date.now }
});

const snippetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Snippet title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    enum: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'scss', 'python', 'java', 'c', 'cpp', 'sql', 'php', 'bash', 'json', 'yaml', 'markdown', 'rust', 'go', 'ruby', 'kotlin', 'swift', 'r', 'matlab', 'other'],
    default: 'javascript'
  },
  code: {
    type: String,
    required: [true, 'Code content is required']
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
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  versions: [versionSchema],
  currentVersion: {
    type: Number,
    default: 1
  },
  views: {
    type: Number,
    default: 0
  },
  copies: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

snippetSchema.index({ user: 1, language: 1 });
snippetSchema.index({ user: 1, isFavorite: 1 });
snippetSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Snippet', snippetSchema);

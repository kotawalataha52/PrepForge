const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// A schema to store an individual message in a chat securely
const MessageSchema = new Schema({
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  text: {
    type: String,
    required: true
  }
});

const InterviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // We can optionally store the mock ID generated
  mockId: {
    type: String
  },
  role: {
    type: String,
    default: 'Software Engineer' // Fallback
  },
  score: {
    type: Number,
    required: true
  },
  feedback: {
    type: String,
    required: true
  },
  transcript: [MessageSchema]
}, { timestamps: true });

module.exports = mongoose.model('Interview', InterviewSchema);

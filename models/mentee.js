const mongoose = require("mongoose");

const menteeSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide mentor id']
  },
  mentee: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide mentee id']
  },
  goals: [{
    target: String,
    tasks: [{
      type: mongoose.Types.ObjectId,
      ref: 'Task',
      default: []
    }]
  }],
  scheduleMeeting: {
    day: Date,
    time: String
  },
  isAgreementSigned: {
    type: Boolean,
    default: false
  },
  reason: {
    type: String,
    required: [true, 'Please provide your reasons to join']
  },
  expectations: [{
      type: mongoose.Types.ObjectId,
      ref: 'MentorshipStyle'
  }],
  achievements: [{
      achievement: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model("Mentee", menteeSchema);

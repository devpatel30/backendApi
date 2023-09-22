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
      ref: 'Task'
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
  form: {
    type: mongoose.Types.ObjectId,
    ref: 'MenteeApplicationForm',
    required: [true, 'Please provide mentee application form id']
  },
  mentorshipProgram: {
    type: mongoose.Types.ObjectId,
    ref: 'MentorProgram'
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Mentee", menteeSchema);

const mongoose = require("mongoose");
const { Schema } = mongoose;

const mentorProgramSchema = new Schema({
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  description: {
    type: String,
    required: [true, 'Please provide program description']
  },
  totalDays: {
    type: Number,
  },
  meetingFrequency: {
    type: Number,
    required: [true, 'Please provide meeting frequency']
  },
  meetingDuration: {
    type: Number,
    required: [true, 'Please provide meeting duration']
  },
  goals: [String]
});

module.exports = new mongoose.model("MentorProgram", mentorProgramSchema);

const mongoose = require("mongoose");
const { Schema } = mongoose;

const mentorProgramSchema = new Schema({
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  menteeId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  totalDays: {
    type: Number,
  },
  remainingDays: {
    type: Number,
  },
  meeting: {
    type: Schema.Types.ObjectId,
    ref: "ScheduleMeeting",
  },
  isAgreementSigned: {
    type: Boolean,
    default: false,
  },
  isMentorVerified: {
    type: Boolean,
    default: false,
  },
  goals: {
    type: Schema.Types.ObjectId,
    ref: "ProgramGoal",
  },
});

module.exports = new mongoose.model("MentorProgram", mentorProgramSchema);

const mongoose = require("mongoose");
const { Schema } = mongoose;

const programDetailsSchema = new Schema({
  totalDays: {
    type: Number,
  },
  remainingDays: {
    type: Number,
  },
  extensionStatus: {
    type: String,
    enum: ["pending", "none"],
    default: "none",
  },
  // ask for feedback at the midway and end of the program
  requireFeedback: {
    type: Boolean,
  },
  //   meeting:{
  //     scheduleMeetingResource
  //   },
  isAgreementSigned: {
    type: Boolean,
    default: false,
  },
  goals: {
    type: Schema.Types.ObjectId,
    ref: "ProgramGoal",
  },
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  menteeId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = new mongoose.model("ProgramDetails", programDetailsSchema);

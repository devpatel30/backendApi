const mongoose = require("mongoose");
const { Schema } = mongoose;

const mentorshipProgramSchema = new Schema({
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  description: {
    type: String,
  },
  isJoined: {
    type: Boolean,
    default: false,
  },
  isTopMatch: {
    type: Boolean,
    default: false,
  },
});

module.exports = new mongoose.model(
  "MentorshipProgram",
  mentorshipProgramSchema
);

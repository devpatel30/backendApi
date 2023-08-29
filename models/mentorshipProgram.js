const mongoose = require("mongoose");
const { Schema } = mongoose;

//  name (String)
//  headline (String)
//  yearsOfExperience (int) -> based on the most recent job experience ?
//  image (String)
//  skills (List<String>)
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

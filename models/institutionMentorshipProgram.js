const mongoose = require("mongoose");
const { Schema } = mongoose;

const instMentorsipProgramSchema = new Schema({
  description: {
    type: String,
  },
  coverImage: {
    fileName: String,
    imageUrl: String,
  },
  mentorLimit: {
    type: Number,
  },
  noOfMentors: {
    type: Number,
  },
  hasEvents: {
    type: Boolean,
    default: false,
  },
  isTopMatch: {
    type: Boolean,
    default: false,
  },
  noOfPeopleAssociated: {
    type: Number,
  },
  recentPeopleAssociated: {
    type: Schema.Types.ObjectId,
    ref: "Connection",
  },
});

module.exports = new mongoose.model(
  "InstMentorshipProgram",
  instMentorsipProgramSchema
);

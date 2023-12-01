const mongoose = require("mongoose");
const { Schema } = mongoose;

const instMentorsipProgramSchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  description: {
    type: String,
  },
  coverImage: {
    fileName: String,
  },
  imageUrl: {
    type: String,
  },
  mentorLimit: {
    type: Number,
    default: 1,
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
  recentPeopleAssociated: [
    {
      type: Schema.Types.ObjectId,
      ref: "Connection",
    },
  ],
  invitedPeople: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = new mongoose.model(
  "InstMentorshipProgram",
  instMentorsipProgramSchema
);

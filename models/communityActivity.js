const mongoose = require("mongoose");
const { Schema } = mongoose;

const noOfCommunityActivitySchema = new Schema({
  refferalCount: {
    type: Number,
  },
  helpfulCount: {
    type: Number,
  },
  interactionsCount: {
    type: Number,
  },
  mentorshipSessions: {
    type: Number,
  },
});
const communityActivityScehma = new Schema({
  referrals: {
    type: Schema.Types.ObjectId,
    ref: "CommunityUser",
  },
  helpful: {
    type: Schema.Types.ObjectId,
    ref: "CommunityUser",
  },
  interactions: {
    type: Schema.Types.ObjectId,
    ref: "CommunityUser",
  },
  mentorshipSessions: {
    type: Schema.Types.ObjectId,
    ref: "CommunityUser",
  },
});

module.exports = new mongoose.model(
  "CommunityActivity",
  communityActivityScehma
);
module.exports = new mongoose.model(
  "NoOfCommunityActivity",
  noOfCommunityActivitySchema
);

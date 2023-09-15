const mongoose = require("mongoose");
const { Schema } = mongoose;

const profileScehma = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  connectionStatus: {
    type: String,
    enum: ["connection", "network", "null"],
  },
  isFollowing: {
    type: Boolean,
  },
  isFollowed: {
    type: Boolean,
  },
  isSaved: {
    type: Boolean,
  },
  mutualConnections: {
    type: Schema.Types.ObjectId,
    ref: "Connection",
  },
  mutualConnectionsCount: {
    type: Number,
  },
});

module.exports = mongoose.model("Profile", profileScehma);

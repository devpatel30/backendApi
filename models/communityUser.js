const mongoose = require("mongoose");
const { Schema } = mongoose;

const communityUserScehma = new Schema({
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  university: {
    type: String,
  },
  connectionType: {
    type: String,
    enum: ["connection", "network", "null"],
  },
  activityCount: {
    type: Schema.Types.ObjectId,
    ref: "NoOfCommunityActivity",
  },
});

module.exports = new mongoose.model("CommunityUser", communityUserScehma);

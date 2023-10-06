const mongoose = require("mongoose");
const { Schema } = mongoose;
const User = require("./user");

const mentorInfoSchema = new Schema({
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  description: {
    type: String,
  },
  isJoined: {
    type: Boolean,
  },
});

const MentorInfo = mongoose.model("MentorInfo", mentorInfoSchema);
module.exports = MentorInfo;

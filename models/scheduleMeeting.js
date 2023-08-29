const mongoose = require("mongoose");
const { Schema } = mongoose;

const meetingSchema = new Schema({
  date: {
    type: Date,
  },
  time: {
    type: String,
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

module.exports = new mongoose.model("Meeting", meetingSchema);

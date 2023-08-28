const mongoose = require("mongoose");
const { Schema } = mongoose;

const menteeSchema = new Schema({
  menteeId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  connection: {
    type: Schema.Types.ObjectId,
    ref: "Connection",
  },
  application: {
    type: Schema.Types.ObjectId,
    ref: "MentorshipApplication",
  },
});

module.exports = new mongoose.model("Mentee", menteeSchema);

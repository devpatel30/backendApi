const mongoose = require("mongoose");
const { Schema } = mongoose;

const waitlistSchema = new Schema({
  email: {
    type: String,
  },
});

module.exports = mongoose.model("Waitlist", waitlistSchema);

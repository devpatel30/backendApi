const mongoose = require("mongoose");
const { Schema } = mongoose;

const mentorshipStyleSchema = new Schema({
  name: {
    type: String,
  },
});

module.exports = mongoose.model("MentorshipStyle", mentorshipStyleSchema);

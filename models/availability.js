const mongoose = require("mongoose");
const { Schema } = mongoose;

const availabilitySchema = new Schema({
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
});

module.exports = mongoose.model("Availability", availabilitySchema);

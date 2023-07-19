const mongoose = require("mongoose");
const { Schema } = mongoose;

const timeslotSchema = new Schema(
  {
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
  }

  // {
  //   _id: false, // Set _id option to false for the subdocument
  // }
);

const availabilitySchema = new Schema({
  day: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  timeslots: [timeslotSchema],
});

module.exports = mongoose.model("Availability", availabilitySchema);

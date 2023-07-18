const mongoose = require("mongoose");
const { Schema } = mongoose;

const schoolSchema = new Schema({
  name: {
    type: String,
  },
  major: [
    {
      type: Schema.Types.ObjectId,
      ref: "Major",
    },
  ],
  starting_date: {
    type: String,
  },
  ending_date: {
    type: String,
  },
});

module.exports = mongoose.model("School", schoolSchema);

const mongoose = require("mongoose");
const { Schema } = mongoose;

const schoolSchema = new Schema({
  name: {
    type: String,
  },
  majors: [
    {
      type: Schema.Types.ObjectId,
      ref: "Major",
    },
  ],
});

module.exports = mongoose.model("School", schoolSchema);

const mongoose = require("mongoose");
const { Schema } = mongoose;

const jobTitleSchema = new Schema({
  name: {
    type: String,
  },
});

module.exports = mongoose.model("JobTitle", jobTitleSchema);

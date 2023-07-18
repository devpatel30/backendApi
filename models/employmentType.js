const mongoose = require("mongoose");
const { Schema } = mongoose;

const employmentTypeSchema = new Schema({
  name: {
    type: String,
  },
});

module.exports = mongoose.model("EmploymentType", employmentTypeSchema);

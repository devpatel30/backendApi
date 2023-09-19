const mongoose = require("mongoose");
const { Schema } = mongoose;

const companySchema = new Schema({
  name: {
    type: String,
  },
  address: {
    type: String,
  },
  website: {
    type: String,
  },
  businessType: {
    type: String,
    enum: ["company", "institution"],
    default: "company"
  }
});

module.exports = mongoose.model("Company", companySchema);

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
});

module.exports = mongoose.model("Company", companySchema);

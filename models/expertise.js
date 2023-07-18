const mongoose = require("mongoose");
const { Schema } = mongoose;

const expertiseSchema = new Schema({
  name: {
    type: String,
  },
  years: {
    type: String,
  },
});

module.exports = mongoose.model("Expertise", expertiseSchema);

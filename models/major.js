const mongoose = require("mongoose");
const { Schema } = mongoose;

const majorSchema = new Schema({
  name: {
    type: String,
  },
});

module.exports = mongoose.model("Major", majorSchema);

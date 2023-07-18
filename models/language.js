const mongoose = require("mongoose");
const { Schema } = mongoose;

const languageSchema = new Schema({
  name: {
    type: String,
  },
});

module.exports = mongoose.model("Language", languageSchema);

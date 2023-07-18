const mongoose = require("mongoose");
const { Schema } = mongoose;

const skillSchema = new Schema({
  name: {
    type: String,
  },
});

module.exports = mongoose.model("Skill", skillSchema);

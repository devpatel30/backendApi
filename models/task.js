const mongoose = require("mongoose");
const { Schema } = mongoose;

const taskSchema = new Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = new mongoose.model("Task", taskSchema);

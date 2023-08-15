const mongoose = require("mongoose");
const { Schema } = mongoose;

const goalSchema = new Schema({
  careerGoals: {
    type: String,
  },
  skillGoals: {
    type: String,
  },
  financialGoals: {
    type: String,
  },
  socialGoals: {
    type: String,
  },
});

module.exports = new mongoose.model("Goal", goalSchema);

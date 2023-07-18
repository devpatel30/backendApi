const mongoose = require("mongoose");
const { Schema } = mongoose;

const interestSchema = new Schema({
  name: {
    type: String,
  },
  skill: [
    {
      type: Schema.Types.ObjectId,
      ref: "Skill",
    },
  ],
});

module.exports = mongoose.model("Interest", interestSchema);

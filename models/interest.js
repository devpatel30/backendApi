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
interestSchema.pre(/^find/, function (next) {
  this.populate("skill");
  next();
});
module.exports = mongoose.model("Interest", interestSchema);

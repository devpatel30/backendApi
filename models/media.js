const mongoose = require("mongoose");
const { Schema } = mongoose;

const mediaSchema = new Schema({
  type: {
    type: String,
    enum: ["image", "video"],
  },
  field: {
    fileName: String,
  },
  url: {
    type: String,
  },
  taggedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});
mediaSchema.pre(/^find/, function (next) {
  this.populate("taggedUsers");
  next();
});

module.exports = mongoose.model("Media", mediaSchema);

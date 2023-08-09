const mongoose = require("mongoose");
const { Schema } = mongoose;

const portfolioSchema = new Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  link: {
    type: String,
  },
  thumbnail: {
    type: Schema.Types.ObjectId,
    ref: "Media",
  },
  images: [
    {
      type: Schema.Types.ObjectId,
      ref: "Media",
    },
  ],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});
portfolioSchema.pre(/^find/, function (next) {
  this.populate(["thumbnail", "images"]);
  next();
});

module.exports = mongoose.model("Portfolio", portfolioSchema);

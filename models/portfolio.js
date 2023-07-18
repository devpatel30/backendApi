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
});

module.exports = mongoose.model("Portfolio", portfolioSchema);

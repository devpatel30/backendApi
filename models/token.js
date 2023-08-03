const mongoose = require("mongoose");
const { Schema } = mongoose;

const tokenSchema = new Schema(
  {
    accessToken: {
      type: String,
    },
    userId: {
      type: String,
    },
    // the token is removed from db in 1week
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: 604800 },
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("Token", tokenSchema);

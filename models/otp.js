const mongoose = require("mongoose");
const { Schema } = mongoose;

const otpSchema = new Schema(
  {
    receiverContact: {
      type: String,
      required: true,
    },
    contactType: {
      type: String,
      enum: ["email", "mobile"],
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    secret: {
      type: String,
      required: true,
    },
    // it deletes after 60s from the db
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: 60 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema);

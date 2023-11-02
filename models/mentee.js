const mongoose = require("mongoose");

// this also works as program details
const menteeSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide mentor id"],
    },
    mentee: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide mentee id"],
    },
    totalDays: {
      type: Number,
      default: 30,
    },
    remainingDays: {
      type: Number,
    },
    extensionStatus: {
      type: String,
      enum: ["pending", "none", "done", "declined"],
      default: "none",
    },
    extensionDays: {
      type: Number,
    },
    goals: [
      {
        target: String,
        tasks: [
          {
            type: mongoose.Types.ObjectId,
            ref: "Task",
            default: [],
          },
        ],
      },
    ],
    scheduleMeeting: {
      day: Date,
      time: String,
    },
    isAgreementSigned: {
      type: Boolean,
      default: false,
    },
    // ask for feedback at the midway and end of the program
    requireFeedback: {
      type: Boolean,
    },
    reason: {
      type: String,
      required: [true, "Please provide your reasons to join"],
    },
    expectations: [
      {
        type: mongoose.Types.ObjectId,
        ref: "MentorshipStyle",
      },
    ],
    achievements: [
      {
        achievement: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Mentee", menteeSchema);

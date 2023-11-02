const mongoose = require("mongoose");
const { Schema } = mongoose;

const mentorshipFeedbackSchema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  programId: {
    type: mongoose.Types.ObjectId,
    ref: "Mentee",
  },
  communicationEffectiveness: {
    rating: Number,
    message: String,
  },
  supportLevel: {
    rating: Number,
    message: String,
  },
  knowledgeExchange: {
    rating: Number,
    message: String,
  },
  progressRate: {
    rating: Number,
    message: String,
  },
});

module.exports = mongoose.model("MentorshipFeedback", mentorshipFeedbackSchema);

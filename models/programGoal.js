const mongoose = require("mongoose");
const { Schema } = mongoose;

const programGoalSchema = new Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  mentorshipProgramId: {
    type: Schema.Types.ObjectId,
    ref: "MentorshipProgram",
  },
  tasks: {
    type: Schema.Types.ObjectId,
    ref: "Task",
  },
});

module.exports = new mongoose.model("ProgramGoal", programGoalSchema);

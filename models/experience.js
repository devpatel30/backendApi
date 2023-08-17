const mongoose = require("mongoose");
const { Schema } = mongoose;

const experienceSchema = new Schema({
  jobTitleId: {
    type: Schema.Types.ObjectId,
    ref: "JobTitle",
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: "Company",
  },
  employmentType: {
    type: String,
    enum: [
      "fullTime",
      "partTime",
      "internship",
      "contract",
      "freelance",
      "temporary",
      "selfEmployed",
    ],
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
});
experienceSchema.pre(/^find/, function (next) {
  this.populate(["jobTitleId", "companyId"]);
  next();
});
module.exports = mongoose.model("Experience", experienceSchema);

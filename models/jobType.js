const mongoose = require("mongoose")

const jobTypeSchema = new mongoose.Schema({
    jobType: {
        type: String,
        enum: ["part-time", "full-time", "internship"]
    }
})

module.exports = mongoose.model("JobType", jobTypeSchema)
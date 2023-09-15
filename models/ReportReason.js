const mongoose = require("mongoose")

const reportReasonSchema = new mongoose.Schema({
    reason: {
        type: String,
        required: [true, 'Please provide report reason']
    },
    hasExplanation: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("ReportReason", reportReasonSchema)
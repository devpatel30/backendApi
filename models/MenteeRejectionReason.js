const mongoose = require("mongoose")

const menteeRejectionReasonSchema = new mongoose.Schema({
    reason: {
        type: String,
        required: [true, "Please provide mentee rejection reason"],
        trim: true
    }
})

module.exports = mongoose.model("MenteeRejectionReason", menteeRejectionReasonSchema)
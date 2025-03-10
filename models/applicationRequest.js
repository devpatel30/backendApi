const mongoose = require("mongoose")

const applicationRequestSchema = new mongoose.Schema({
    mentor: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide mentor id']
    },
    mentee: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide mentee id']
    },
    applicationStatus: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
    form: {
        type: mongoose.Types.ObjectId,
        ref: 'MenteeApplicationForm',
        required: [true, 'Please provide form id']
    },
    rejectionReason: {
        type: mongoose.Types.ObjectId,
        ref: 'MenteeRejectionReason'
    },
    rejectionExplanation: String
}, {
    timestamps: true
})

applicationRequestSchema.pre(/^find/, function(next) {
    this.populate("form")
    next()
})

module.exports = mongoose.model("ApplicationRequest", applicationRequestSchema)
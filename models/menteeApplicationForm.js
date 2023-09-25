const mongoose = require("mongoose")

const menteeApplicationFormSchema = new mongoose.Schema({
    mentee: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide mentee id']
    },
    goals: [{
        target: String
    }],
    reason: {
        type: String,
        required: [true, 'Please provide your reasons to join']
    },
    expectations: [{
        type: mongoose.Types.ObjectId,
        ref: 'MentorshipStyle'
    }],
    achievements: [{
        achievement: String
    }]
}, {
    timestamps: true
})

module.exports = mongoose.model("MenteeApplicationForm", menteeApplicationFormSchema)
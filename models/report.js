const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user id']
    },
    reportedUser: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide the reported user id']
    },
    reasonId: {
        type: mongoose.Types.ObjectId,
        ref: 'ReportReason',
        required: [true, 'Please provide the reason']
    },
    message: String
}, {
    timestamps: true
})

module.exports = mongoose.model("Report", reportSchema)
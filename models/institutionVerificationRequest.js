const mongoose = require("mongoose")

const institutionVerificationRequest = new mongoose.Schema({
    institutionId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide institution id']
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user id']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    schoolEmail: String,
    schoolId: String,
}, {
    timestamps: true
})

module.exports = mongoose.model("InstitutionVerificationRequest", institutionVerificationRequest)
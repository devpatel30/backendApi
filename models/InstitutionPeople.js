const mongoose = require("mongoose")

const institutionPeopleSchem = new mongoose.Schema({
    institutionId: {
        type: mongoose.Types.ObjectId,
        ref: "Company"
    },
    members: [{
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User"
        },
        memberType: {
            type: String,
            enum: ["mentor", "employee", "alumni"]
        },
        createdAt: {
            type: Date,
            default: Date.now()
        }
    }]
}, {
    timestamps: true
})

module.exports = mongoose.model("InstitutionPeople", institutionPeopleSchem)
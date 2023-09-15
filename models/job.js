const mongoose = require("mongoose")
const parseTime = require("../utils/parseTime")

const jobSchema = new mongoose.Schema({
    institution: {
        type: mongoose.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Please provide institution']
    },
    title: {
        type: String,
        required: [true, 'Please provide job title'],
        maxLength: [100, 'Max length of job title is 100'],
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide job description'],
        maxLength: [2000, 'Max length of description is 2000'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Please provide job location'],
        trim: true
    },
    salary: {
        min: Number,
        max: Number
    },
    jobType: {
        type: mongoose.Types.ObjectId,
        ref: 'JobType',
        required: [true, 'Please provide job type']
    },
    technicalSkills: [{
        type: mongoose.Types.ObjectId,
        ref: 'Skill'
    }],
    personalSkills: [String],
    dayOfWorkDetails: String,
    companyCulture: String,
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

jobSchema.virtual("isNew").get(function() {
    return this.updatedAt.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
})

jobSchema.virtual("duration").get(function() {
    return parseTime(this.updatedAt)
})

jobSchema.pre(/^find/, function(next) {
    this.find({ isVerified: true })
    next()
})

module.exports = mongoose.model("Job", jobSchema)
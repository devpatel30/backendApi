const Job = require("../models/job")
const catchAsync = require("../utils/catchAsync")

const jobSimpleSelection = "title updatedAt duration isNew"

module.exports.fetchInstitutionRecentJobs = catchAsync(async (req, res, next) => {
    const { institutionId } = req.body
    // 1. Check for required data
    if (!institutionId) {
        return res.status(200).json({
            status: false,
            message: 'Please provide institution id'
        })
    }
    // 2. Fetch jobs
    const jobs = await Job.find({ institution: institutionId }).sort({ 'updatedAt': -1 }).limit(5).select(jobSimpleSelection)
    res.status(200).json({
        status: true,
        message: 'Institution Jobs',
        data: jobs || []
    })
})

module.exports.fetchInstitutionAllJobs = catchAsync(async (req, res, next) => {
    const { institutionId } = req.body
    // 1. Check for required data
    if (!institutionId) {
        return res.status(200).json({
            status: false,
            message: 'Please provide institution id'
        })
    }
    // 2. Fetch Jobs
    let searchObj = {
        institution: institutionId
    }
    if (req.query.title) {
        searchObj.title = req.query.title.toLowerCase()
    }
    const jobs = await Job.find(searchObj).sort({ 'updatedAt': -1 }).select(jobSimpleSelection)
    res.status(200).json({
        status: true, 
        message: 'Institution jobs',
        count: jobs?.length || 0,
        data: jobs || []
    })
})
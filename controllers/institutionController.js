const Job = require("../models/job")
const InstitutionPeople = require("../models/InstitutionPeople")
const catchAsync = require("../utils/catchAsync")
const mongoose = require("mongoose")

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

module.exports.fetchInstitutionRecentPeople = catchAsync(async (req, res, next) => {
    const { institutionId } = req.body
    // 1. Check for required input
    if (!institutionId) {
        return res.status(200).json({
            status: false,
            message: "Please provide institution id"
        })
    }
    // 2. Fetch the institution members
    const members = await InstitutionPeople.aggregate([
        { "$match": { "institutionId": new mongoose.Types.ObjectId(institutionId) } },
        { "$unwind": "$members" },
        { "$sort": { "members.createdAt": -1 } },
        { "$group": {
            "_id": "$members.memberType",
            "memberType": { $first: "$members.memberType" },
            "members": { "$push": "$members" }
        }},
        { "$project": { _id: 0 } }
    ])

    await InstitutionPeople.populate(members, { path: "members.userId" })
    res.status(200).json({
        status: true,
        message: "Institution members",
        data: members
    })
})

module.exports.fetchInstitutionMembers = catchAsync(async (req, res, next) => {
    const { institutionId, type } = req.body
    // 1. Check for required Data
    if (!institutionId || !type) {
        return res.status(200).json({
            status: false,
            message: "Please provide required data"
        })
    }
    // 2. Fetch Institution members
    const members = await InstitutionPeople.aggregate([
        { "$match": { "institutionId": new mongoose.Types.ObjectId(institutionId) } },
        { "$unwind": "$members" },
        { "$match": { "members.memberType": type } },
        { "$group": {
            "_id": "$_id",
            "members": { "$push": "$members" }
        }}
    ])
    await InstitutionPeople.populate(members, { path: "members.userId" })
    res.status(200).json({
        status: true,
        message: "Institution members",
        data: members[0].members
    })
})
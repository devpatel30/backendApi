
const catchAsync = require("../utils/catchAsync");
const Expertise = require("../models/expertise")
const Availability = require("../models/availability")
const MenteeApplicationForm = require("../models/menteeApplicationForm")
const ApplicationRequest = require("../models/applicationRequest")
const Mentee = require("../models/mentee")
const User = require("../models/user")
const { generateJWT } = require("./userControllers")

module.exports.becomeMentor = catchAsync(async (req, res, next) => {
    const { jobTitleId, 
      companyId, 
      employmentType, 
      expertises, 
      mentorshipStyles, 
      noOfMentees, 
      availabilities, 
      institutionId 
    } = req.body
    // 1. Check for valid data
    if (!jobTitleId || !companyId || !employmentType || !expertises || !mentorshipStyles || !noOfMentees || !availabilities) {
      return res.status(200).json({
        status: false,
        message: "Missing required data"
      })
    }
    // 2. Craete data
    const [newExpertise, availabs] = await Promise.all([
      Expertise.create(expertises),
      Availability.create(availabilities)
    ])
    // 3. update user
    const updateObj = {
      "personalInfo.userType": "mentor",
      "mentor.jobTitle": jobTitleId,
      "mentor.company": companyId,
      "mentor.employmentType": employmentType,
      "mentor.noOfMentees": noOfMentees,
      "mentor.mentorshipStyle": mentorshipStyles,
      "mentor.availability": availabs.map(a => a._id),
      "mentor.expertise": newExpertise.map(a => a._id)
    }
    if (!institutionId) {
      updateObj["mentor.isMentorVerified"] = true
      const user = await User.findByIdAndUpdate(req.userId, updateObj, { new: true })
      const token = generateJWT(user)
      res.status(200).json({
        status: true,
        message: "You're all set",
        data: { ...user, token: "Bearer " + token }
      })
    } else {
      updateObj["mentor.isMentorVerified"] = false
      updateObj["mentor.mentorshipInstitution"] = institutionId
      const user = await User.findByIdAndUpdate(req.userId, updateObj, { new: true })
      const token = generateJWT(user)
      res.status(200).json({
        status: true,
        message: "Your verification is in progress",
        data: { ...user, token: "Bearer " + token }
      })
    }
})

module.exports.createApplicationForm = catchAsync(async (req, res, next) => {
  const { goals, reason, expectations, achievements } = req.body
  // 1. Check for valid input
  if (!goals || !reason || !expectations || !achievements) {
    return res.status(200).json({
      status: false,
      message: 'Please provide required data'
    })
  }
  // 2. Check if form exists with this data
  const isFormExists = await MenteeApplicationForm.findOne({
    goals, reason, expectations, achievements, mentee: req.userId
  })
  if (isFormExists) {
    return res.status(200).json({
      status: false,
      message: 'Form already exists'
    })
  }
  // 3. Create the form
  const form = await MenteeApplicationForm.create({
    goals, reason, expectations, achievements, mentee: req.userId
  })
  res.status(200).json({
    status: true,
    message: "Form created successfully",
    data: { form }
  })
})

module.exports.fetchApplicationForms = catchAsync(async (req, res, next) => {
  const forms = await MenteeApplicationForm.find({ mentee: req.userId })
  res.status(200).json({
    status: true,
    message: "Mentee Application forms",
    data: forms
  })
})

module.exports.applyToBeMentorsMentee = catchAsync(async (req, res, next) => {
  const { mentorId, formId } = req.body
  // 1. Check for required data
  if (!mentorId || !formId) {
    return re.status(200).json({
      status: false,
      message: 'Please provide required data'
    })
  }
  // 2. Check if form and mentor exists & if user has already applyed
  const [form, mentor, isApplyed] = await Promise.all([
    MenteeApplicationForm.findById(formId),
    User.findById(mentorId),
    ApplicationRequest.findOne({ mentor: mentorId, form: formId, mentee: req.userId })
  ])
  if (!form) {
    return res.status(200).json({
      status: false,
      message: 'Form Not found!!'
    })
  }
  if (!mentor) {
    return res.status(200).json({
      status: false,
      message: 'Mentor Not Found!!'
    })
  }
  if (isApplyed) {
    return res.status(200).json({
      status: false,
      message: 'You already applyed!!'
    })
  }
  // 3. Create Application
  await ApplicationRequest.create({
    mentor: mentorId,
    mentee: req.userId,
    form: formId
  })
  res.status(200).json({
    status: true,
    message: 'Application sent successfully'
  })
})

module.exports.fetchMentees = catchAsync(async (req, res, next) => {
  
})

module.exports.acceptApplicationRequest = catchAsync(async (req, res, next) => {
  
})

module.exports.rejectApplicationRequest = catchAsync(async (req, res, next) => {

})
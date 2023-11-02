const catchAsync = require("../utils/catchAsync");
const Expertise = require("../models/expertise");
const Availability = require("../models/availability");
const MenteeApplicationForm = require("../models/menteeApplicationForm");
const ApplicationRequest = require("../models/applicationRequest");
const Mentee = require("../models/mentee");
const User = require("../models/user");
const Task = require("../models/task");
const InstitutionVerificationRequest = require("../models/institutionVerificationRequest");
const InstitutionPeople = require("../models/InstitutionPeople");
const { generateJWT } = require("./userControllers");
const mentee = require("../models/mentee");
const mentorshipFeedback = require("../models/mentorshipFeedback");

module.exports.becomeMentor = catchAsync(async (req, res, next) => {
  const {
    jobTitleId,
    companyId,
    employmentType,
    expertises,
    mentorshipStyles,
    noOfMentees,
    availabilities,
    institutionId,
    schoolEmail,
    schoolId,
  } = req.body;
  // 1. Check for valid data
  if (
    !jobTitleId ||
    !companyId ||
    !employmentType ||
    !expertises ||
    !mentorshipStyles ||
    !noOfMentees ||
    !availabilities
  ) {
    return res.status(200).json({
      status: false,
      message: "Missing required data",
    });
  }
  // 2. Create data
  const [newExpertise, availabs] = await Promise.all([
    Expertise.create(expertises),
    Availability.create(availabilities),
  ]);
  // 3. update user
  const updateObj = {
    "personalInfo.userType": "mentor",
    "mentor.jobTitle": jobTitleId,
    "mentor.company": companyId,
    "mentor.employmentType": employmentType,
    "mentor.noOfMentees": noOfMentees,
    "mentor.mentorshipStyle": mentorshipStyles,
    "mentor.availability": availabs.map((a) => a._id),
    "mentor.expertise": newExpertise.map((a) => a._id),
  };
  const user = await User.findByIdAndUpdate(req.userId, updateObj, {
    new: true,
  });
  const token = generateJWT(user);
  // 4. Check for verification
  if (institutionId) {
    const isRequestExists = await InstitutionVerificationRequest.findOne({
      institutionId,
      userId: req.userId,
    });
    if (isRequestExists) {
      return res.status(200).json({
        status: false,
        message: "Request was already sent",
      });
    }
    await InstitutionVerificationRequest.create({
      institutionId,
      userId: req.userId,
      schoolEmail: schoolEmail || null,
      schoolId: schoolId || null,
    });
    return res.status(200).json({
      status: true,
      message: "Your verification is in progress",
      data: { token: "Bearer " + token, user },
    });
  }
  res.status(200).json({
    status: true,
    message: "You're all set",
    data: { token: "Bearer " + token, user },
  });
});

module.exports.verifyMentor = catchAsync(async (req, res, next) => {
  const { requestId, status } = req.body;
  // 1. Check if request exists
  const isRequestExists = await InstitutionVerificationRequest.findById(
    requestId
  );
  if (!isRequestExists) {
    return res.status(200).json({
      status: false,
      message: "Request not found!",
    });
  }
  if (isRequestExists.institutionId.toString() !== req.userId.toString()) {
    return res.status(200).json({
      status: false,
      message: "Unauthorized",
    });
  }
  // 2. Accept mentor to institution
  if (status === "accept") {
    const institutionMembers = await InstitutionPeople.findOne({
      institutionId: isRequestExists.institutionId,
    });
    if (!institutionMembers) {
      await InstitutionPeople.create({
        institutionId: isRequestExists.institutionId,
        members: [
          {
            userId: isRequestExists.userId,
            memberType: "mentor",
          },
        ],
      });
    } else {
      institutionMembers.members.push({
        userId: isRequestExists.userId,
        memberType: "mentor",
      });
      await institutionMembers.save();
    }
    await InstitutionVerificationRequest.findByIdAndDelete(requestId);
    res.status(200).json({
      status: true,
      message: "Mentor is accepted successfully",
    });
  }
  // 3. Reject mentor request
  if (status === "reject") {
    await InstitutionVerificationRequest.findByIdAndDelete(requestId);
    res.status(200).json({
      status: true,
      message: "Mentor is rejected successfully",
    });
  }
});

module.exports.createApplicationForm = catchAsync(async (req, res, next) => {
  const { goals, reason, expectations, achievements } = req.body;
  // 1. Check for valid input
  if (!goals || !reason || !expectations || !achievements) {
    return res.status(200).json({
      status: false,
      message: "Please provide required data",
    });
  }
  // 2. Check if form exists with this data
  const isFormExists = await MenteeApplicationForm.findOne({
    goals,
    reason,
    expectations,
    achievements,
    mentee: req.userId,
  });
  if (isFormExists) {
    return res.status(200).json({
      status: false,
      message: "Form already exists",
    });
  }
  // 3. Create the form
  const form = await MenteeApplicationForm.create({
    goals,
    reason,
    expectations,
    achievements,
    mentee: req.userId,
  });
  await MenteeApplicationForm.populate(form, "expectations");
  res.status(200).json({
    status: true,
    message: "Form created successfully",
    data: form,
  });
});

module.exports.fetchApplicationForms = catchAsync(async (req, res, next) => {
  const forms = await MenteeApplicationForm.find({
    mentee: req.userId,
  }).populate("expectations");
  res.status(200).json({
    status: true,
    message: "Mentee Application forms",
    data: forms,
  });
});

module.exports.applyToBeMentorsMentee = catchAsync(async (req, res, next) => {
  const { mentorId, formId } = req.body;
  // 1. Check for required data
  if (!mentorId || !formId) {
    return re.status(200).json({
      status: false,
      message: "Please provide required data",
    });
  }
  // 2. Check if form and mentor exists & if user has already applyed
  const [form, mentor, isApplyed] = await Promise.all([
    MenteeApplicationForm.findById(formId),
    User.findById(mentorId),
    ApplicationRequest.findOne({
      mentor: mentorId,
      form: formId,
      mentee: req.userId,
    }),
  ]);
  if (!form) {
    return res.status(200).json({
      status: false,
      message: "Form Not found!!",
    });
  }
  if (!mentor) {
    return res.status(200).json({
      status: false,
      message: "Mentor Not Found!!",
    });
  }
  if (isApplyed) {
    return res.status(200).json({
      status: false,
      message: "You already applyed!!",
    });
  }
  // 3. Check if user is already under mentor's mentorship
  const isMenteeExists = await Mentee.findOne({
    mentor: mentorId,
    mentee: req.userId,
  });
  if (isMenteeExists) {
    return res.status(200).json({
      status: false,
      message: "You are already under this mentor's mentorship",
    });
  }
  // 4. Create Application
  await ApplicationRequest.create({
    mentor: mentorId,
    mentee: req.userId,
    form: formId,
  });
  res.status(200).json({
    status: true,
    message: "Application sent successfully",
  });
});

module.exports.fetchMentees = catchAsync(async (req, res, next) => {
  const [applicants, mentees] = await Promise.all([
    ApplicationRequest.find({
      mentor: req.userId,
      applicationStatus: "pending",
    }).populate(["mentee", "form"]),
    Mentee.find({ mentor: req.userId }).populate("mentee"),
  ]);
  res.status(200).json({
    status: true,
    message: "Mentor's mentees and applicants",
    data: { mentees, applicants },
  });
});

module.exports.acceptApplicationRequest = catchAsync(async (req, res, next) => {
  const { applicationId } = req.body;
  // 1. check if application exists
  const isApplicationExists = await ApplicationRequest.findOne({
    _id: applicationId,
    mentor: req.userId,
  }).populate("form");
  if (!isApplicationExists) {
    return res.status(200).json({
      status: false,
      message: "Application not found!",
    });
  }
  // 2. Create a document in Mentee model for this applicant and delete application request
  const menteeObj = {
    mentor: req.userId,
    mentee: isApplicationExists.mentee,
    goals: isApplicationExists.form.goals.map((x) => {
      return { target: x.target };
    }),
    reason: isApplicationExists.form.reason,
    expectations: isApplicationExists.form.expectations,
    achievements: isApplicationExists.form.achievements.map((x) => {
      return { achievement: x.achievement };
    }),
  };
  const [mentee, _] = await Promise.all([
    Mentee.create(menteeObj),
    ApplicationRequest.findByIdAndDelete(applicationId),
  ]);
  res.status(200).json({
    status: true,
    message: "Mentee is Accepted successfully",
  });
});

module.exports.rejectApplicationRequest = catchAsync(async (req, res, next) => {
  const { applicationId, rejectionReason, rejectionExplanation } = req.body;
  // 1. Check if application exists
  const isApplicationExists = await ApplicationRequest.findOne({
    _id: applicationId,
    mentor: req.userId,
  }).populate("form");
  if (!isApplicationExists) {
    return res.status(200).json({
      status: false,
      message: "Application not found!",
    });
  }
  // 2. update application request
  isApplicationExists.applicationStatus = "rejected";
  if (rejectionReason) {
    isApplicationExists.rejectionReason = rejectionReason;
  } else if (rejectionExplanation) {
    isApplicationExists.rejectionExplanation = rejectionExplanation;
  }
  await isApplicationExists.save();

  res.status(200).json({
    status: true,
    message: "Mentee is rejected successfully",
  });
});

module.exports.topMatch = catchAsync(async (req, res, next) => {
  // logic:
  // find that the user has menteeapplication form filled out
  // if it is not present res.send cannot give response for non mentee accurately
  // if present than for searching mentors
  // 1. compare the forms expectations with mentors mentoring style
  // 2. mentee goals with mentors expertise
  try {
    // Check if the mentee has filled out a mentee application form
    const menteeApplication = await MenteeApplicationForm.findOne({
      mentee: req.userId,
    });

    if (!menteeApplication) {
      return res.status(400).json({
        status: false,
        message: "Mentee application form not found for this user.",
      });
    }

    // Extract expectations and goals from the mentee's application form
    const { expectations, goals } = menteeApplication;

    // by using $and in query the mentors are topmatches as they satisfy all conditions
    const matchingMentorsAnd = await User.find({
      "personalInfo.userType": "mentor",
      $and: [
        { "mentor.mentorshipStyle": { $elemMatch: { $in: expectations } } },
        { "mentor.expertise": { $elemMatch: { $in: goals } } },
      ],
    }).select("_id");

    // by using $or in query the we get suggested mentors who satisfy atleast one condition
    const matchingMentorsOr = await User.find({
      "personalInfo.userType": "mentor",
      $or: [
        { "mentor.mentorshipStyle": { $elemMatch: { $in: expectations } } },
        { "mentor.expertise": { $elemMatch: { $in: goals } } },
      ],
    }).select("_id");

    // Combine matching mentors from $and and $or conditions
    const allMatchingMentors = [...matchingMentorsAnd, ...matchingMentorsOr];

    // Ensure distinct mentors in the lists
    const distinctMentors = [
      ...new Set(allMatchingMentors.map((mentor) => mentor.toString())),
    ];

    // Split mentors into topMatch and suggestedMentors
    let topMatch = [];
    let suggestedMentors = [];
    if (distinctMentors.length > 0) {
      // Prioritize mentors from $and condition
      const andMentors = matchingMentorsAnd.map((mentor) => mentor.toString());

      for (const mentorId of andMentors) {
        if (distinctMentors.includes(mentorId)) {
          topMatch.push(mentorId);
          distinctMentors = distinctMentors.filter((id) => id !== mentorId);
        }
      }

      // Remaining mentors from $or condition
      suggestedMentors = distinctMentors;
    }
    // console.log(suggestedMentors);
    res.status(200).json({
      status: true,
      message: "Top mentor matches found for the mentee",
      data: {
        topMatch: topMatch,
        suggestedMentors: suggestedMentors,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "An error occurred while finding top mentor matches.",
    });
  }
});

module.exports.getPublicMentor = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findById({ _id: userId });
  const publicMentors = await User.find({
    "personalInfo.userType": "mentor",
    $or: [
      {
        "personalInfo.interests": {
          $elemMatch: { $in: user.personalInfo.interests },
        },
      },
      {
        "personalInfo.skills": {
          $in: user.personalInfo.skills,
        },
      },
    ],
  }).select("_id");

  publicMentors.forEach((mentor) => {
    console.log(mentor._id);
  });

  res.status(200).json({
    status: true,
    message: "Top mentor matches found for the mentee",
    data: {
      publicMentors,
    },
  });
});

module.exports.getMentorshipProgram = catchAsync(async (req, res, next) => {
  const { mentorId, menteeId } = req.body;
  const programDetails = await mentee.find({
    mentor: mentorId,
    mentee: menteeId,
  });
  res.json({ status: true, data: programDetails });
});

module.exports.editMentorshipProgram = catchAsync(async (req, res, next) => {
  const { mentorId, menteeId, isAgreementSigned, totalDays } = req.body;
  const program = await mentee.findOneAndUpdate({
    mentor: mentorId,
    mentee: menteeId,
  });
  program.totalDays = totalDays;
  program.isAgreementSigned = isAgreementSigned;
  res.json({
    status: true,
    message: "Program details updated",
    data: program,
    token: req.headers.authorization,
  });
});

module.exports.extendProgramDuration = catchAsync(async (req, res, next) => {
  // default extension by 15 days
  const { mentorId, days = 15 } = req.body;
  const programDetails = await mentee.findOneAndUpdate({
    mentor: mentorId,
    mentee: req.userId,
    extensionStatus: "pending",
  });
  programDetails.extensionDays = days;
  await programDetails.save();
  res.json({
    status: true,
    message: `Extension of ${days} days requested`,
    data: programDetails,
  });
});

module.exports.handleExtensionRequest = catchAsync(async (req, res, next) => {
  const { menteeId, isAccepted, modifyDays = null } = req.body;
  const programDetails = await mentee.findOneAndUpdate({
    mentor: req.userId,
    mentee: menteeId,
  });
  console.log(modifyDays);
  var request;
  if (isAccepted === "true") {
    programDetails.extensionStatus = "done";
    // if (modifyDays !== "null") programDetails.extensionDays = modifyDays;
    request = "accepted";
  } else {
    programDetails.extensionStatus = "declined";
    programDetails.extensionDays = 0;
    request = "rejected";
  }
  await programDetails.save();
  res.json({
    status: true,
    message: `Extension request ${request}`,
    data: programDetails,
  });
});

module.exports.sendFeedback = catchAsync(async (req, res, next) => {
  const clientData = req.body;
  const userId = req.userId;
  const dynamicReqBody = clientData;
  const formObj = {
    userId: userId,
    programId: dynamicReqBody.programId,
    communicationEffectiveness: {
      rating: dynamicReqBody.communicationEffectivenessRate,
      message: dynamicReqBody.communicationEffectivenessMessage,
    },
    supportLevel: {
      rating: dynamicReqBody.supportLevelRate,
      message: dynamicReqBody.supportLevelMessage,
    },
    knowledgeExchange: {
      rating: dynamicReqBody.knowledgeExchangeRate,
      message: dynamicReqBody.knowledgeExchangeMessage,
    },
    progressRate: {
      rating: dynamicReqBody.progressRate,
      message: dynamicReqBody.progressMessage,
    },
  };
  const feedbackForm = new mentorshipFeedback(formObj);
  await feedbackForm.save();
  // Now dynamicReqBody contains
  res.json({
    status: true,
    message: "Feedback submitted successfully",
    data: feedbackForm,
  });
});

module.exports.createTask = catchAsync(async (req, res, next) => {
  const { programId, name, description, assignedTo } = req.body;
  const taskObj = {
    name,
    description,
    assignedBy: req.userId,
    assignedTo,
  };
  const task = new Task(taskObj);
  await task.save();
  res.json({ status: true, message: "Task created successfully", data: task });
});

module.exports.updateTask = catchAsync(async (req, res, next) => {
  const { taskId, name, description, assignedTo } = req.body;
  const task = await Task.findOneAndUpdate(
    {
      _id: taskId,
    },
    { name, description, assignedBy: req.userId, assignedTo }
  );

  res.json({ status: true, message: "Task updated successfully", data: task });
});

module.exports.deleteTask = catchAsync(async (req, res, next) => {
  const { taskId } = req.body;
  const task = await Task.findOneAndDelete({
    _id: taskId,
  });
  res.json({ status: true, message: "Task deleted successfully" });
});

module.exports.updateTaskStatus = catchAsync(async (req, res, next) => {
  const { taskId, isCompleted } = req.body;
  const taskStatus = Boolean(isCompleted);
  const task = await Task.findOneAndUpdate(
    {
      _id: taskId,
    },
    {
      isCompleted: taskStatus,
    },
    { new: true }
  );
  res.json({
    status: true,
    message: "Task status updated successfully",
    data: task,
  });
});

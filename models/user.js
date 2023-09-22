const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");
const { generateInvitationCode } = require("../middleware/utils");
const InvitationCode = require("./invitationCode");
const Token = require("./token");

const userSchema = new Schema({
  personalInfo: {
    userType: {
      type: String,
      enum: ["user", "mentor", "institution"],
      default: "user",
    },
    email: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    pronouns: {
      type: String,
    },
    headline: {
      type: String,
    },
    profileImage: {
      fileName: String,
    },
    profileImageLink: {
      type: String,
    },
    language: [
      {
        type: Schema.Types.ObjectId,
        ref: "Language",
      },
    ],
    interests: [
      {
        type: Schema.Types.ObjectId,
        ref: "Interest",
      },
    ],
    skills: [
      {
        type: Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],
  },
  auth: {
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    generatedOtp: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  education: [
    {
      school: {
        type: Schema.Types.ObjectId,
        ref: "School",
      },
      major: {
        type: Schema.Types.ObjectId,
        ref: "Major",
      },
      startDate: {
        type: String,
        default: null,
      },
      endDate: {
        type: String,
        default: null,
      },
      image: {
        type: String,
      },
    },
  ],
  mentor: {
    jobTitle: {
      type: Schema.Types.ObjectId,
      ref: "JobTitle",
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    expertise: [
      {
        type: Schema.Types.ObjectId,
        ref: "Expertise",
      },
    ],
    mentorshipStyle: [
      {
        type: Schema.Types.ObjectId,
        ref: "MentorshipStyle",
      },
    ],
    availability: [
      {
        type: Schema.Types.ObjectId,
        ref: "Availability",
      },
    ],
    noOfMentees: {
      type: Number,
    },
    employmentType: {
      type: String,
      enum: [
        "fullTime",
        "partTime",
        "internship",
        "contract",
        "freelance",
        "temporary",
        "selfEmployed",
      ],
    },
    mentorTimeDuration: {
      type: Number,
    },
    isMentorVerified: {
      type: Boolean,
      default: false
    },
    mentorshipInstitution: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    }
  },
  institution: {
    creatorInfo: {
      jobTitle: {
        type: Schema.Types.ObjectId,
        ref: "JobTitle",
      },
      employeeId: {
        type: String,
      },
    },
    institution: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    // required: function () {
    //   return this.userType === "institution";
    // },
  },
  about: {
    type: String,
  },
  invitationCode: {
    type: Schema.Types.ObjectId,
    ref: "InvitationCode",
  },
  goals: {
    type: Schema.Types.ObjectId,
    ref: "Goal",
  },
  communityActivity: {
    type: Schema.Types.ObjectId,
    ref: "CommunityActivity",
  },
  experiences: [
    {
      type: Schema.Types.ObjectId,
      ref: "Experience",
    },
  ],
});

userSchema.pre(/^find/, function (next) {
  this.populate([
    "personalInfo.language",
    "personalInfo.interests",
    "personalInfo.skills",
    "education.school",
    "education.major",
    "mentor.jobTitle",
    "mentor.company",
    "mentor.expertise",
    "mentor.mentorshipStyle",
    "mentor.availability",
    "institution.creatorInfo.jobTitle",
    "institution.institution",
    "experiences",
    "goals",
    // "invitationCode",
  ]);
  next();
});

// pre hook for user to generate invitation code
userSchema.pre("save", async function (next) {
  try {
    // generating unique invitation code using UUID v4
    const invitationCode = generateInvitationCode();

    // saving invitation code
    const newInvitationCode = new InvitationCode({
      invitationCode: invitationCode,
      createdBy: this._id,
    });
    await newInvitationCode.save();
    this.invitationCode = newInvitationCode._id;

    next();
  } catch (err) {
    next(err);
  }
});

userSchema.plugin(passportLocalMongoose, {
  usernameField: "personalInfo.email",
});

const User = mongoose.model("User", userSchema);

module.exports = User;

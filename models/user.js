if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const memoryCache = require("memory-cache");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");
const { generateInvitationCode } = require("../middleware/utils");
const InvitationCode = require("./invitationCode");

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("node:crypto");

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
    currentMentees: {
      type: Number,
    },
    // required: function () {
    //   return this.userType === "mentor";
    // },
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
});
userSchema.plugin(passportLocalMongoose, {
  usernameField: "personalInfo.email",
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
    // "invitationCode",
  ]);
  next();
});

// Pre-save hook for institution user
userSchema.pre("save", async function (next) {
  try {
    // Generate a unique invitation code using UUID v4
    const invitationCode = generateInvitationCode();

    // Create a new InvitationCode instance and save it
    const newInvitationCode = new InvitationCode({
      invitationCode: invitationCode,
      createdBy: this._id,
    });
    await newInvitationCode.save();

    // Link the invitation code to the userSchema
    this.invitationCode = newInvitationCode._id;

    next(); // Continue with the save operation
  } catch (err) {
    next(err); // Pass the error to the next middleware
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;

const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");

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
  },
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
  mentors: {
    jobTitle: {
      type: Schema.Types.ObjectId,
      ref: "JobTitle",
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    expertise: {
      type: Schema.Types.ObjectId,
      ref: "Expertise",
    },
    mentorshipStyle: {
      type: Schema.Types.ObjectId,
      ref: "MentorshipStyle",
    },
    availability: {
      type: Schema.Types.ObjectId,
      ref: "Availability",
    },
    emplomentType: {
      type: Schema.Types.ObjectId,
      ref: "EmploymentType",
    },
    isMentorVerified: {
      type: Boolean,
      default: false,
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
    about: {
      type: String,
    },
    // required: function () {
    //   return this.userType === "institution";
    // },
  },
  invitationCode: {
    type: Schema.Types.ObjectId,
    ref: "InvitationCode",
  },
});
userSchema.plugin(passportLocalMongoose, {
  usernameField: "personalInfo.email",
});

module.exports = mongoose.model("User", userSchema);

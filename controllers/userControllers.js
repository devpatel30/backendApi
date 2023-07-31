if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const router = express.Router();

const passport = require("passport");
const sgMail = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("node:crypto");
const memoryCache = require("memory-cache");

const { User } = require("../models");
const Waitlist = require("../models/waitlist");
const InvitationCode = require("../models/invitationCode");

require("../config/appAuth");

// Function to generate JWT given a user object
function generateJWT(user) {
  const payload = {
    id: user._id,
    username: user.personalInfo.email,
  };

  return jwt.sign(payload, process.env.SESSION_SECRET, { expiresIn: "1w" }); // Token expires in 1 hour
}
module.exports.signUpUser = async (req, res, next) => {
  try {
    const { userType, email, password } = req.body;
    const username = email;
    const user = new User({
      personalInfo: { userType, email },
      username,
    });
    const regUser = await User.register(user, password);
    // Login the user
    const token = generateJWT(user);

    // Return the token in the response
    return res.status(200).json({
      status: true,
      message: "User successfully created and logged in",
      data: { ...regUser.toObject(), token: "Bearer " + token },
    });
  } catch (e) {
    res.status(500).send({ status: false, message: e.message, error: e });
  }
};

module.exports.loginUser = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      // err handling
      return res.status(500).json({
        status: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
    if (!user) {
      // authentication failed
      return res
        .status(200)
        .json({ status: false, message: "Invalid Credentials" });
    }

    // User authenticated successfully, generate JWT
    const token = generateJWT(user);

    // Return the token in the response
    return res.status(200).json({
      status: true,
      message: "User successfully logged in",
      data: { ...user.toObject(), token: "Bearer " + token },
    });
  })(req, res, next);
};

// Function to complete user profile
module.exports.completeUserProfile = async (req, res, next) => {
  try {
    const {
      userType = null,
      pronouns = null,
      interests = null,
      skills = null,
      language = null,
      firstName = null,
      lastName = null,
      major = null,
      school = null,
      startDate = null,
      endDate = null,
      recentJobTitle = null,
      recentCompany = null,
      expertise = null,
      mentorshipStyle = null,
      noOfMentees = null,
      employmentType = null,
      availability = null,
      employeeId = null,
      jobTitle = null,
      institution = null,
      about = null,
    } = req.body;

    const loggedInUserEmail = req.user.personalInfo.email;
    const user = await User.findOneAndUpdate(
      { "personalInfo.email": loggedInUserEmail },
      {
        $set: {
          "personalInfo.userType": userType,
          "personalInfo.pronouns": pronouns,
          "personalInfo.interests": interests,
          "personalInfo.skills": skills,
          "personalInfo.language": language,
          "personalInfo.firstName": firstName,
          "personalInfo.lastName": lastName,
          education: [
            {
              school: school,
              major: major,
              startDate: startDate,
              endDate: endDate,
            },
          ],
          mentor: {
            jobTitle: recentJobTitle,
            company: recentCompany,
            expertise: expertise,
            mentorshipStyle: mentorshipStyle,
            noOfMentees: noOfMentees,
            employmentType: employmentType,
            availability: availability,
          },
          institution: {
            creatorInfo: {
              jobTitle: jobTitle,
              employeeId: employeeId,
            },
            institution: institution,
          },
          about: about,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: "User profile completed successfully",
      data: { ...user.toObject(), token: req.headers.authorization },
    });
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: e.message,
      error: e,
    });
  }
};

// waitlist
module.exports.waitlistUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const emailExists = await Waitlist.findOne({ email });
    if (emailExists) {
      res
        .status(200)
        .json({ status: false, message: "User already in waitlist" });
    } else {
      const waitlist = new Waitlist({ email });
      await waitlist.save();
      res.status(200).json({
        status: true,
        message: "User added to waitlist",
        data: waitlist,
      });
    }
  } catch (e) {
    res.status(500).json({ status: false, message: e.message, error: e });
  }
};

module.exports.checkInvititationCode = async (req, res, next) => {
  try {
    const { invitationCode } = req.body;
    const codeExists = await InvitationCode.findOne({ invitationCode });
    if (codeExists) {
      res
        .status(200)
        .json({ status: true, message: "Valid invitation code", data: true });
    } else {
      res.status(200).json({
        status: false,
        message: "Invalid invitation code",
        data: false,
      });
    }
  } catch (e) {
    res.status(500).json({ status: false, message: e.message, error: e });
  }
};

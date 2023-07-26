if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const router = express.Router();

const passport = require("passport");
const sgMail = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");

const User = require("../models/user");
const Waitlist = require("../models/waitlist");

const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, createEmailMessage } = require("../middleware/utils");

// signup
router.post(
  "/signup",
  catchAsync(async (req, res, next) => {
    try {
      const { userType, email, password } = req.body;
      const username = email;
      const user = new User({
        personalInfo: { userType, email },
        username,
      });
      const regUser = await User.register(user, password);
      // Login the user
      req.login(regUser, async (err) => {
        if (err) {
          return next(err);
        }
        // console.log(req.body);
        // sign jwt token
        const token = jwt.sign(user.id, process.env.SESSION_SECRET);
        // Store the token in the session
        req.session.token = token;

        return res.status(200).json({
          status: true,
          message: "User created and logged in",
          data: { ...regUser.toObject(), token },
        });
      });
    } catch (e) {
      res.status(500).send({ status: false, message: e.message, error: e });
    }
  })
);
router.post(
  "/check-email",
  catchAsync(async (req, res, next) => {
    try {
      const { email } = req.body;
      if (email === "") {
        res.status(200).json({ status: false, message: "No email entered" });
        return;
      }
      const emailExists = await User.findOne({ "personalInfo.email": email });
      if (emailExists) {
        res
          .status(200)
          .json({ status: false, message: "Email already exists", data: true });
      } else {
        res.status(200).json({
          status: true,
          message: "User can register with this email",
          data: false,
        });
      }
    } catch (e) {
      res.status(500).json({ status: false, message: e.message, error: e });
    }
  })
);
// login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
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
    // authentication successful
    req.logIn(user, async (err) => {
      if (err) {
        // handle err
        return res.status(500).json({
          status: false,
          message: err.message,
          error: err,
        });
      }
      // User found
      // sign jwt token
      const token = jwt.sign(user.id, process.env.SESSION_SECRET);
      // Store the token in the session
      req.session.token = token;
      return res.status(200).json({
        status: true,
        message: "Login successful",
        data: { ...user.toObject(), token: token },
      });
    });
  })(req, res, next);
});

// logout
router.get("/logout", isLoggedIn, (req, res) => {
  const user = req.user.personalInfo.email;
  req.logout((err) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({
        status: true,
        message: `${user} user logged out`,
      });
    }
  });
});

router.post(
  "/send-email",
  catchAsync(async (req, res, next) => {
    try {
      const { contact, subject, text, html = "" } = req.body;
      // Sending email using sendGrid
      await sgMail.send(createEmailMessage(contact, subject, text, html));

      res.status(200).json({ message: "Email sent successfully" });
    } catch (e) {
      res.status(500).json({ message: "failed to send email", error: e });
    }
  })
);

// Function to complete user profile
const completeUserProfile = async (req, res, next) => {
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

    const loggedInUserEmail = req.session.passport.user;
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
      data: { ...user.toObject(), token: req.session.token },
    });
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: e.message,
      error: e,
    });
  }
};
router.post("/complete-profile", isLoggedIn, completeUserProfile);

router.post("/update-profile/:userId", isLoggedIn, completeUserProfile);

// waitlist people with no invitation code
router.post(
  "/waitlist",
  catchAsync(async (req, res, next) => {
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
  })
);
module.exports = router;

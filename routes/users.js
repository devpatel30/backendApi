if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const router = express.Router();

const passport = require("passport");
const sgMail = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

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
      res
        .status(200)
        .send({ status: true, message: "User created", data: regUser });
    } catch (e) {
      res
        .status(500)
        .send({ status: false, message: "Server error", error: e.message });
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
        .status(401)
        .json({ status: false, message: "Invalid Credentials" });
    }
    // authentication successful
    req.logIn(user, (err) => {
      if (err) {
        // handle err
        return res.status(500).json({
          status: false,
          message: "Internal Server Error",
          error: err.message,
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
        data: { user, token: req.session.token },
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

// router.post(
//   "/complete-profile",
//   isLoggedIn,
//   catchAsync(async (req, res, next) => {
//     const data = req.body;
//     console.log(data);
//     const loggedInUserEmail = req.session.passport.user;
//     const user = await User.findOne({
//       "personalInfo.email": loggedInUserEmail,
//     });
//     user.majorId = data.majorId;
//     user.schoolId = data.schoolId;

//     consol.log(user);
//     if (data.userType === "mentor") {
//       console.log("institution");
//     }
//     res.send(data);
//   })
// );

// Function to complete user profile
const completeUserProfile = async (req, res, next) => {
  try {
    const {
      userType = null,
      majorId = null,
      schoolId = null,
      startDate = null,
      endDate = null,
      pronouns = null,
      interests = null,
      skills = null,
      languageId = null,
      recentJobTitleId = null,
      recentCompanyId = null,
      areasOfExpertise = null,
      mentorshipStyles = null,
      noOfMentees = null,
      employmentTypeId = null,
      availability = null,
      jobTitle = null,
      employeeId = null,
      institutionId = null,
      institutionAbout = null,
    } = req.body;

    // Your logic for saving the profile details into the database
    const loggedInUserEmail = req.session.passport.user;

    // Example:
    const user = await User.findOneAndUpdate(
      { "personalInfo.email": loggedInUserEmail },
      {
        $set: {
          "personalInfo.userType": userType,
          "personalInfo.pronouns": pronouns,
          "personalInfo.interests": interests,
          "personalInfo.languages": languageId,
          "personalInfo.skills": skills,
          "education.major": majorId,
          "education.school": schoolId,
          "education.startDate": startDate,
          "education.endDate": endDate,
          "mentor.jobTitle": recentJobTitleId,
          "mentor.company": recentCompanyId,
          "mentor.expertise": areasOfExpertise,
          "mentor.mentorshipStyle": mentorshipStyles,
          "mentor.noOfMentees": noOfMentees,
          "mentor.employmentType": employmentTypeId,
          "mentor.availability": availability,
          "institution.creatorInfo.jobTitle": jobTitle,
          "institution.creatorInfo.employeeId": employeeId,
          "institution.institution": institutionId,
          "institution.about": institutionAbout,
        },
      },
      { new: true }
    );
    const updatedUser = await User.findOne({
      "personalInfo.email": loggedInUserEmail,
    });

    // user.personalInfo.userType = userType;
    // console.log(user);
    // await user.save();

    // Your code to create UserResource and return it in the response
    // const userResource = createResource(user);

    return res.status(200).json({
      status: true,
      message: "User profile completed successfully",
      data: updatedUser,
    });
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: e.message,
    });
  }
};
router.post("/complete-profile", isLoggedIn, completeUserProfile);

// // Function to update user profile
// const updateUserProfile = async (req, res, next) => {
//   try {
//     const { userId } = req.params; // Assuming the user ID is passed as a parameter
//     const userDataToUpdate = req.body; // Assuming you pass the updated user data in the request body

//     // Find the user by their ID
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         status: false,
//         message: "User not found",
//       });
//     }

//     // Update the user data with the new data
//     // For example, if user data is a plain object, you can use Object.assign:
//     Object.assign(user, userDataToUpdate);

//     // Save the updated user document
//     await user.save();

//     return res.status(200).json({
//       status: true,
//       message: "User profile updated successfully",
//       data: user, // Optionally, you can return the updated user data in the response
//     });
//   } catch (e) {
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: e.message,
//     });
//   }
// };

// router.post("/update_profile/:userId", isLoggedIn, updateUserProfile);
module.exports = router;

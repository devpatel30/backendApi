if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const router = express.Router();

const User = require("../models/user");

const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, generateOtp } = require("../middleware/utils");
const { saveAndSendOtp, verifyOTP } = require("../controllers/authControllers");

// forgot password takes user contact info then generaates the otp or user and sends it to the contact
router.post("/forgot-password", generateOtp, catchAsync(saveAndSendOtp));

// verify otp
router.post("/verify-otp", verifyOTP);

router.post(
  "/verify-email",
  isLoggedIn,
  generateOtp,
  catchAsync(saveAndSendOtp)
);

router.post("/verify-email-otp", verifyOTP);

router.get("/user", (req, res) => {
  if (!req.session.passport) {
    res.status(404).json({
      status: false,
      message: "user must be logged in for getting user data",
    });
  } else {
    res.status(200).json({ status: true, message: req.session.passport });
  }
});

// reset password
router.post(
  "/reset-password",
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ "personalInfo.email": email });
    if (user.auth.generatedOtp === false) {
      return res.status(400).json({
        status: false,
        message: "Password reset not possible without otp verification",
      });
    }
    // Update the user's password
    user.setPassword(password, () => {
      user.auth.generatedOtp = false;
      user.save();
      // Password reset successful
      res
        .status(200)
        .json({ status: true, message: "Password reset successful" });
    });
  })
);

router.post(
  "/edit-password",
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findOne({
      "personalInfo.email": req.session.passport.user,
    });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Check if the current password matches
    const isMatch = await user.authenticate(currentPassword);
    if (!isMatch.user) {
      return res.status(401).json({
        status: false,
        message: "Current password is incorrect",
        error: isMatch.error,
      });
    }
    // do not update if new and current password are same
    if (newPassword === currentPassword) {
      return res.status(401).json({
        status: false,
        message: "New password is same as current password",
      });
    }
    // Update the user's password
    user.setPassword(newPassword, async () => {
      try {
        // Save the updated user document
        await user.save();

        // Password update successful
        res.status(200).json({ message: "Password updated successfully" });
      } catch (e) {
        // Handle any errors that occur during saving
        res.status(500).json({ message: "Internal server error", error: e });
      }
    });
  })
);
module.exports = router;

const express = require("express");
const router = express.Router();

// const { User } = require("../models");

const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, generateOtp } = require("../middleware/utils");
const {
  saveAndSendOtp,
  verifyOTP,
  resetPassword,
  editPassword,
} = require("../controllers/authControllers");

// forgot password takes user contact info then generaates the otp or user and sends it to the contact
router.post("/forgot-password", generateOtp, catchAsync(saveAndSendOtp));

// verify otp
router.post("/verify-otp", verifyOTP);

router.get(
  "/verify-email",
  isLoggedIn,
  generateOtp,
  catchAsync(saveAndSendOtp)
);

router.post("/verify-email-otp", verifyOTP);

// reset password
router.post("/reset-password", catchAsync(resetPassword));

router.post("/edit-password", isLoggedIn, catchAsync(editPassword));
module.exports = router;

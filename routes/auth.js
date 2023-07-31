if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const router = express.Router();

const { User } = require("../models");

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
router.post("/reset-password", catchAsync(resetPassword));

router.post("/edit-password", isLoggedIn, catchAsync(editPassword));
module.exports = router;

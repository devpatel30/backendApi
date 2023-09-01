if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const router = express.Router();

const passport = require("passport");
const sgMail = require("@sendgrid/mail");
const multer = require("multer");

const catchAsync = require("../utils/catchAsync");
const {
  createEmailMessage,
  isLoggedIn,
  findAndDeleteTokenByUserId,
} = require("../middleware/utils");

const {
  signUpUser,
  loginUser,
  waitlistUser,
  checkInvititationCode,
  completeUserProfile,
  uploadImage,
  getImageLink,
  emailExists,
  logoutUser,
  googleAuth,
  fetchUserProfile
} = require("../controllers/userControllers");

require("../config/appAuth");

// signup
router.post("/signup", catchAsync(signUpUser));
router.post("/check-email", catchAsync(emailExists));

// login
router.post("/login", loginUser);

// google auth
router.post("/google-auth", catchAsync(googleAuth))

const tokenBlacklist = new Set();
// logout
router.get("/logout", isLoggedIn, catchAsync(logoutUser));

// Middleware to check if a token is blacklisted
function isTokenBlacklisted(req, res, next) {
  if (tokenBlacklist.has(req.headers.authorization)) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized - Token is blacklisted",
    });
  }
  next();
}
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

router.post(
  "/complete-profile",
  passport.authenticate("jwt", { session: false }),
  isTokenBlacklisted,
  completeUserProfile
);

router.post(
  "/update-profile/:userId",
  passport.authenticate("jwt", { session: false }),
  completeUserProfile
);

// waitlist people with no invitation code
router.post("/waitlist", catchAsync(waitlistUser));

// check invitation code
router.post("/check-invitation-code", catchAsync(checkInvititationCode));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// upload profile image
router.post(
  "/profile-image",
  passport.authenticate("jwt", { session: false }),
  upload.single("image"),
  catchAsync(uploadImage)
);

// get profile image link
router.get(
  "/profile-image",
  passport.authenticate("jwt", { session: false }),
  catchAsync(getImageLink)
);

// User profile
router.get('/userProfile', isLoggedIn, fetchUserProfile)

module.exports = router;

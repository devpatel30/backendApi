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

const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, createEmailMessage } = require("../middleware/utils");

const {
  signUpUser,
  loginUser,
  waitlistUser,
  checkInvititationCode,
  completeUserProfile,
  uploadImage,
  getImageLink,
} = require("../controllers/userControllers");
require("../config/appAuth");

// signup
router.post("/signup", catchAsync(signUpUser));
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
router.post("/login", loginUser);

const tokenBlacklist = new Set();
// logout
router.get(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const user = req.user.personalInfo.email;
    tokenBlacklist.add(req.headers.authorization);
    res.status(200).send({
      status: true,
      message: `${user} user logged out`,
    });
  }
);

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

router.post("/update-profile/:userId", isLoggedIn, completeUserProfile);

// waitlist people with no invitation code
router.post("/waitlist", catchAsync(waitlistUser));

// check invitation code
router.post("/check-invitation-code", catchAsync(checkInvititationCode));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const s3BucketName = process.env.S3BUCKET_NAME;
const s3BucketRegion = process.env.S3BUCKET_REGION;
const s3AccessKey = process.env.S3_ACCESS_KEY;
const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: s3AccessKey,
    secretAccessKey: s3SecretAccessKey,
  },
  region: s3BucketRegion,
});
router.post(
  "/profile-image",
  passport.authenticate("jwt", { session: false }),
  upload.single("image"),
  catchAsync(uploadImage)
);
router.get(
  "/profile-image",
  passport.authenticate("jwt", { session: false }),
  catchAsync(getImageLink)
);
module.exports = router;

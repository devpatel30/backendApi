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
  catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    console.log(req.body);
    console.log(req.file);
    const imageName = randomImageName();
    const params = {
      Bucket: s3BucketName,
      Key: imageName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);

    const user = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          "personalInfo.profileImage": {
            fileName: imageName,
          },
        },
      },
      { new: true }
    );
    const generatedUrl = memoryCache.get("generatedUrl");
    console.log(generatedUrl);
    if (generatedUrl) {
      res.status(200).json({
        status: true,
        message:
          "Successfully uploaded image and link to access the image is provided",
        data: { user, generatedUrl },
      });
    } else {
      res.status(200).json({
        status: true,
        message: "Successfully uploaded image",
        data: { user },
      });
    }
  })
);
router.get(
  "/profile-image",
  passport.authenticate("jwt", { session: false }),
  catchAsync(async (req, res, next) => {
    try {
      const userId = req.contact;
      const user = await User.findOne({ "personalInfo.email": userId });
      const getObjectParams = {
        Bucket: s3BucketName,
        Key: user.personalInfo.profileImage.fileName,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      res.status(200).json({
        status: true,
        message: "Access link to image made valid for 3600s",
        data: url,
      });
    } catch (e) {
      res.status(500).json({ status: false, message: e.message, error: e });
    }
  })
);
module.exports = router;

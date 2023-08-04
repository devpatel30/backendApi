const express = require("express");
const router = express.Router();

const passport = require("passport");
const multer = require("multer");
const {
  updateProfileImage,
  editProfile,
} = require("../controllers/profileControllers");

// const {} = require("../controllers/");
const { isLoggedIn } = require("../middleware/utils");
const catchAsync = require("../utils/catchAsync");

router.get("/", (req, res) => {
  res.send("profiles");
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.patch(
  "/profile-image",
  isLoggedIn,
  upload.single("image"),
  catchAsync(updateProfileImage)
);

router.patch("/edit-profile", isLoggedIn, catchAsync(editProfile));
module.exports = router;

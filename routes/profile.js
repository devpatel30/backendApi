const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { User } = require("../models");

const passport = require("passport");
const multer = require("multer");
const {
  updateProfileImage,
  editProfile,
  removeUserItemHandler,
  excludedKeys,
  customKeys,
} = require("../controllers/profileControllers");

// const {} = require("../controllers/");
const { isLoggedIn } = require("../middleware/utils");
const catchAsync = require("../utils/catchAsync");

router.get("/", (req, res) => {
  res.send("profiles");
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// edit profile image
router.patch(
  "/profile-image",
  isLoggedIn,
  upload.single("image"),
  catchAsync(updateProfileImage)
);

// edit profile personal info with interest, skills and languages
router.patch("/edit-profile", isLoggedIn, catchAsync(editProfile));

const getAllKeysForSchema = (schema) => {
  const keys = Object.keys(schema.paths);
  return keys;
};

// array of user model keys
const userKeys = getAllKeysForSchema(User.schema);
const keys = [...userKeys];

// Function to generate routes for adding data to a given model
const generatePatchRoutesForUser = (key, routePath) => {
  if (excludedKeys.includes(key)) {
    // console.log(`Route generation skipped for key: ${key}`);
    return;
  }

  router.patch(
    routePath,
    isLoggedIn,
    catchAsync(async (req, res, next) => {
      const { id } = req.body;
      const userId = req.userId;
      const result = await removeUserItemHandler(key, id, userId);
      res.status(result.status ? 200 : 500).send(result);
    })
  );
};

// Generate routes for removing data for custom keys
customKeys.forEach(({ key, routePath }) => {
  generatePatchRoutesForUser(key, `/${routePath}`);
});

// Generate routes for removing data for all keys except the excluded ones
keys.forEach((key) => {
  // Skip if the key is already included in customKeys
  if (!customKeys.some((customKey) => customKey.key === key)) {
    generatePatchRoutesForUser(
      key,
      `/${key.toLowerCase().replace(/\./g, "-")}`
    );
  }
});

module.exports = router;

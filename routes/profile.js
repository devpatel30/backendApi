const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { User, Portfolio } = require("../models");
const passport = require("passport");
const multer = require("multer");

const {
  updateProfileImage,
  editProfile,
  removeUserItemHandler,
  excludedKeys,
  customKeys,
  addPortfolio,
  fetchAllPortfolios,
  fetchRecentPortfolios,
  editPortfolio,
  deletePortfolio,
} = require("../controllers/profileControllers");

const { isLoggedIn } = require("../middleware/utils");
const catchAsync = require("../utils/catchAsync");
const { removeNullProperties } = require("../utils/nullKeysChecker");

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

// Function to generate routes for removing data the user
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

router.post(
  "/add-portfolio/:id",
  isLoggedIn,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 3 },
  ]),
  catchAsync(addPortfolio)
);

router.get("/fetch-recent-portfolios/:id", catchAsync(fetchRecentPortfolios));

router.get("/fetch-all-portfolios/:id", catchAsync(fetchAllPortfolios));

router.post(
  "/edit-portfolio",
  isLoggedIn,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 3 },
  ]),
  catchAsync(editPortfolio)
);

router.delete("/delete-portfolio", isLoggedIn, catchAsync(deletePortfolio));

router.post(
  "/education/add-school",
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    try {
      const userId = req.userId;
      const { schoolId, majorId, startDate, endDate } = req.body;
      const updateObj = {
        school: schoolId,
        major: majorId,
        startDate: startDate,
        endDate: endDate,
      };
      const user = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { education: updateObj } },
        { new: true }
      );
      return res.status(200).json({
        status: true,
        message: "School added to user",
        data: { ...user.toObject(), token: req.headers.authorization },
      });
    } catch (e) {
      return res
        .status(500)
        .json({ status: false, message: e.message, error: e });
    }
  })
);

router.patch(
  "/education/edit-school",
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    try {
      const {
        educationId,
        schoolId,
        majorId = null,
        startDate,
        endDate,
      } = req.body;
      const userId = req.userId;
      // Create an object with the provided school data
      const updateObj = {
        school: schoolId,
        major: majorId,
        startDate: startDate,
        endDate: endDate,
      };
      removeNullProperties(updateObj);
      // Find the user by ID and update the matching education object
      const user = await User.findOneAndUpdate(
        { _id: userId, "education._id": educationId },
        { $set: { "education.$": updateObj } },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User or education not found",
        });
      }
      return res.status(200).json({
        status: true,
        message: "School edited successfully",
        data: { ...user.toObject(), token: req.headers.authorization },
      });
    } catch (e) {
      return res
        .status(500)
        .json({ status: false, message: e.message, error: e });
    }
  })
);

router.delete(
  "/education/delete-school",
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    try {
      const userId = req.userId;
      const { educationId } = req.body;

      // Find the user by ID
      const user = await User.findById({ _id: userId });

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      // Find the index of the school to be deleted
      const schoolIndex = user.education.findIndex(
        (school) => school._id.toString() === educationId
      );

      if (schoolIndex === -1) {
        return res.status(404).json({
          status: false,
          message: "School not found",
        });
      }

      // Remove the school from the education array
      user.education.splice(schoolIndex, 1);

      // saving the updated user
      await user.save();

      res.status(200).json({
        status: true,
        message: "School deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "An error occurred while deleting the school",
        error: error.message,
      });
    }
  })
);

router.get(
  "/education/fetch-schools/:id",
  catchAsync(async (req, res, next) => {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      // Extract the education array from the user object
      const schools = user.education;

      res.status(200).json({
        status: true,
        message: "User schools fetched successfully",
        data: schools,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "An error occurred while fetching user schools",
        error: error.message,
      });
    }
  })
);

module.exports = router;

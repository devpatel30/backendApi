const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { User, Experience } = require("../models");
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
  addSchool,
  editSchool,
  deleteSchool,
  fetchSchools,
  addExperience,
  editExperience,
  deleteExperience,
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

router.post("/education/add-school", isLoggedIn, catchAsync(addSchool));

router.patch("/education/edit-school", isLoggedIn, catchAsync(editSchool));

router.delete("/education/delete-school", isLoggedIn, catchAsync(deleteSchool));

router.get("/education/fetch-schools/:id", catchAsync(fetchSchools));

router.post("/add-experience", isLoggedIn, catchAsync(addExperience));

router.patch("/edit-experience", isLoggedIn, catchAsync(editExperience));

router.delete("/delete-experience", isLoggedIn, catchAsync(deleteExperience));

router.post(
  "/update-goals",
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    try {
      const userId = req.userId;
      const { careerGoals, skillGoals, financialGoals, socialGoals } = req.body;

      // Find and update the user's goals
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            careerGoals,
            skillGoals,
            financialGoals,
            socialGoals,
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        status: true,
        message: "Goals updated successfully",
        data: goal,
      });
    } catch (e) {
      res.status(500).json({
        status: false,
        message: e.message,
        error: e,
      });
    }
  })
);
module.exports = router;

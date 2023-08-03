const express = require("express");
const router = express.Router();

const passport = require("passport");

// const {} = require("../controllers/");
const { isLoggedIn } = require("../middleware/utils");

router.get("/", (req, res) => {
  res.send("profiles");
});
router.patch("/profile-image", isLoggedIn, (req, res, next) => {
  console.log(req.userId);
});

module.exports = router;

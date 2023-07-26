if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const router = express.Router();

const passport = require("passport");
const sgMail = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Waitlist = require("../models/waitlist");

const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, createEmailMessage } = require("../middleware/utils");

module.exports.signUpUser = async (req, res, next) => {
  try {
    const { userType, email, password } = req.body;
    const username = email;
    const user = new User({
      personalInfo: { userType, email },
      username,
    });
    const regUser = await User.register(user, password);
    // Login the user
    req.login(regUser, async (err) => {
      if (err) {
        return next(err);
      }
      // console.log(req.body);
      // sign jwt token
      const token = jwt.sign(user.id, process.env.SESSION_SECRET);
      // Store the token in the session
      req.session.token = token;
      const sessionId = req.sessionID;
      return res.status(200).json({
        status: true,
        message: "User created and logged in",
        data: { ...regUser.toObject(), token, sessionId },
      });
    });
  } catch (e) {
    res.status(500).send({ status: false, message: e.message, error: e });
  }
};

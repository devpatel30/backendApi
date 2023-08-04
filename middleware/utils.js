if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// const Otp = require("../models/otp");
const crypto = require("node:crypto");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const Token = require("../models/token");

// Middleware to check if user is logged in
module.exports.isLoggedIn = async (req, res, next) => {
  try {
    // get accesstoken from headers of req
    const accessToken = req.headers.authorization.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({
        status: false,
        message: "Access token not provided.",
      });
    }

    // Verify the access token
    const decodedToken = jwt.verify(accessToken, process.env.SESSION_SECRET);
    // Check if the token exists in the database
    const tokenExists = await Token.exists({ accessToken: accessToken });

    if (!tokenExists) {
      return res.status(401).json({
        status: false,
        message: "Invalid access token or user is not logged in",
      });
    }

    // Set the user ID from the decoded token on the request object
    req.userId = decodedToken.id;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Authentication failed.",
      error: error.message,
    });
  }
};

module.exports.createEmailMessage = (toEmail, subject, text, html) => {
  const message = {
    to: toEmail,
    from: { name: "MiNextStep Support", email: "support@minextstep.com" },
    subject: subject,
    text: text,
    html: html,
  };

  return message;
};

module.exports.generateOtp = async (req, res, next) => {
  try {
    // secret for otp
    const secret = crypto.randomBytes(20).toString("hex");

    // generating and hashing otp with sha1 alogrithm
    const hotp = crypto
      .createHmac("sha256", secret)
      .update("otp")
      .digest("hex");
    const otp = (parseInt(hotp, 16) % 10000).toString().padStart(6, "0");

    // Attach the generated OTP to the request object for further processing
    req.generatedOtp = { secret, hotp, otp };

    next();
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Failed to generate OTP",
      error: error.message,
    });
  }
};

// Function to generate a unique invitation code using UUID v4
module.exports.generateInvitationCode = () => {
  const invitationCode = uuidv4().replace(/-/g, "").substring(0, 8);
  return invitationCode;
};

// Function to find the token by userId and delete it
module.exports.findAndDeleteTokenByUserId = async (userId) => {
  try {
    // Find the token by userId and delete it
    const deletedToken = await Token.findOneAndDelete({ userId });

    if (!deletedToken) {
      // If no token was found for the given userId
      return res.status(200).json({
        status: false,
        message: "Token not found or already deleted by token expiration",
      });
    }

    return deletedToken;
  } catch (e) {
    console.error("Error while deleting the token:", e);
    return res
      .status(500)
      .json({ status: false, message: e.message, error: e });
  }
};

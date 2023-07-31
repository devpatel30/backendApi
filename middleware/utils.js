const Otp = require("../models/otp");
const crypto = require("node:crypto");
const { v4: uuidv4 } = require("uuid");
// require("../config/appAuth");

module.exports.isLoggedIn = (req, res, next) => {
  // passport.authenticate("jwt", { session: false }, (err, user) => {
  //   if (err || !user) {
  //     return res.status(401).json({
  //       status: false,
  //       message: "Unauthorized",
  //     });
  //   }
  //   req.user = user; // Attach the authenticated user to the request object
  //   return next();
  // })(req, res, next);
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

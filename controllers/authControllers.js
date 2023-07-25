if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const sgMail = require("@sendgrid/mail");

const User = require("../models/user");
const Otp = require("../models/otp");

const { createEmailMessage } = require("../middleware/utils");

const crypto = require("node:crypto");

// integrating sendgrid for sending emails
sgMail.setApiKey(process.env.SENDGRID_API);
// saves generatedOtp and send it to user via email or phone
module.exports.saveAndSendOtp = async (req, res, next) => {
  try {
    const { generatedOtp } = req;
    var contact, contactType;
    //  assign values such that if req.body is empty object "{}" values
    //  are taken from session and the other case it is taken from req.body
    //  if it is not empty
    if (Object.keys(req.body).length === 0) {
      // takes value from session of user logged in
      if (req.session.passport) {
        contact = req.session.passport.user;
        contactType = "email";
      }
    } else {
      contact = req.body.contact;
      contactType = req.body.contactType;
    }
    // save generated otp with its secret
    const regOtp = new Otp({
      receiverContact: contact,
      contactType,
      otp: generatedOtp.hotp,
      secret: generatedOtp.secret,
    });
    await regOtp.save();

    const user = await User.findOneAndUpdate(
      { "personalInfo.email": contact },
      { $set: { "auth.generatedOtp": true } },
      { new: true }
    );
    // if (!user) {
    //   res
    //     .status(200)
    //     .json({
    //       status: false,
    //       message: `User with ${contact} does not exist`,
    //     });
    // }
    // console.log(user);

    // Email body for OTP
    const subject = "Email verification OTP";
    const text = `Your otp is ${generatedOtp.otp}`;
    const html = `<p>Hi, <br> Your OTP email verification is <strong>${generatedOtp.otp}</strong></p>`;
    const emailMessage = createEmailMessage(contact, subject, text, html);
    await sgMail.send(emailMessage);
    console.log(generatedOtp.otp);
    return res
      .status(200)
      .json({ status: true, message: "Email verification sent" });
  } catch (e) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error", err: e.message });
  }
};

module.exports.verifyOTP = async (req, res) => {
  try {
    const { userOtp, contact } = req.body;
    const otp = await Otp.findOne({ receiverContact: contact })
      .sort({ createdAt: -1 })
      .limit(1);
    const user = await User.findOne({
      "personalInfo.email": contact,
      "auth.generatedOtp": true,
    });
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "User did not requested the otp" });
    }
    if (!otp) {
      return res.send("User did not generate OTP");
    }
    otp.otp = crypto
      .createHmac("sha256", otp.secret)
      .update("otp")
      .digest("hex");
    const expectedOtp = (parseInt(otp.otp, 16) % 10000)
      .toString()
      .padStart(6, "0");
    if (userOtp === expectedOtp) {
      if (req.url === "/verify-email-otp") {
        user.auth.generatedOtp = false;
        user.auth.isEmailVerified = true;
      }
      if (req.url === "/verify-phone-otp") {
        user.auth.generatedOtp = false;
        user.auth.isPhoneVerified = true;
      }
      await user.save();
      return res
        .status(200)
        .json({ status: true, message: "OTP is valid", data: user });
    } else {
      return res
        .status(400)
        .json({ status: false, message: "OTP is not valid" });
    }
  } catch (e) {
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: e.message,
    });
  }
};

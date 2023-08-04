const { uploadImageToS3 } = require("../utils/imageUpload");
const { User } = require("../models");
const { removeNullProperties } = require("../utils/nullKeysChecker");

module.exports.updateProfileImage = async (req, res, next) => {
  try {
    const model = User; // The model where the image data should be stored

    // associated user with the image
    const objectId = req.userId;
    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    // image filename stored at imageFieldName
    const imageFieldName = "personalInfo.profileImage";
    // imagelink stored at imageLinkFieldName
    const imageLinkFieldName = "personalInfo.profileImageLink";

    const imageUrl = await uploadImageToS3(
      model,
      objectId,
      fileBuffer,
      mimeType,
      imageFieldName,
      imageLinkFieldName
    );

    res.status(200).json({
      status: true,
      message: "Successfully uploaded image",
      data: { imageUrl: imageUrl, token: req.headers.authorization },
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to upload image", error: error });
  }
};

module.exports.editProfile = async (req, res, next) => {
  try {
    const {
      firstName = null,
      lastName = null,
      pronouns = null,
      headline = null,
      about = null,
      skills = null,
      interests = null,
      language = null,
    } = req.body;
    const updateObj = {
      "personalInfo.firstName": firstName,
      "personalInfo.lastName": lastName,
      "personalInfo.pronouns": pronouns,
      "personalInfo.headline": headline,
      "personalInfo.skills": skills,
      "personalInfo.interests": interests,
      "personalInfo.language": language,
      about: about,
    };
    removeNullProperties(updateObj);
    const user = await User.findOneAndUpdate(
      { _id: req.userId },
      { $set: updateObj },
      { new: true }
    );
    return res.status(200).json({
      status: true,
      message: "User update completed successfully",
      data: { ...user.toObject(), token: req.headers.authorization },
    });
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: e.message,
      error: e,
    });
  }
};

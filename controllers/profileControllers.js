const { uploadImageToS3 } = require("../utils/imageUpload");
const { removeNullProperties } = require("../utils/nullKeysChecker");
const { User } = require("../models");

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

// Controller function to remove an item (interest, skill, or language) from the user
const removeUserItem = async (userId, id, updateItem) => {
  try {
    // Find the user by ID and remove the specified item
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { [updateItem]: id } },
      { new: true }
    );

    if (!user) {
      // If the user is not found, return an error
      return {
        status: false,
        message: "User not found",
      };
    }

    return {
      status: true,
      message: `${updateItem} removed successfully`,
      data: user,
    };
  } catch (error) {
    return {
      status: false,
      message: `Failed to remove ${updateItem}`,
      error: error.message,
    };
  }
};

// Generic function to remove an item from the user
module.exports.removeUserItemHandler = async (key, id, userId) => {
  try {
    const updateItem = key;
    const result = await removeUserItem(userId, id, updateItem);
    return result;
  } catch (e) {
    return { status: false, message: e.message, error: e };
  }
};
module.exports.excludedKeys = [
  "personalInfo.userType",
  "personalInfo.email",
  "personalInfo.firstName",
  "personalInfo.lastName",
  "personalInfo.pronouns",
  "personalInfo.headline",
  "personalInfo.profileImage.fileName",
  "personalInfo.profileImageLink",
  "auth.isEmailVerified",
  "auth.isPhoneVerified",
  "auth.generatedOtp",
  "auth.isVerified",
  "auth.isProfileCompleted",
  "education",
  "mentor.noOfMentees",
  "mentor.mentorTimeDuration",
  "mentor.currentMentees",
  "institution.creatorInfo.jobTitle",
  "institution.creatorInfo.employeeId",
  "invitationCode",
  "_id",
  "hash",
  "salt",
  "__v",
];

// array of key-routePath pairs for customization
module.exports.customKeys = [
  { key: "personalInfo.language", routePath: "remove-language" },
  { key: "personalInfo.skills", routePath: "remove-skill" },
  { key: "personalInfo.interests", routePath: "remove-interest" },
  { key: "mentor.expertise", routePath: "remove-expertise" },
  { key: "mentor.mentorshipstyle", routePath: "remove-mentorshipstyle" },
  { key: "mentor.jobtitle", routePath: "remove-jobtitle" },

  //   { key: "institution-institution", routePath: "remove-institution" },
];

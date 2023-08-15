const { uploadImageToS3 } = require("../utils/mediaHandler");
const { removeNullProperties } = require("../utils/nullKeysChecker");
const { User, Portfolio, Media, Experience, Goal } = require("../models");
const e = require("express");

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
      .json({ status: false, message: error.message, error: error });
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

module.exports.addPortfolio = async (req, res, next) => {
  const { title, description, link } = req.body;
  const thumbnail = req.files["thumbnail"];
  const imageFiles = req.files["images"];
  const userId = req.userId;

  const thumbnailData = thumbnail;
  const thumbnailIds = [];

  const imagesIds = [];
  const imagesData = imageFiles;

  // upload to images and saves media and then fill array with media Ids
  const mediaHandler = async (mediaType, mediaIds) => {
    if (Array.isArray(mediaType) && mediaType.length > 0) {
      for (const mediaObj of mediaType) {
        const media = new Media();
        await media.save();
        const img = await uploadImageToS3(
          Media,
          media._id,
          mediaObj.buffer,
          mediaObj.mimeType,
          "field",
          "url"
        );
        mediaIds.push(media._id);
      }
    }
  };

  await mediaHandler(thumbnailData, thumbnailIds);
  await mediaHandler(imagesData, imagesIds);

  const portfolio = new Portfolio({
    name: title,
    description,
    link,
    thumbnail: thumbnailIds,
    images: imagesIds,
    createdBy: userId,
  });
  await portfolio.save();

  res.status(200).json({
    status: true,
    message: "Successfully added portfolio",
    data: portfolio,
  });
};

module.exports.editPortfolio = async (req, res, next) => {
  const { id, title, description, link } = req.body;
  const thumbnail = req.files["thumbnail"];
  const imageFiles = req.files["images"];
  const userId = req.userId;

  const thumbnailData = thumbnail;
  const thumbnailIds = [];

  const imagesIds = [];
  const imagesData = imageFiles;

  // upload to images and saves media and then fill array with media Ids
  const mediaHandler = async (mediaType, mediaIds) => {
    if (Array.isArray(mediaType) && mediaType.length > 0) {
      for (const mediaObj of mediaType) {
        const media = new Media();
        await media.save();
        const img = await uploadImageToS3(
          Media,
          media._id,
          mediaObj.buffer,
          mediaObj.mimeType,
          "field",
          "url"
        );
        mediaIds.push(media._id);
      }
    }
  };

  await mediaHandler(thumbnailData, thumbnailIds);
  await mediaHandler(imagesData, imagesIds);

  // Find and update the portfolio by ID
  try {
    const portfolio = await Portfolio.findByIdAndUpdate(id, {
      $set: {
        name: title,
        description,
        link,
        thumbnail: thumbnailIds,
        images: imagesIds,
      },
    });

    if (!portfolio) {
      return res.status(404).json({
        status: false,
        message: "Portfolio not found",
        data: null,
      });
    }

    res.status(200).json({
      status: true,
      message: "Successfully edited portfolio",
      data: portfolio,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "An error occurred while editing portfolio",
      data: null,
    });
  }
};

module.exports.fetchRecentPortfolios = async (req, res, next) => {
  const userId = req.params.id;

  // first sort all portfolios in descending order for recent ones and then limit them to 3 only
  const portfolios = await Portfolio.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .limit(3);

  res.status(200).json({
    status: true,
    message: "Successfully fetched recent portfolios",
    data: portfolios,
  });
};

module.exports.fetchAllPortfolios = async (req, res, next) => {
  const userId = req.params.id;

  const portfolios = await Portfolio.find({ createdBy: userId });

  res.status(200).json({
    status: true,
    message: "Successfully fetched portfolios",
    data: portfolios,
  });
};

module.exports.deletePortfolio = async (req, res, next) => {
  const { id } = req.body;

  try {
    // Find the portfolio by ID and delete it
    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      return res.status(404).json({
        status: false,
        message: "Portfolio not found",
      });
    }
    await Portfolio.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
      message: "Portfolio deleted successfully",
    });
  } catch (e) {
    res.status(500).json({
      status: false,
      message: e.message,
      error: e,
    });
  }
};

module.exports.addSchool = async (req, res, next) => {
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
};

module.exports.editSchool = async (req, res, next) => {
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
};

module.exports.deleteSchool = async (req, res, next) => {
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
  } catch (e) {
    res.status(500).json({
      status: false,
      message: e.message,
      error: e,
    });
  }
};

module.exports.fetchSchools = async (req, res, next) => {
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
  } catch (e) {
    res.status(500).json({
      status: false,
      message: e.message,
      error: e,
    });
  }
};

module.exports.addExperience = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { jobTitleId, companyId, employmentType, startDate, endDate } =
      req.body;
    const experience = new Experience({
      jobTitleId,
      companyId,
      employmentType,
      startDate,
      endDate,
    });

    // Save the experience
    await experience.save();

    // Add the experience's _id to the user's experiences array
    const user = await User.findById(userId);
    user.experiences.push(experience._id);
    await user.save();

    res.status(200).json({
      status: true,
      message: "Experience added to user",
      data: user,
    });
  } catch (e) {
    res.status(500).json({
      status: false,
      message: e.message,
      error: e,
    });
  }
};

module.exports.editExperience = async (req, res, next) => {
  try {
    const {
      experienceId,
      jobTitleId,
      companyId,
      employmentType,
      startDate,
      endDate,
    } = req.body;

    // Find and update the experience by ID
    const experience = await Experience.findByIdAndUpdate(
      { _id: experienceId },
      {
        $set: {
          jobTitleId,
          companyId,
          employmentType,
          startDate,
          endDate,
        },
      },
      { new: true }
    );
    const userId = req.userId;
    const user = await User.findOne({ _id: userId });
    if (!experience) {
      return res.status(404).json({
        status: false,
        message: "Experience not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Successfully edited experience",
      data: user,
    });
  } catch (e) {
    res.status(500).json({
      status: false,
      message: e.message,
      error: e,
    });
  }
};

module.exports.deleteExperience = async (req, res, next) => {
  try {
    const { experienceId } = req.body;
    // Find and delete
    const deletedExperience = await Experience.findByIdAndDelete({
      _id: experienceId,
    });

    if (!deletedExperience) {
      return res.status(404).json({
        status: false,
        message: "Experience not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Experience deleted successfully",
    });
  } catch (e) {
    res.status(500).json({
      status: false,
      message: e.message,
      error: e,
    });
  }
};

module.exports.updateGoals = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { careerGoals, skillGoals, financialGoals, socialGoals } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Check if the user already has a goal
    if (user.goals) {
      // If user has a goal, update it
      const goal = await Goal.findByIdAndUpdate(
        user.goals,
        {
          careerGoals,
          skillGoals,
          financialGoals,
          socialGoals,
        },
        { new: true }
      );

      return res.status(200).json({
        status: true,
        message: "Goals updated successfully",
        data: user,
      });
    } else {
      // If user doesn't have a goal, create a new goal
      const newGoal = new Goal({
        careerGoals,
        skillGoals,
        financialGoals,
        socialGoals,
      });

      await newGoal.save();

      user.goals = newGoal._id;
      await user.save();

      return res.status(200).json({
        status: true,
        message: "Goals created successfully",
        data: user,
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: e.message,
      error: e,
    });
  }
};

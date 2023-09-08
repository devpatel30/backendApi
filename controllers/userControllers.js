if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const mongoose = require("mongoose");

const passport = require("passport");
const jwt = require("jsonwebtoken");

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("node:crypto");

const { Expertise, Availability, Company } = require("../models");
const { User, Token } = require("../models");

// const User = require("../models/user");
const Waitlist = require("../models/waitlist");
const InvitationCode = require("../models/invitationCode");

const { findAndDeleteTokenByUserId } = require("../middleware/utils");
const catchAsync = require("../utils/catchAsync");
const Connection = require("../models/connection")
const Follow = require("../models/follow")
const Save = require("../models/Save")
const ReportReason = require("../models/ReportReason")
const Report = require("../models/report")

require("../config/appAuth");

// check if email already in database
module.exports.emailExists = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (email === "") {
      res.status(200).json({ status: false, message: "No email entered" });
      return;
    }
    const emailExists = await User.findOne({ "personalInfo.email": email });
    if (emailExists) {
      res
        .status(200)
        .json({ status: false, message: "Email already exists", data: true });
    } else {
      res.status(200).json({
        status: true,
        message: "User can register with this email",
        data: false,
      });
    }
  } catch (e) {
    res.status(500).json({ status: false, message: e.message, error: e });
  }
};

// Function to generate JWT given a user object
function generateJWT(user) {
  const payload = {
    id: user._id,
    username: user.personalInfo.email,
  };
  const token = jwt.sign(payload, process.env.SESSION_SECRET, {
    expiresIn: "1w",
  });
  // Save the token to the database
  saveTokenToDb(token, user._id);

  return token;
}
// Function to save token to the database
const saveTokenToDb = async (accessToken, userId) => {
  try {
    const token = new Token({
      accessToken: accessToken,
      userId: userId,
    });

    await token.save();
  } catch (error) {
    // Handle any errors that might occur during the save operation
    console.error("Error saving token to database:", error.message);
    throw error;
  }
};

// signup
module.exports.signUpUser = async (req, res, next) => {
  try {
    const { userType, email, password } = req.body;
    const username = email;
    const emailExists = await User.findOne({ "personalInfo.email": email });
    if (emailExists) {
      res
        .status(200)
        .json({ status: false, message: "Email already exists", data: true });
    } else {
      const user = new User({
        personalInfo: { userType, email },
        username,
      });
      const regUser = await User.register(user, password);
      // Login the user
      const token = generateJWT(user);

      // Return the token in the response
      return res.status(200).json({
        status: true,
        message: "User successfully created and logged in",
        data: { ...regUser.toObject(), token: "Bearer " + token },
      });
    }
  } catch (e) {
    res.status(500).send({ status: false, message: e.message, error: e });
  }
};

// login
module.exports.loginUser = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      // err handling
      return res.status(500).json({
        status: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
    if (!user) {
      // authentication failed
      return res
        .status(200)
        .json({ status: false, message: "Invalid Credentials" });
    }

    // User authenticated successfully, generate JWT
    const token = generateJWT(user);

    // Return the token in the response
    return res.status(200).json({
      status: true,
      message: "User successfully logged in",
      data: { ...user.toObject(), token: "Bearer " + token },
    });
  })(req, res, next);
};

// google Auth
module.exports.googleAuth = async (req, res, next) => {
  const { email, clientId } = req.body
  // 1. Check for required data
  if (!email || !clientId) {
    return res.status(200).json({
      status: false,
      message: 'Missing required data'
    })
  }
  // 2. Getting the user from DB
  const user = await User.findOne({ "personalInfo.email": email })
  // 3. User tries to log in
  if (user) {
    const token = generateJWT(user);
    return res.status(200).json({
      status: true,
      isUserExists: true,
      message: "User successfully logged in",
      data: { user, token: "Bearer " + token }
    })
  } else if (req.body.isGoogleSignUp && req.body.userType && !user) { // 4. User tries to sign up
    const { userType } = req.body
    const username = email
    const newUser = new User({
      personalInfo: { userType, email },
      username,
    });
    const regUser = await User.register(newUser, clientId);
    const token = generateJWT(regUser);
    return res.status(200).json({
      status: true,
      isUserExists: true,
      message: "User successfully created and logged in",
      data: { ...regUser.toObject(), token: "Bearer " + token },
    });
  } else { // 5. User doesn't Exist & not sign up
    return res.status(200).json({
      status: false,
      isUserExists: false,
      message: "User is not signed in",
      data: { email, clientId }
    })
  }
}

// logout
module.exports.logoutUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    findAndDeleteTokenByUserId(req.userId);
    res.status(200).send({
      status: true,
      message: `${user.personalInfo.email} user logged out`,
    });
  } catch (e) {
    res.status(500).send({
      status: false,
      message: e.message,
      errror: e,
    });
  }
};

// google Auth
module.exports.googleAuth = async (req, res, next) => {
  const { email, clientId } = req.body
  // 1. Check for required data
  if (!email || !clientId) {
    return res.status(200).json({
      status: false,
      message: 'Missing required data'
    })
  }
  // 2. Getting the user from DB
  const user = await User.findOne({ "personalInfo.email": email })
  // 3. User tries to log in
  if (user) {
    const token = generateJWT(user);
    return res.status(200).json({
      status: true,
      isUserExists: true,
      message: "User successfully logged in",
      data: { user, token: "Bearer " + token }
    })
  } else if (req.body.isGoogleSignUp && req.body.userType && !user) { // 4. User tries to sign up
    const { userType } = req.body
    const username = email
    const newUser = new User({
      personalInfo: { userType, email },
      username,
    });
    const regUser = await User.register(newUser, clientId);
    const token = generateJWT(regUser);
    return res.status(200).json({
      status: true,
      isUserExists: true,
      message: "User successfully created and logged in",
      data: { ...regUser.toObject(), token: "Bearer " + token },
    });
  } else { // 5. User doesn't Exist & not sign up
    return res.status(200).json({
      status: false,
      isUserExists: false,
      message: "User is not signed up",
      data: { email, clientId }
    })
  }
}

const areAllValuesNull = (obj) => {
  for (const key in obj) {
    if (obj[key] !== null) {
      return false;
    } else if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      if (!areAllValuesNull(obj[key])) {
        return false;
      }
    } else if (Array.isArray(obj[key])) {
      for (const item of obj[key]) {
        if (typeof item === "object" && !Array.isArray(item)) {
          if (!areAllValuesNull(item)) {
            return false;
          }
        } else if (item !== null) {
          return false;
        }
      }
    }
  }
  return true;
};

const removeNullProperties = (obj) => {
  for (const key in obj) {
    if (obj[key] === null) {
      delete obj[key];
    } else if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      removeNullProperties(obj[key]);
      if (areAllValuesNull(obj[key])) {
        delete obj[key];
      }
    } else if (Array.isArray(obj[key])) {
      obj[key] = obj[key].filter((item) => {
        if (typeof item === "object" && !Array.isArray(item)) {
          removeNullProperties(item);
          return !areAllValuesNull(item);
        }
        return item !== null;
      });
      if (obj[key].length === 0) {
        delete obj[key];
      }
    }
  }
};
// Function to complete user profile
module.exports.completeUserProfile = async (req, res, next) => {
  try {
    const {
      userType = null,
      pronouns = null,
      interests = null,
      skills = null,
      language = null,
      firstName = null,
      lastName = null,
      major = null,
      school = null,
      startDate = null,
      endDate = null,
      recentJobTitle = null,
      recentCompany = null,
      expertise = null,
      mentorshipStyle = null,
      noOfMentees = null,
      employmentType = null,
      availability = null,
      employeeId = null,
      jobTitle = null,
      institution = null,
      about = null,
    } = req.body;

    // Saving the availability objects and get their ObjectId values

    const availabilityData = availability;
    let availabilityObjectIdArray = [];
    //  Check if availabilityData is an array and has elements before iterating
    if (Array.isArray(availabilityData) && availabilityData.length > 0) {
      const availabilityIds = [];
      for (const availabilityObj of availabilityData) {
        const availability = new Availability(availabilityObj);
        await availability.save();
        availabilityIds.push(availability._id);
      }

      // array that has the ObjectId values of availability
      availabilityObjectIdArray = availabilityIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }

    // Saving the availability objects and get their ObjectId values
    const expertiseData = expertise;
    let expertiseObjectIdArray = [];
    // Check if expertiseData is an array and has elements before iterating
    if (Array.isArray(expertiseData) && expertiseData.length > 0) {
      const expertiseIds = [];
      for (const expertiseObj of expertiseData) {
        const expertise = new Expertise(expertiseObj);
        await expertise.save();
        expertiseIds.push(expertise._id);
      }

      // array that has the ObjectId values of expertise
      expertiseObjectIdArray = expertiseIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }

    const newInstitution = new Company(institution);
    await newInstitution.save();
    const institutionId = newInstitution._id;

    const loggedInUserEmail = req.user.personalInfo.email;
    const updateObj = {
      "personalInfo.userType": userType,
      "personalInfo.pronouns": pronouns,
      "personalInfo.interests": interests,
      "personalInfo.skills": skills,
      "personalInfo.language": language,
      "personalInfo.firstName": firstName,
      "personalInfo.lastName": lastName,
      education: [
        {
          school: school,
          major: major,
          startDate: startDate,
          endDate: endDate,
        },
      ],
      mentor: {
        jobTitle: recentJobTitle,
        company: recentCompany,
        expertise: expertiseObjectIdArray,
        mentorshipStyle: mentorshipStyle,
        noOfMentees: noOfMentees,
        employmentType: employmentType,
        availability: availabilityObjectIdArray,
      },
      institution: {
        creatorInfo: {
          jobTitle: jobTitle,
          employeeId: employeeId,
        },
        institution: institutionId,
      },
      about: about,
    };

    removeNullProperties(updateObj);

    const user = await User.findOneAndUpdate(
      { "personalInfo.email": loggedInUserEmail },
      { $set: updateObj },
      { new: true }
    );
    user.auth.isProfileCompleted = true;
    await user.save();
    return res.status(200).json({
      status: true,
      message: "User profile completed successfully",
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

// waitlist
module.exports.waitlistUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const emailExists = await Waitlist.findOne({ email });
    if (emailExists) {
      res
        .status(200)
        .json({ status: false, message: "User already in waitlist" });
    } else {
      const waitlist = new Waitlist({ email });
      await waitlist.save();
      res.status(200).json({
        status: true,
        message: "User added to waitlist",
        data: waitlist,
      });
    }
  } catch (e) {
    res.status(500).json({ status: false, message: e.message, error: e });
  }
};

// check invitation code
module.exports.checkInvititationCode = async (req, res, next) => {
  try {
    const { invitationCode } = req.body;
    const codeExists = await InvitationCode.findOne({ invitationCode });
    if (codeExists) {
      res
        .status(200)
        .json({ status: true, message: "Valid invitation code", data: true });
    } else {
      res.status(200).json({
        status: false,
        message: "Invalid invitation code",
        data: false,
      });
    }
  } catch (e) {
    res.status(500).json({ status: false, message: e.message, error: e });
  }
};

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const s3BucketName = process.env.S3BUCKET_NAME;
const s3BucketRegion = process.env.S3BUCKET_REGION;
const s3AccessKey = process.env.S3_ACCESS_KEY;
const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: s3AccessKey,
    secretAccessKey: s3SecretAccessKey,
  },
  region: s3BucketRegion,
});

module.exports.uploadImage = async (req, res, next) => {
  const userId = req.user.id;
  const imageName = randomImageName();
  const params = {
    Bucket: s3BucketName,
    Key: imageName,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };
  const command = new PutObjectCommand(params);
  await s3.send(command);
  // Generate the URL for the uploaded image
  const getObjectParams = {
    Bucket: s3BucketName,
    Key: imageName,
  };
  const getCommand = new GetObjectCommand(getObjectParams);
  const imageUrl = await getSignedUrl(s3, getCommand, { expiresIn: 604800 });

  const user = await User.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        "personalInfo.profileImage": {
          fileName: imageName,
        },
        "personalInfo.profileImageLink": imageUrl,
      },
    },
    { new: true }
  );

  res.status(200).json({
    status: true,
    message: "Successfully uploaded image",
    data: { ...user.toObject(), token: req.headers.authorization },
  });
};

module.exports.getImageLink = async (req, res, next) => {
  try {
    const username = req.user.personalInfo.email;
    const user = await User.findOne({ "personalInfo.email": username });

    if (
      !user.personalInfo.profileImage ||
      !user.personalInfo.profileImage.fileName
    ) {
      // Handle the case when the user doesn't have a profile image
      return res.status(404).json({
        status: false,
        message: "User's profile image not found.",
      });
    }

    // Get the filename from the user's profileImage object
    const filename = user.personalInfo.profileImage.fileName;

    const getObjectParams = {
      Bucket: s3BucketName,
      Key: filename,
    };
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 604800 });
    user.personalInfo.profileImageLink = url;

    res.status(200).json({
      status: true,
      message: "Access link to image made valid for 1 week.",
      data: { ...user.toObject(), token: req.headers.authorization },
    });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message, error: e });
  }
};

module.exports.fetchUserProfile = catchAsync(async (req, res, next) => {
  const { userId } = req.body
  // 1. Check for required data
  if (!userId) {
    return res.status(200).json({
      status: false,
      message: 'Please provide required data'
    })
  }
  // 2. Populate the required data for the profile
  const [
    user,
    isFollowingYou,
    isFollowedByYou,
    isConnected
  ] = await Promise.all([
    User.findById(userId),
    Follow.findOne({ userId, isFollowing: req.userId }),
    Follow.findOne({ userId: req.userId, isFollowing: userId }),
    Connection.findOne({ userId: req.userId, connectionId: userId })
  ])
  res.status(200).json({
    status: true,
    message: `${user.personalInfo.firstName} ${user.personalInfo.lastName} Profile`,
    data: {
      user,
      isFollowingYou: Boolean(isFollowingYou),
      isFollowedByYou: Boolean(isFollowedByYou),
      connectionStatus: isConnected ? isConnected.connectionStatus : 'null'
    }
  })
})

module.exports.handleSaveUser = catchAsync(async (req, res, next) => {
  const { userId } = req.body
  // 1. Check for required data
  if (!userId) {
    return res.status(200).json({
      status: false,
      message: 'Please provide user id'
    })
  }
  // 2. Checking if user saved any users before
  const saveResource = await Save.findOne({ userId: req.userId })
  // 3. User has never saved users before
  if (!saveResource) {
    await Save.create({
      userId: req.userId,
      savedUsers: [userId]
    })
    return res.status(200).json({
      status: true,
      isSaved: true,
      message: 'User saved successfully'
    })
  }
  // 4. Checking if user is already saved
  const isSaved = saveResource.savedUsers.find(s => s?.toString() === userId)
  let updateParams = {}
  let responseParams = {}
  // 5. If user is saved then unsave him
  if (isSaved) {
    updateParams = {
      $pull: { savedUsers: userId }
    }
    responseParams = {
      status: true,
      isSaved: false,
      message: 'User is unsaved successfully'
    }
  } else { // 6. If user isn't saved then save him
    updateParams = {
      $push: { savedUsers: userId }
    }
    responseParams = {
      status: true,
      isSaved: true,
      message: 'User is saved successfully'
    }
  }
  await Save.findOneAndUpdate({ userId: req.userId }, updateParams, { runValidators: true })
  res.status(200).json(responseParams)
})

module.exports.reportUser = catchAsync(async (req, res, next) => {
  const { userId, reasonId, message = "" } = req.body
  // 1. Checking for required data
  if (!userId || !reasonId) {
    return res.status(200).json({
      status: false,
      message: 'User id and reason id are required'
    })
  }
  // 2. Checking if user and report exists & Checking if report exists
  const [user, reportReason, report] = await Promise.all([
    User.findById(userId),
    ReportReason.findById(reasonId),
    Report.findOne({ userId: req.userId, reportedUser: userId })
  ])
  if (!user || !reportReason) {
    return res.status(200).json({
      status: false,
      message: 'Invalid user id or reason id'
    })
  }
  if (report) {
    return res.status(200).json({
      status: false,
      message: 'Report already exists'
    })
  }
  // 3. Create report
  await Report.create({
    userId: req.userId,
    reportedUser: userId,
    reasonId,
    message
  })
  res.status(200).json({
    status: true,
    message: 'Report created successfully'
  })
})
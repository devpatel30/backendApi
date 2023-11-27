if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");

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

// Function to upload image to Amazon S3 and update the specified model
module.exports.uploadImageToS3 = async (
  model,
  objectId,
  fileBuffer,
  mimeType,
  imageFieldName,
  imageLinkFieldName
) => {
  try {
    if (!fileBuffer) {
      // Handle the case where the fileBuffer is empty or undefined
      throw new Error("File buffer is empty");
    }
    const currentModel = await model.findOne({ _id: objectId });

    if (currentModel && currentModel[imageFieldName]) {
      // Delete the previous image from S3
      const previousImageName = currentModel[imageFieldName].fileName;
      await deleteImageFromS3(
        model,
        objectId,
        previousImageName,
        imageFieldName,
        imageLinkFieldName
      );
    }

    const imageName = randomImageName();
    const params = {
      Bucket: s3BucketName,
      Key: imageName,
      Body: fileBuffer,
      ContentType: mimeType,
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

    // Update the specified model with the image file name and image link
    const updateObj = {
      [imageFieldName]: { fileName: imageName },
      [imageLinkFieldName]: imageUrl,
    };
    const savedModel = await model.findOneAndUpdate(
      { _id: objectId },
      { $set: updateObj },
      { new: true }
    );
    return savedModel;
  } catch (e) {
    return { status: false, message: e.message, error: e };
  }
};

module.exports.deleteImageFromS3 = async (
  model,
  objectId,
  imageFileName,
  imageFieldName,
  imageLinkFieldName
) => {
  try {
    const deleteParams = {
      Bucket: s3BucketName,
      Key: imageFileName,
    };
    const deleteCommand = new DeleteObjectCommand(deleteParams);
    await s3.send(deleteCommand);

    // Update the specified model by removing the deleted image file name and link
    const savedModel = await model.findOneAndUpdate(
      { _id: objectId },
      {
        $pull: {
          [imageFieldName]: { fileName: imageFileName },
          [imageLinkFieldName]: { $regex: imageFileName },
        },
      },
      { new: true }
    );

    return savedModel;
  } catch (e) {
    throw new Error(e.message);
  }
};

module.exports.uploadMultipleImagesToS3 = async (
  model,
  objectId,
  files,
  imageFieldName,
  imageLinkFieldName
) => {
  try {
    const savedImages = [];

    for (const file of files) {
      const imageName = randomImageName();
      const params = {
        Bucket: s3BucketName,
        Key: imageName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const command = new PutObjectCommand(params);
      await s3.send(command);

      // Generate the URL for the uploaded image
      const getObjectParams = {
        Bucket: s3BucketName,
        Key: imageName,
      };
      const getCommand = new GetObjectCommand(getObjectParams);
      const imageUrl = await getSignedUrl(s3, getCommand, {
        expiresIn: 604800,
      });

      savedImages.push({ fileName: imageName, link: imageUrl });
    }

    // Update the specified model with the image file names and image links
    const updateObj = {
      [imageFieldName]: savedImages,
      [imageLinkFieldName]: savedImages.map((image) => image.link),
    };
    const savedModel = await model.findOneAndUpdate(
      { _id: objectId },
      { $set: updateObj },
      { new: true }
    );

    return savedModel;
  } catch (e) {
    throw new Error(e.message);
  }
};

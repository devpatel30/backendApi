if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
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
      { $set: updateObj }
    );

    return savedModel;
  } catch (e) {
    res.status(500).json({ status: false, message: e.message, error: e });
  }
};

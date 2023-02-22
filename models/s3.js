const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME
const AWS_S3_BUCKET_REGION = process.env.AWS_S3_BUCKET_REGION

const AWS = require("aws-sdk")

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
  region: AWS_S3_BUCKET_REGION
})

const s3 = new AWS.S3()

function uploadImageToS3(file, editedFilename) {
  const fileContent = Buffer.from(file.data, "binary")

  const params = {
    Bucket: AWS_S3_BUCKET_NAME,
    Key: editedFilename, // file name stored in S3
    Body: fileContent, //file content
    ContentType: file.mimetype,
    ACL: "public-read"
  }

  return s3.upload(params).promise()
}


exports.uploadImageToS3 = uploadImageToS3


require("dotenv").config()
const express = require("express")
const router = express.Router()
const { cookieJwtAuth } = require("../cookieJwtAuth")
const { uploadImageToS3 } = require("../models/s3")
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL
const fileUpload = require("express-fileupload")
router.use(fileUpload())

// ---------- upload image to AWS S3 ---------

router.post("/file", cookieJwtAuth, async (req, res) => {
  const file = req.files.image

  const now = new Date()
  const userIdSubstring = req.user.id.slice(18, 24)
  const editedFilename = now.toISOString().replace(/[-:.TZ]/g, '') + userIdSubstring
  const cloudFrontUrl = CLOUDFRONT_URL + editedFilename

  try {
    const result = await uploadImageToS3(file, editedFilename)

    if (result.Location) {
      res.status(200).send({
        "data": cloudFrontUrl
      })
    }
  } catch (e) {
    console.log(e)
    res.status(500).send({
      "error": true,
      "message": "Interval error"
    })
  }

})


module.exports = router
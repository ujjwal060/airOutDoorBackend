const multer = require('multer');
const { S3 } = require('@aws-sdk/client-s3');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const s3 = new S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

// File filter function to validate file types
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|mp4|mov/;
  const isFileTypeValid = fileTypes.test(path.extname(file.originalname).toLowerCase()) && fileTypes.test(file.mimetype);

  if (isFileTypeValid) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed'));
  }
};

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// Configure multer middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 }, // Limit file size to 10MB
});

// Middleware to handle S3 upload
const uploadToS3 = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer Error: ", err.message); // Log multer error
      return res.status(400).send(err.message);
    }

    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${Date.now()}-${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype, // Set the content type for the file
    };

    try {
      await s3.putObject(params); 
      req.fileLocation = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
      console.log(`File uploaded successfully to S3: ${req.fileLocation}`); // Log successful upload
      next();
    } catch (uploadError) {
      console.error("S3 Upload Error: ", uploadError.message); // Log S3 upload error
      return res.status(500).send(uploadError.message);
    }
  });
};

module.exports = { uploadToS3 };

const multer = require("multer");

// Store uploaded files in memory
const storage = multer.memoryStorage();

// Allow only image files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed"));
  }
};

// Single profile image upload
const uploadProfilePicture = uploader.single("profilePicture");

// Single dealer logo upload
const uploadDealerLogo = uploadProfilePicture.single("logo");

module.exports = {
    uploadProfilePicture,
    uploadDealerLogo
}

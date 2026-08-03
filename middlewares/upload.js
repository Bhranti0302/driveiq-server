const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

// ================= USER PROFILE IMAGE ================= //

const userStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "driveiq/users",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const uploadUserImage = multer({ storage: userStorage });

// ================= PRODUCT IMAGES ================= //

const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "driveiq/products",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const uploadProductImages = multer({ storage: productStorage });

// ================= EXPORT ================= //

module.exports = {
  uploadUserImage,
  uploadProductImages,
};

const cloudinary = require("../config/cloudinary");

// ==========================================
// UPLOAD IMAGE TO CLOUDINARY
// ==========================================

const uploadToCloudinary = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `driveiq/${folder}`,
                resource_type: "image"
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id
                })
            }
        );

        uploadStream.end(fileBuffer)
    })
}

// ==========================================
// DELETE IMAGE FROM CLOUDINARY
// ==========================================

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;

    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
    });

    return result;
}

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary
}
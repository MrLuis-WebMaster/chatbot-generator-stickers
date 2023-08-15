const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_KEY_SECRET,
  secure: true,
});

const transformImage = async ({ path, text }) => {
  try {
    const transformation = [
      {
        color: text?.color || '#fff',
        overlay: {
          font_family: "Arial", 
          font_size: parseInt(text?.size, 10) || 150, 
          text: text?.body,
        },
      },
      { flags: "layer_apply", gravity: text?.position || "south",  y: 15, x: 15 }
    ];

    const result = await cloudinary.uploader.upload(path, {
      transformation,
      format: "png",
      public_id: "sticker_result",
    });

    return result.secure_url;
  } catch (error) {
    console.error("Error:", error);
  }
};

module.exports = transformImage;

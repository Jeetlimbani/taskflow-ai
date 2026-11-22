
import multer from "multer";

// Store uploaded images temporarily in memory
const storage = multer.memoryStorage();

// Allow only supported image formats
const fileFilter = (req, file, callback) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new Error("Only JPG, JPEG, PNG, and WEBP images are allowed.")
    );
  }
};

// Configure Multer
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter,
});

// Handle upload errors

const isValidImage = (file) => {
    const buffer = file.buffer;
  
    // JPEG signature
    const isJPEG =
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;
  
    // PNG signature
    const isPNG =
      buffer.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      );
  
    // WEBP signature
    const isWEBP =
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP";
  
    return (
      (file.mimetype === "image/jpeg" && isJPEG) ||
      (file.mimetype === "image/png" && isPNG) ||
      (file.mimetype === "image/webp" && isWEBP)
    );
  };
  
  const uploadImage = (req, res, next) => {
    upload.single("image")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message:
            error.code === "LIMIT_FILE_SIZE"
              ? "Image size must be less than 10 MB."
              : error.message,
        });
      }
  
      if (req.file && !isValidImage(req.file)) {
        return res.status(400).json({
          success: false,
          message: "Invalid image file. Please upload a valid JPG, PNG, or WEBP image.",
        });
      }
  
      next();
    });
  };
  

export default uploadImage;

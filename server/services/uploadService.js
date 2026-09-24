const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate secure unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// File Validation
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPG, JPEG, PNG and WEBP are allowed."),
      false,
    );
  }
};

// Multer Middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const deleteImageFile = (imageUrl) => {
  if (!imageUrl) return;

  try {
    // Extract filename from URL (e.g. "http://localhost:5000/uploads/12345.jpg" -> "12345.jpg")
    let filename = "";

    if (imageUrl.includes("/uploads/")) {
      filename = imageUrl.split("/uploads/").pop();
    } else {
      // Direct filename fallback
      filename = path.basename(imageUrl);
    }

    // Ignore external URLs (e.g., Unsplash placeholders)
    if (imageUrl.startsWith("http") && !imageUrl.includes("/uploads/")) {
      return;
    }

    if (filename) {
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error(`Failed to delete image file: ${imageUrl}`, error);
  }
};

module.exports = {
  upload,
  deleteImageFile,
};

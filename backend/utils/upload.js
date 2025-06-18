import multer from "multer";
import path from "path";
import fs from "fs";

// Create upload directories
const createUploadDirs = () => {
  const dirs = [
    "uploads/course-thumbnails",
    "uploads/lecture-videos",
    "uploads/profile-images",
    "uploads/course-materials",
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Initialize directories
createUploadDirs();

// Image storage configuration
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "uploads/course-thumbnails"; // default

    // Determine upload path based on field name
    if (file.fieldname === "profileImage") {
      uploadPath = "uploads/profile-images";
    } else if (
      file.fieldname === "courseThumbnail" ||
      file.fieldname === "thumbnail"
    ) {
      uploadPath = "uploads/course-thumbnails";
    } else if (file.fieldname === "courseMaterial") {
      uploadPath = "uploads/course-materials";
    }

    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const prefix = file.fieldname || "file";
    cb(null, `${prefix}-${uniqueSuffix}${fileExtension}`);
  },
});

// Video storage configuration
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/lecture-videos");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `lecture-video-${uniqueSuffix}${fileExtension}`);
  },
});

// File filters
const imageFileFilter = (req, file, cb) => {
  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only JPEG, PNG, GIF, and WebP image files are allowed"),
      false
    );
  }
};

const videoFileFilter = (req, file, cb) => {
  const allowedVideoTypes = [
    "video/mp4",
    "video/mpeg",
    "video/quicktime", // .mov
    "video/x-msvideo", // .avi
    "video/webm",
    "video/x-ms-wmv", // .wmv
    "video/3gpp", // .3gp
    "video/x-flv", // .flv
  ];

  if (allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only MP4, MPEG, MOV, AVI, WebM, WMV, 3GP, and FLV video files are allowed"
      ),
      false
    );
  }
};

const documentFileFilter = (req, file, cb) => {
  const allowedDocTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
  ];

  if (allowedDocTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF, DOC, DOCX, PPT, PPTX, and TXT files are allowed"),
      false
    );
  }
};

// Combined file filter that handles different file types
const combinedFileFilter = (req, file, cb) => {
  // Check file type based on fieldname or mimetype
  if (file.mimetype.startsWith("image/")) {
    imageFileFilter(req, file, cb);
  } else if (file.mimetype.startsWith("video/")) {
    videoFileFilter(req, file, cb);
  } else {
    documentFileFilter(req, file, cb);
  }
};

// Upload configurations
const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB for images
  },
  fileFilter: imageFileFilter,
});

const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 1024 * 1024 * 500, // 500MB for videos
  },
  fileFilter: videoFileFilter,
});

const mixedUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadPath = "uploads/course-materials";

      if (file.mimetype.startsWith("image/")) {
        uploadPath = "uploads/course-thumbnails";
      } else if (file.mimetype.startsWith("video/")) {
        uploadPath = "uploads/lecture-videos";
      }

      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtension = path.extname(file.originalname);
      let prefix = "file";

      if (file.mimetype.startsWith("image/")) {
        prefix = "image";
      } else if (file.mimetype.startsWith("video/")) {
        prefix = "video";
      } else {
        prefix = "document";
      }

      cb(null, `${prefix}-${uniqueSuffix}${fileExtension}`);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 500, // 500MB max
  },
  fileFilter: combinedFileFilter,
});

// Add a specific thumbnail upload configuration
const thumbnailUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 5MB for thumbnails
  },
  fileFilter: imageFileFilter,
});

// Utility functions
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};

const getFileInfo = (file) => {
  return {
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    uploadDate: new Date(),
    url: `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`,
  };
};

const validateFileSize = (size, type) => {
  const limits = {
    image: 10 * 1024 * 1024, // 10MB
    video: 500 * 1024 * 1024, // 500MB
    document: 50 * 1024 * 1024, // 50MB
  };

  return size <= limits[type];
};

const getFileType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  return "document";
};

// Error handler middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: "File size too large",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Too many files",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: "Unexpected file field",
        });
      default:
        return res.status(400).json({
          success: false,
          message: "Upload error: " + error.message,
        });
    }
  }

  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
};

// Export all upload configurations and utilities
export {
  imageUpload,
  videoUpload,
  mixedUpload,
  thumbnailUpload, // Add this
  deleteFile,
  getFileInfo,
  validateFileSize,
  getFileType,
  handleUploadError,
  createUploadDirs,
};

// Default export for backward compatibility
export default {
  image: imageUpload,
  video: videoUpload,
  mixed: mixedUpload,
  utils: {
    deleteFile,
    getFileInfo,
    validateFileSize,
    getFileType,
  },
  middleware: {
    handleUploadError,
  },
};

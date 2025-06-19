import {
  videoUpload,
  deleteFile,
  getFileInfo,
  handleUploadError,
} from "../utils/upload.js";
import Lecture from "../models/Lecture.model.js";
import LectureCompletion from "../models/LectureCompletion.model.js";
import Enrollment from "../models/Enrollment.model.js";
import fs from "fs";

// Controller function to create video lecture
export const createVideoLecture = async (req, res) => {
  try {
    // Use multer middleware to handle video upload
    videoUpload.single("video")(req, res, async (err) => {
      if (err) {
        return handleUploadError(err, req, res, () => {
          return res.status(500).json({
            success: false,
            message: "Unexpected error during upload",
          });
        });
      }

      // Check if video file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Video file is required",
        });
      }

      try {
        // Extract data from request body
        const { title, description, courseId } = req.body;
        const creator = req.user._id; // Assuming creator is the logged-in user

        // Validate required fields
        if (!title || !courseId || !creator) {
          // Delete uploaded file if validation fails
          deleteFile(req.file.path);
          return res.status(400).json({
            success: false,
            message: "Title, courseId, and creator are required fields",
          });
        }

        // Get file information
        const videoData = getFileInfo(req.file);

        // Create new lecture document
        const newLecture = new Lecture({
          title: title.trim(),
          lectureType: "video",
          description: description ? description.trim() : "",
          data: videoData,
          courseId,
          creator,
        });

        // Save to database
        const savedLecture = await newLecture.save();

        // Populate references for response
        await savedLecture.populate([
          { path: "courseId", select: "title description" },
          { path: "creator", select: "name email" },
        ]);

        res.status(201).json({
          success: true,
          message: "Video lecture created successfully",
          data: {
            lecture: {
              ...savedLecture.toObject(),
              data: {
                ...savedLecture.data,
                path: undefined, // Remove file system path for security
                streamUrl: `/api/lectures/stream/${savedLecture._id}`,
                downloadUrl: `/api/lectures/download/${savedLecture._id}`,
              },
            },
          },
        });
      } catch (dbError) {
        console.error("Database error:", dbError);

        // Delete uploaded file if database operation fails
        if (req.file) {
          deleteFile(req.file.path);
        }

        return res.status(500).json({
          success: false,
          message: "Failed to save lecture to database",
          error:
            process.env.NODE_ENV === "development"
              ? dbError.message
              : undefined,
        });
      }
    });
  } catch (error) {
    console.error("Error creating video lecture:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const streamVideoFile = async (req, res) => {
  try {
    const { lectureId } = req.params;

    // Find lecture by ID
    const lecture = await Lecture.findById(lectureId);

    if (!lecture || lecture.lectureType !== "video") {
      return res.status(404).json({
        success: false,
        message: "Video lecture not found",
      });
    }

    const videoPath = lecture.data.path;

    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        message: "Video file not found on server",
      });
    }

    // Get file stats
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Handle range requests for video streaming
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).set({
          "Content-Range": `bytes */${fileSize}`,
        });
        return res.end();
      }

      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": lecture.data.mimetype,
        "Cache-Control": "no-cache",
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Serve entire file
      const head = {
        "Content-Length": fileSize,
        "Content-Type": lecture.data.mimetype,
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache",
      };

      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error("Error streaming video file:", error);
    res.status(500).json({
      success: false,
      message: "Error streaming video file",
    });
  }
};

// Controller to download video files
export const downloadVideoFile = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);

    if (!lecture || lecture.lectureType !== "video") {
      return res.status(404).json({
        success: false,
        message: "Video lecture not found",
      });
    }

    const videoPath = lecture.data.path;

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        message: "Video file not found on server",
      });
    }

    // Set headers for file download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${lecture.data.originalName}"`
    );
    res.setHeader("Content-Type", lecture.data.mimetype);
    res.setHeader("Content-Length", lecture.data.size);

    // Stream file for download
    const fileStream = fs.createReadStream(videoPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading video file:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading video file",
    });
  }
};

// Controller to get lecture details
export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId)
      .populate("courseId", "title description")
      .populate("creator", "name email");

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    // Prepare response data without exposing file system path
    const lectureData = {
      ...lecture.toObject(),
      data: {
        ...lecture.data,
        path: undefined, // Remove path for security
        streamUrl: `/api/lectures/stream/${lecture._id}`,
        downloadUrl: `/api/lectures/download/${lecture._id}`,
      },
    };

    res.status(200).json({
      success: true,
      data: lectureData,
    });
  } catch (error) {
    console.error("Error fetching lecture:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching lecture",
    });
  }
};

// Controller to get all lectures for a course
export const getLecturesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const lectures = await Lecture.find({ courseId })
      .populate("creator", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Lecture.countDocuments({ courseId });

    // Format response data
    const formattedLectures = lectures.map((lecture) => ({
      ...lecture.toObject(),
      data: {
        ...lecture.data,
        path: undefined,
        streamUrl: `/api/lectures/stream/${lecture._id}`,
        downloadUrl: `/api/lectures/download/${lecture._id}`,
      },
    }));

    res.status(200).json({
      success: true,
      data: formattedLectures,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalLectures: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching course lectures:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course lectures",
    });
  }
};

// Controller to update lecture details
export const updateLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { title, description } = req.body;

    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    // Update fields
    if (title) lecture.title = title.trim();
    if (description !== undefined) lecture.description = description.trim();

    await lecture.save();

    res.status(200).json({
      success: true,
      message: "Lecture updated successfully",
      data: lecture,
    });
  } catch (error) {
    console.error("Error updating lecture:", error);
    res.status(500).json({
      success: false,
      message: "Error updating lecture",
    });
  }
};

// Controller to delete video lecture
export const deleteVideoLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    // Delete video file from filesystem
    const fileDeleted = deleteFile(lecture.data.path);

    if (!fileDeleted) {
      console.warn(`Warning: Could not delete file at ${lecture.data.path}`);
    }

    // Delete lecture from database
    await Lecture.findByIdAndDelete(lectureId);

    res.status(200).json({
      success: true,
      message: "Video lecture deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting video lecture:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting video lecture",
    });
  }
};

// Get video metadata
export const getVideoMetadata = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);

    if (!lecture || lecture.lectureType !== "video") {
      return res.status(404).json({
        success: false,
        message: "Video lecture not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: lecture._id,
        title: lecture.title,
        description: lecture.description,
        duration: lecture.data.duration || null,
        size: lecture.data.size,
        mimetype: lecture.data.mimetype,
        originalName: lecture.data.originalName,
        uploadDate: lecture.data.uploadDate,
        createdAt: lecture.createdAt,
        updatedAt: lecture.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching video metadata:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching video metadata",
    });
  }
};

// Controller to mark lecture as complete
export const markLectureCompleted = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const userId = req.user._id; // Get user ID from request

    // Check if lecture exists
    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    // Check if completion record already exists
    let completion = await LectureCompletion.findOne({
      lectureId,
      userId,
    });
    if (!completion) {
      // Create new completion record
      completion = new LectureCompletion({
        lectureId,
        userId,
        courseId: lecture.courseId,
        completedAt: new Date(),
      });
    } else {
      // Update existing completion record
      completion.completedAt = new Date();
    }
    await completion.save();

    // Update enrollment progress
    await updateEnrollmentProgress(userId, lecture.courseId);

    res.status(200).json({
      success: true,
      message: "Lecture completion status updated",
      data: completion,
    });
  } catch (error) {
    console.error("Error updating lecture completion:", error);
    res.status(500).json({
      success: false,
      message: "Error updating lecture completion",
    });
  }
};

// Controller to unmark lecture as complete
export const unmarkLectureCompleted = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const userId = req.user._id;

    // Find and delete completion record
    const completion = await LectureCompletion.findOneAndDelete({
      userId,
      lectureId,
    });

    if (!completion) {
      return res.status(404).json({
        success: false,
        message: "Lecture completion not found",
      });
    }

    // Update enrollment progress
    await updateEnrollmentProgress(userId, completion.courseId);

    res.status(200).json({
      success: true,
      message: "Lecture unmarked as completed successfully",
    });
  } catch (error) {
    console.error("Error unmarking lecture as completed:", error);
    res.status(500).json({
      success: false,
      message: "Error unmarking lecture as completed",
    });
  }
};

// Get user's completed lectures for a course
export const getUserCompletedLectures = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const completedLectures = await LectureCompletion.find({
      userId,
      courseId,
    })
      .populate("lectureId", "title description")
      .sort({ completedAt: -1 });

    res.status(200).json({
      success: true,
      data: completedLectures,
    });
  } catch (error) {
    console.error("Error fetching completed lectures:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching completed lectures",
    });
  }
};

// Get course progress for a user
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Get total lectures in course
    const totalLectures = await Lecture.countDocuments({ courseId });

    // Get completed lectures count
    const completedLecturesCount = await LectureCompletion.countDocuments({
      userId,
      courseId,
    });

    // Calculate progress percentage
    const progressPercentage =
      totalLectures > 0
        ? Math.round((completedLecturesCount / totalLectures) * 100)
        : 0;

    // Get completed lecture IDs
    const completedLectures = await LectureCompletion.find({
      userId,
      courseId,
    }).select("lectureId");

    const completedLectureIds = completedLectures.map((comp) =>
      comp.lectureId.toString()
    );

    res.status(200).json({
      success: true,
      data: {
        totalLectures,
        completedLectures: completedLecturesCount,
        progressPercentage,
        completedLectureIds,
      },
    });
  } catch (error) {
    console.error("Error fetching course progress:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course progress",
    });
  }
};

// Helper function to update enrollment progress
const updateEnrollmentProgress = async (userId, courseId) => {
  try {
    // Get total lectures in course
    const totalLectures = await Lecture.countDocuments({ courseId });

    // Get completed lectures count
    const completedLecturesCount = await LectureCompletion.countDocuments({
      userId,
      courseId,
    });

    // Calculate progress percentage
    const progress =
      totalLectures > 0
        ? Math.round((completedLecturesCount / totalLectures) * 100)
        : 0;

    // Update enrollment
    const updateData = { progress };

    // Mark as completed if 100% progress
    if (progress === 100) {
      updateData.completed = true;
      updateData.completedAt = new Date();
    } else {
      updateData.completed = false;
      updateData.completedAt = null;
    }

    await Enrollment.findOneAndUpdate({ userId, courseId }, updateData, {
      new: true,
    });
  } catch (error) {
    console.error("Error updating enrollment progress:", error);
  }
};

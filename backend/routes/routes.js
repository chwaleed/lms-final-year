import express from "express";
import { registerUser, verifyToken } from "../controllers/auth.controller.js";
import { loginUser, logoutUser } from "../controllers/auth.controller.js";
import {
  requireInstructor,
  requireStudent,
  verifyJWT,
  optionalAuth,
} from "../midlewares/auth.middlware.js";
import {
  createCourse,
  getCourseById,
  getCoursesWithPagination,
  updateCourse,
  uploadCourseThumbnail,
  deleteCourseThumbnail,
  getAllCoursesWithPagination,
  deleteCourse,
} from "../controllers/course.controller.js";
import {
  createVideoLecture,
  streamVideoFile,
  downloadVideoFile,
  getLectureById,
  getLecturesByCourse,
  updateLecture,
  deleteVideoLecture,
  getVideoMetadata,
  markLectureCompleted,
  unmarkLectureCompleted,
  getUserCompletedLectures,
  getCourseProgress,
} from "../controllers/lecture.controller.js";
import {
  enrollInCourse,
  getUserEnrollments,
  getInstructorStudents,
  getCourseEnrollments,
} from "../controllers/enrollment.controller.js";
import { thumbnailUpload } from "../utils/upload.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.post("/logout", verifyJWT, logoutUser);

router.get("/verify", verifyJWT, verifyToken);

// Instructor routes
router.post(
  "/instructor/create-course",
  verifyJWT,
  requireInstructor,
  createCourse
);
router.patch(
  "/instructor/course/update/:courseId",
  verifyJWT,
  requireInstructor,
  updateCourse
);
router.post(
  "/instructor/course/:courseId/upload-thumbnail",
  verifyJWT,
  requireInstructor,
  thumbnailUpload.single("thumbnail"),
  uploadCourseThumbnail
);
router.delete(
  "/instructor/course/:courseId/delete-thumbnail",
  verifyJWT,
  requireInstructor,
  deleteCourseThumbnail
);

// Course Routes
router.get(
  "/course/enrolled-courses",
  verifyJWT,
  requireStudent,
  getUserEnrollments
);
router.get(
  "/instructor/students",
  verifyJWT,
  requireInstructor,
  getInstructorStudents
);
router.get(
  "/instructor/course/:courseId/enrollments",
  verifyJWT,
  requireInstructor,
  getCourseEnrollments
);
router.get("/courses/paginated", verifyJWT, getCoursesWithPagination);
router.delete(
  "/instructor/delete/course/:courseId",
  verifyJWT,
  requireInstructor,
  deleteCourse
);
router.get("/course/:courseId", getCourseById);

router.get("/all-courses", optionalAuth, getAllCoursesWithPagination);
router.post(
  "/course/enrollment/:courseId",
  verifyJWT,
  requireStudent,
  enrollInCourse
);

// Lecture Routes
router.post(
  "/instructor/course/create-lecture",
  verifyJWT,
  requireInstructor,
  createVideoLecture
);
router.get("/lectures/stream/:lectureId", streamVideoFile);
router.get("/lectures/download/:lectureId", downloadVideoFile);
router.get("/lecture/:lectureId", getLectureById);
router.get("/course/:courseId/lectures", getLecturesByCourse);
router.patch(
  "/instructor/lecture/:lectureId",
  verifyJWT,
  requireInstructor,
  updateLecture
);
router.delete(
  "/instructor/lecture/:lectureId",
  verifyJWT,
  requireInstructor,
  deleteVideoLecture
);
router.get("/lecture/:lectureId/metadata", getVideoMetadata);

// Lecture completion routes
router.post(
  "/lecture/:lectureId/complete",
  verifyJWT,
  requireStudent,
  markLectureCompleted
);
router.delete(
  "/lecture/:lectureId/complete",
  verifyJWT,
  requireStudent,
  unmarkLectureCompleted
);
router.get(
  "/course/:courseId/completed-lectures",
  verifyJWT,
  requireStudent,
  getUserCompletedLectures
);
router.get(
  "/course/:courseId/progress",
  verifyJWT,
  requireStudent,
  getCourseProgress
);

router.get("/profile", verifyJWT, (req, res) => {
  const userResponse = {
    _id: req.user._id,
    fullname: req.user.fullname,
    email: req.user.email,
    username: req.user.username,
    role: req.user.role,
    createdAt: req.user.createdAt,
    updatedAt: req.user.updatedAt,
  };

  res.json({
    success: true,
    data: userResponse,
    message: "Profile retrieved successfully",
  });
});

export default router;

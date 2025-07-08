import Enrollment from "../models/Enrollment.model.js";
import Course from "../models/Course.model.js";
import User from "../models/User.model.js";
import LectureCompletion from "../models/LectureCompletion.model.js";
import Lecture from "../models/Lecture.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Enroll a student in a course
export const enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json(new ApiResponse(404, null, "Course not found"));
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  if (user.role !== "student") {
    return res
      .status(403)
      .json(new ApiResponse(403, null, "Only students can enroll in courses"));
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({ userId, courseId });
  if (existingEnrollment) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Already enrolled in this course"));
  }

  // Create enrollment
  const enrollment = new Enrollment({ userId, courseId });
  await enrollment.save();

  await Course.findByIdAndUpdate(courseId, {
    $inc: { enrolledStudents: 1 },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, enrollment, "Successfully enrolled in course"));
});

// Unenroll a student from a course
export const unenrollFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Find and delete enrollment
    const enrollment = await Enrollment.findOneAndDelete({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Update course enrolled students count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrolledStudents: -1 },
    });

    res.status(200).json({ message: "Successfully unenrolled from course" });
  } catch (error) {
    console.error("Error unenrolling from course:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all enrollments for a user
export const getUserEnrollments = asyncHandler(async (req, res) => {
  console.log(req.user);
  const userId = req.user._id;
  console.log("here is the userId:", userId);
  const enrollments = await Enrollment.find({ userId })
    .populate({
      path: "courseId",
      select: "title description thumbnail price userId",
      populate: {
        path: "userId",
        select: "fullname name email",
      },
    })
    .sort({ enrolledAt: -1 });

  // Add progress information for each enrollment
  const enrollmentsWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const courseId = enrollment.courseId._id;

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

      return {
        ...enrollment.toObject(),
        progressDetails: {
          totalLectures,
          completedLectures: completedLecturesCount,
          progressPercentage,
        },
      };
    })
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        enrollmentsWithProgress,
        "User enrollments fetched successfully"
      )
    );
});

// Get all students enrolled in a course (for instructors)
export const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course exists and user is the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const enrollments = await Enrollment.find({ courseId })
      .populate("userId", "fullname email username")
      .sort({ enrolledAt: -1 });

    res.status(200).json({ enrollments });
  } catch (error) {
    console.error("Error fetching course enrollments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark course as completed
export const markCourseCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOneAndUpdate(
      { userId, courseId },
      {
        completed: true,
        completedAt: new Date(),
      },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.status(200).json({
      message: "Course marked as completed",
      enrollment,
    });
  } catch (error) {
    console.error("Error marking course as completed:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all students enrolled in instructor's courses
export const getInstructorStudents = async (req, res) => {
  try {
    const instructorId = req.user._id;

    // First, get all courses created by this instructor
    const instructorCourses = await Course.find({ userId: instructorId });

    if (instructorCourses.length === 0) {
      return res.status(200).json({
        students: [],
        message: "No courses found for this instructor",
      });
    }

    const courseIds = instructorCourses.map((course) => course._id);

    // Get all enrollments for instructor's courses
    const enrollments = await Enrollment.find({
      courseId: { $in: courseIds },
    })
      .populate({
        path: "userId",
        select: "fullname email username createdAt",
      })
      .populate({
        path: "courseId",
        select: "title description",
      })
      .sort({ enrolledAt: -1 });

    // Format the data for the frontend
    const studentsData = enrollments.map((enrollment) => ({
      _id: enrollment._id,
      studentName: enrollment.userId.fullname,
      studentEmail: enrollment.userId.email,
      studentUsername: enrollment.userId.username,
      courseName: enrollment.courseId.title,
      courseId: enrollment.courseId._id,
      enrollmentDate: enrollment.enrolledAt,
      progress: enrollment.progress,
      completed: enrollment.completed,
      completedAt: enrollment.completedAt,
    }));

    res.status(200).json({
      students: studentsData,
      totalStudents: studentsData.length,
    });
  } catch (error) {
    console.error("Error fetching instructor students:", error);
    res.status(500).json({ message: "Server error" });
  }
};

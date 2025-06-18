import Enrollment from "../models/Enrollment.model.js";
import Course from "../models/Course.model.js";
import User from "../models/User.model.js";

// Enroll a student in a course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can enroll in courses" });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    // Create enrollment
    const enrollment = new Enrollment({ userId, courseId });
    await enrollment.save();

    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrolledStudents: 1 },
    });

    res.status(201).json({
      message: "Successfully enrolled in course",
      enrollment,
    });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).json({ message: "Server error" });
  }
};

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
export const getUserEnrollments = async (req, res) => {
  try {
    console.log(req.user);
    const userId = req.user._id;
    console.log("here is the userId:", userId);

    const enrollments = await Enrollment.find({ userId })
      .populate("courseId", "title description thumbnail price")
      .sort({ enrolledAt: -1 });

    res.status(200).json({ enrollments });
  } catch (error) {
    console.error("Error fetching user enrollments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

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

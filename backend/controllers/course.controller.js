import Course from "../models/Course.model.js";
import Enrollment from "../models/Enrollment.model.js";
import Lecture from "../models/Lecture.model.js";
import LectureCompletion from "../models/LectureCompletion.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import path from "path";
import fs from "fs";

export const createCourse = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { _id: userId } = req.user;

  if (!title || !userId) {
    throw new ApiError(400, "Title and User ID are required.");
  }

  const newCourse = new Course({
    title,
    description: description || "",
    userId,
  });

  const savedCourse = await newCourse.save();

  return res
    .status(201)
    .json(new ApiResponse(201, savedCourse, "Course created successfully."));
});

// Get all courses by user ID
export const getCoursesByUserId = asyncHandler(async (req, res) => {
  const { _id: requestingUserId } = req.user;

  if (!requestingUserId) {
    throw new ApiError(400, "User ID is required.");
  }

  const courses = await Course.find({ userId: requestingUserId });

  if (!courses || courses.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No courses found for this user."));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, courses, "Courses retrieved successfully."));
});

export const getCourseById = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!courseId) {
    throw new ApiError(400, "Course ID is required.");
  }

  const course = await Course.findById(courseId).populate(
    "userId",
    "name email"
  );

  if (!course) {
    throw new ApiError(404, "Course not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, course, "Course retrieved successfully."));
});

// Get courses with pagination and search
export const getCoursesWithPagination = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  let userId = null;

  // Get userId from authenticated user
  if (req.user && req.user._id) {
    userId = req.user._id;
  }

  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 items per page
  const skip = (pageNumber - 1) * limitNumber;

  let searchQuery = {};

  // Add search filters
  if (search.trim()) {
    searchQuery.$or = [
      { title: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
    ];
  }

  // Filter by userId if authenticated user exists
  if (userId) {
    searchQuery.userId = userId;
  }

  // Build sort object
  const sortObject = {};
  const validSortFields = [
    "title",
    "createdAt",
    "updatedAt",
    "enrolledStudents",
  ];
  const validSortOrders = ["asc", "desc"];

  if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
    sortObject[sortBy] = sortOrder === "asc" ? 1 : -1;
  } else {
    sortObject.createdAt = -1; // Default sort
  }

  try {
    // Get total count for pagination
    const totalCourses = await Course.countDocuments(searchQuery);

    // Get courses with pagination

    const courses = await Course.find(searchQuery)
      .populate("userId", "name email")
      .sort(sortObject)
      .skip(skip)
      .limit(limitNumber)
      .lean(); // Use lean() for better performance
    // Calculate pagination info
    const totalPages = Math.ceil(totalCourses / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    const paginationInfo = {
      currentPage: pageNumber,
      totalPages,
      totalCourses,
      coursesPerPage: limitNumber,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? pageNumber + 1 : null,
      prevPage: hasPrevPage ? pageNumber - 1 : null,
    };

    const responseData = {
      courses,
      pagination: paginationInfo,
      searchQuery: search.trim(),
      filters: {
        userId: userId ? userId.toString() : null, // Convert ObjectId to string safely
        sortBy,
        sortOrder,
      },
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          responseData,
          totalCourses > 0
            ? `Found ${totalCourses} course(s)`
            : "No courses found matching your criteria"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error retrieving courses", [error.message]);
  }
});

export const updateCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { title, description, thumbnail, price } = req.body;
  const { _id: userId } = req.user;

  if (!courseId) {
    throw new ApiError(400, "Course ID is required.");
  }

  if (!title) {
    throw new ApiError(400, "Course title is required.");
  }

  const course = await Course.findOne({ _id: courseId, userId });

  if (!course) {
    throw new ApiError(
      404,
      "Course not found or you do not have permission to update it."
    );
  }

  if (title) course.title = title;
  if (description) course.description = description;
  if (thumbnail) course.thumbnail = thumbnail;
  if (price !== undefined) course.price = price;

  const updatedCourse = await course.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCourse, "Course updated successfully."));
});

// Upload course thumbnail
export const uploadCourseThumbnail = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { _id: userId } = req.user;

  console.log("Upload request received:", {
    courseId,
    userId,
    hasFile: !!req.file,
  });

  if (!courseId) {
    throw new ApiError(400, "Course ID is required.");
  }

  if (!req.file) {
    throw new ApiError(400, "No image file provided.");
  }

  console.log("File details:", {
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });

  // Check if course exists and belongs to the user
  const course = await Course.findOne({ _id: courseId, userId });

  if (!course) {
    // Clean up uploaded file if course not found
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    throw new ApiError(
      404,
      "Course not found or you do not have permission to update it."
    );
  }

  // Delete old thumbnail if it exists and is not a placeholder
  if (
    course.thumbnail &&
    course.thumbnail !== "https://placehold.co/600x400.png" &&
    !course.thumbnail.startsWith("http")
  ) {
    const oldImagePath = path.join(process.cwd(), course.thumbnail);
    if (fs.existsSync(oldImagePath)) {
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error("Error deleting old thumbnail:", err);
        else console.log("Old thumbnail deleted:", oldImagePath);
      });
    }
  }

  // Update course with new thumbnail path (relative path)
  const thumbnailPath = req.file.path.replace(/\\/g, "/"); // Normalize path separators
  course.thumbnail = thumbnailPath;
  await course.save();

  // Return the updated course with the image URL
  const imageUrl = `${req.protocol}://${req.get("host")}/${thumbnailPath}`;

  console.log("Thumbnail updated successfully:", { thumbnailPath, imageUrl });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        course,
        imageUrl,
        thumbnailPath,
      },
      "Course thumbnail uploaded successfully."
    )
  );
});

// Delete course thumbnail
export const deleteCourseThumbnail = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { _id: userId } = req.user;

  if (!courseId) {
    throw new ApiError(400, "Course ID is required.");
  }

  // Check if course exists and belongs to the user
  const course = await Course.findOne({ _id: courseId, userId });

  if (!course) {
    throw new ApiError(
      404,
      "Course not found or you do not have permission to update it."
    );
  }

  // Delete old thumbnail if it exists
  if (
    course.thumbnail &&
    course.thumbnail !== "https://placehold.co/600x400.png"
  ) {
    const oldImagePath = path.join(process.cwd(), course.thumbnail);
    if (fs.existsSync(oldImagePath)) {
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error("Error deleting thumbnail:", err);
      });
    }
  }

  // Reset thumbnail to default
  course.thumbnail = "https://placehold.co/600x400.png";
  await course.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, course, "Course thumbnail deleted successfully.")
    );
});

// Get all courses with pagination and search (public view)
export const getAllCoursesWithPagination = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    category = "",
    minPrice = 0,
    maxPrice = null,
    excludeEnrolled = "false",
  } = req.query;

  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 items per page
  const skip = (pageNumber - 1) * limitNumber;

  let searchQuery = {};

  // If excluding enrolled courses and user is authenticated
  if (excludeEnrolled === "true" && req.user) {
    const userEnrollments = await Enrollment.find({
      userId: req.user._id,
    }).select("courseId");
    const enrolledCourseIds = userEnrollments.map(
      (enrollment) => enrollment.courseId
    );
    searchQuery._id = { $nin: enrolledCourseIds };
  }

  // Add search filters
  if (search.trim()) {
    searchQuery.$or = [
      { title: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
    ];
  }

  // Add category filter if provided
  if (category.trim()) {
    searchQuery.category = { $regex: category.trim(), $options: "i" };
  }

  // Add price range filter
  if (minPrice >= 0 || maxPrice !== null) {
    searchQuery.price = {};
    if (minPrice >= 0) {
      searchQuery.price.$gte = parseFloat(minPrice);
    }
    if (maxPrice !== null && maxPrice >= 0) {
      searchQuery.price.$lte = parseFloat(maxPrice);
    }
  }

  // Only show published/active courses (assuming you have a status field)
  // Uncomment if you have a status field in your Course model
  // searchQuery.status = "published";

  // Build sort object
  const sortObject = {};
  const validSortFields = [
    "title",
    "createdAt",
    "updatedAt",
    "enrolledStudents",
    "price",
    "rating",
  ];
  const validSortOrders = ["asc", "desc"];

  if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
    sortObject[sortBy] = sortOrder === "asc" ? 1 : -1;
  } else {
    sortObject.createdAt = -1; // Default sort
  }

  try {
    // Get total count for pagination
    const totalCourses = await Course.countDocuments(searchQuery); // Get courses with pagination
    const courses = await Course.find(searchQuery)
      .populate("userId", "fullname email avatar") // Include instructor info
      .sort(sortObject)
      .skip(skip)
      .limit(limitNumber)
      .select("-__v") // Exclude version field
      .lean(); // Use lean() for better performance

    // Add lecture count to each course
    const coursesWithLectureCount = await Promise.all(
      courses.map(async (course) => {
        const lectureCount = await Lecture.countDocuments({
          courseId: course._id,
        });
        return {
          ...course,
          lectureCount,
        };
      })
    );

    // Calculate pagination info
    const totalPages = Math.ceil(totalCourses / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    const paginationInfo = {
      currentPage: pageNumber,
      totalPages,
      totalCourses,
      coursesPerPage: limitNumber,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? pageNumber + 1 : null,
      prevPage: hasPrevPage ? pageNumber - 1 : null,
    };
    const responseData = {
      courses: coursesWithLectureCount,
      pagination: paginationInfo,
      searchQuery: search.trim(),
      filters: {
        category: category.trim(),
        minPrice: minPrice >= 0 ? parseFloat(minPrice) : null,
        maxPrice:
          maxPrice !== null && maxPrice >= 0 ? parseFloat(maxPrice) : null,
        sortBy,
        sortOrder,
      },
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          responseData,
          totalCourses > 0
            ? `Found ${totalCourses} course(s)`
            : "No courses found matching your criteria"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error retrieving courses", [error.message]);
  }
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { _id: userId } = req.user;

  if (!courseId) {
    throw new ApiError(400, "Course ID is required.");
  }

  // Check if course exists and belongs to the user
  const course = await Course.findOne({ _id: courseId, userId });

  if (!course) {
    throw new ApiError(
      404,
      "Course not found or you do not have permission to delete it."
    );
  }
  // Delete all enrollments for this course first
  const deletedEnrollments = await Enrollment.deleteMany({ courseId });
  console.log(
    `Deleted ${deletedEnrollments.deletedCount} enrollments for course ${courseId}`
  );

  // Delete all lecture completions for this course
  const deletedCompletions = await LectureCompletion.deleteMany({ courseId });
  console.log(
    `Deleted ${deletedCompletions.deletedCount} lecture completions for course ${courseId}`
  );

  // Delete all lectures for this course
  const deletedLectures = await Lecture.deleteMany({ courseId });
  console.log(
    `Deleted ${deletedLectures.deletedCount} lectures for course ${courseId}`
  );

  // Delete course thumbnail if it exists and is not a placeholder
  if (
    course.thumbnail &&
    course.thumbnail !== "https://placehold.co/600x400.png" &&
    !course.thumbnail.startsWith("http")
  ) {
    const imagePath = path.join(process.cwd(), course.thumbnail);
    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting course thumbnail:", err);
        else console.log("Course thumbnail deleted:", imagePath);
      });
    }
  }

  // Delete the course
  await Course.findByIdAndDelete(courseId);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        deletedCourseId: courseId,
        deletedEnrollments: deletedEnrollments.deletedCount,
        deletedCompletions: deletedCompletions.deletedCount,
        deletedLectures: deletedLectures.deletedCount,
      },
      `Course deleted successfully. ${deletedEnrollments.deletedCount} enrollments, ${deletedCompletions.deletedCount} lecture completions, and ${deletedLectures.deletedCount} lectures were also removed.`
    )
  );
});

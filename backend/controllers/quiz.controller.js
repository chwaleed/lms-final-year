import Quiz from "../models/Quiz.model.js";
import QuizAttempt from "../models/QuizAttempt.model.js";
import Course from "../models/Course.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a new quiz
export const createQuiz = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    courseId,
    duration,
    passingScore,
    attempts,
    showResults,
    shuffleQuestions,
    shuffleAnswers,
    dueDate,
    availableFrom,
    availableTo,
  } = req.body;
  const { _id: instructorId } = req.user;

  if (!title || !courseId) {
    throw new ApiError(400, "Title and Course ID are required.");
  }

  // Verify the course belongs to the instructor
  const course = await Course.findOne({ _id: courseId, userId: instructorId });
  if (!course) {
    throw new ApiError(
      403,
      "You don't have permission to create quizzes for this course."
    );
  }

  const newQuiz = new Quiz({
    title,
    description,
    courseId,
    instructorId,
    duration: duration || 30,
    passingScore: passingScore || 70,
    attempts: attempts || 1,
    showResults: showResults !== undefined ? showResults : true,
    shuffleQuestions: shuffleQuestions || false,
    shuffleAnswers: shuffleAnswers || false,
    dueDate,
    availableFrom,
    availableTo,
  });

  const savedQuiz = await newQuiz.save();

  return res
    .status(201)
    .json(new ApiResponse(201, savedQuiz, "Quiz created successfully."));
});

// Get all quizzes for a course
export const getQuizzesByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { _id: userId } = req.user;

  if (!courseId) {
    throw new ApiError(400, "Course ID is required.");
  }

  // Verify the course belongs to the instructor
  const course = await Course.findOne({ _id: courseId, userId });
  if (!course) {
    throw new ApiError(
      403,
      "You don't have permission to view quizzes for this course."
    );
  }

  const quizzes = await Quiz.find({ courseId, instructorId: userId }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, quizzes, "Quizzes retrieved successfully."));
});

// Get a specific quiz
export const getQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { _id: userId } = req.user;

  if (!quizId) {
    throw new ApiError(400, "Quiz ID is required.");
  }

  const quiz = await Quiz.findOne({
    _id: quizId,
    instructorId: userId,
  }).populate("courseId", "title");

  if (!quiz) {
    throw new ApiError(
      404,
      "Quiz not found or you don't have permission to view it."
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, quiz, "Quiz retrieved successfully."));
});

// Update quiz
export const updateQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { _id: userId } = req.user;
  const updateData = req.body;

  if (!quizId) {
    throw new ApiError(400, "Quiz ID is required.");
  }

  const quiz = await Quiz.findOne({ _id: quizId, instructorId: userId });
  if (!quiz) {
    throw new ApiError(
      404,
      "Quiz not found or you don't have permission to update it."
    );
  }

  // Don't allow updating courseId and instructorId
  delete updateData.courseId;
  delete updateData.instructorId;

  const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, updateData, {
    new: true,
    runValidators: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedQuiz, "Quiz updated successfully."));
});

// Delete quiz
export const deleteQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { _id: userId } = req.user;

  if (!quizId) {
    throw new ApiError(400, "Quiz ID is required.");
  }

  const quiz = await Quiz.findOne({ _id: quizId, instructorId: userId });
  if (!quiz) {
    throw new ApiError(
      404,
      "Quiz not found or you don't have permission to delete it."
    );
  }

  await Quiz.findByIdAndDelete(quizId);
  // Also delete all quiz attempts
  await QuizAttempt.deleteMany({ quizId });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Quiz deleted successfully."));
});

// Add question to quiz
export const addQuestion = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { question, options, explanation, points } = req.body;
  const { _id: userId } = req.user;

  if (
    !quizId ||
    !question ||
    !options ||
    !Array.isArray(options) ||
    options.length < 2
  ) {
    throw new ApiError(
      400,
      "Quiz ID, question, and at least 2 options are required."
    );
  }

  // Validate that at least one option is correct
  const hasCorrectOption = options.some((option) => option.isCorrect === true);
  if (!hasCorrectOption) {
    throw new ApiError(400, "At least one option must be marked as correct.");
  }

  const quiz = await Quiz.findOne({ _id: quizId, instructorId: userId });
  if (!quiz) {
    throw new ApiError(
      404,
      "Quiz not found or you don't have permission to modify it."
    );
  }

  const newQuestion = {
    question,
    options,
    explanation,
    points: points || 1,
  };

  quiz.questions.push(newQuestion);
  await quiz.save();

  return res
    .status(200)
    .json(new ApiResponse(200, quiz, "Question added successfully."));
});

// Update question
export const updateQuestion = asyncHandler(async (req, res) => {
  const { quizId, questionId } = req.params;
  const { question, options, explanation, points } = req.body;
  const { _id: userId } = req.user;

  if (!quizId || !questionId) {
    throw new ApiError(400, "Quiz ID and Question ID are required.");
  }

  const quiz = await Quiz.findOne({ _id: quizId, instructorId: userId });
  if (!quiz) {
    throw new ApiError(
      404,
      "Quiz not found or you don't have permission to modify it."
    );
  }

  const questionIndex = quiz.questions.findIndex(
    (q) => q._id.toString() === questionId
  );
  if (questionIndex === -1) {
    throw new ApiError(404, "Question not found.");
  }

  // Update question fields
  if (question) quiz.questions[questionIndex].question = question;
  if (options) {
    // Validate that at least one option is correct
    const hasCorrectOption = options.some(
      (option) => option.isCorrect === true
    );
    if (!hasCorrectOption) {
      throw new ApiError(400, "At least one option must be marked as correct.");
    }
    quiz.questions[questionIndex].options = options;
  }
  if (explanation !== undefined)
    quiz.questions[questionIndex].explanation = explanation;
  if (points !== undefined) quiz.questions[questionIndex].points = points;

  await quiz.save();

  return res
    .status(200)
    .json(new ApiResponse(200, quiz, "Question updated successfully."));
});

// Delete question
export const deleteQuestion = asyncHandler(async (req, res) => {
  const { quizId, questionId } = req.params;
  const { _id: userId } = req.user;

  if (!quizId || !questionId) {
    throw new ApiError(400, "Quiz ID and Question ID are required.");
  }

  const quiz = await Quiz.findOne({ _id: quizId, instructorId: userId });
  if (!quiz) {
    throw new ApiError(
      404,
      "Quiz not found or you don't have permission to modify it."
    );
  }

  const initialLength = quiz.questions.length;
  quiz.questions = quiz.questions.filter(
    (q) => q._id.toString() !== questionId
  );

  if (quiz.questions.length === initialLength) {
    throw new ApiError(404, "Question not found.");
  }

  await quiz.save();

  return res
    .status(200)
    .json(new ApiResponse(200, quiz, "Question deleted successfully."));
});

// Publish/Unpublish quiz
export const toggleQuizPublish = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { _id: userId } = req.user;

  if (!quizId) {
    throw new ApiError(400, "Quiz ID is required.");
  }

  const quiz = await Quiz.findOne({ _id: quizId, instructorId: userId });
  if (!quiz) {
    throw new ApiError(
      404,
      "Quiz not found or you don't have permission to modify it."
    );
  }

  if (quiz.questions.length === 0) {
    throw new ApiError(400, "Cannot publish a quiz without questions.");
  }

  quiz.isPublished = !quiz.isPublished;
  await quiz.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        quiz,
        `Quiz ${quiz.isPublished ? "published" : "unpublished"} successfully.`
      )
    );
});

// Get quiz attempts/results
export const getQuizAttempts = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { _id: userId } = req.user;

  if (!quizId) {
    throw new ApiError(400, "Quiz ID is required.");
  }

  const quiz = await Quiz.findOne({ _id: quizId, instructorId: userId });
  if (!quiz) {
    throw new ApiError(
      404,
      "Quiz not found or you don't have permission to view it."
    );
  }

  const attempts = await QuizAttempt.find({ quizId })
    .populate("studentId", "name email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, attempts, "Quiz attempts retrieved successfully.")
    );
});

// Get quiz statistics
export const getQuizStats = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { _id: userId } = req.user;

  if (!quizId) {
    throw new ApiError(400, "Quiz ID is required.");
  }

  const quiz = await Quiz.findOne({ _id: quizId, instructorId: userId });
  if (!quiz) {
    throw new ApiError(
      404,
      "Quiz not found or you don't have permission to view it."
    );
  }

  const attempts = await QuizAttempt.find({ quizId, isCompleted: true });

  const stats = {
    totalAttempts: attempts.length,
    averageScore:
      attempts.length > 0
        ? attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
          attempts.length
        : 0,
    passRate:
      attempts.length > 0
        ? (attempts.filter((attempt) => attempt.isPassed).length /
            attempts.length) *
          100
        : 0,
    highestScore:
      attempts.length > 0
        ? Math.max(...attempts.map((attempt) => attempt.percentage))
        : 0,
    lowestScore:
      attempts.length > 0
        ? Math.min(...attempts.map((attempt) => attempt.percentage))
        : 0,
    averageTimeSpent:
      attempts.length > 0
        ? attempts.reduce((sum, attempt) => sum + attempt.totalTimeSpent, 0) /
          attempts.length
        : 0,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, stats, "Quiz statistics retrieved successfully.")
    );
});

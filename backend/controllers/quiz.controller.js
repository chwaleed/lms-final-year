import Quiz from "../models/Quiz.model.js";
import QuizAttempt from "../models/QuizAttempt.model.js";
import Course from "../models/Course.model.js";
import Enrollment from "../models/Enrollment.model.js";
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

// Student Quiz Functions

// Get published quizzes for enrolled course
export const getStudentQuizzes = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { _id: studentId } = req.user;

  if (!courseId) {
    throw new ApiError(400, "Course ID is required.");
  }

  // Check if student is enrolled in the course
  const enrollment = await Enrollment.findOne({
    courseId,
    userId: studentId,
  });
  if (!enrollment) {
    throw new ApiError(403, "You are not enrolled in this course.");
  }

  // Get published quizzes for the course
  const quizzes = await Quiz.find({ courseId, isPublished: true })
    .select("-questions.options.isCorrect")
    .sort({ createdAt: -1 });

  // Get student's attempts for each quiz
  const quizzesWithAttempts = await Promise.all(
    quizzes.map(async (quiz) => {
      const attempts = await QuizAttempt.find({
        quizId: quiz._id,
        studentId,
      }).sort({ createdAt: -1 });

      const quizObj = quiz.toObject();
      quizObj.studentAttempts = attempts.length;
      quizObj.bestScore =
        attempts.length > 0
          ? Math.max(...attempts.map((a) => a.percentage))
          : null;
      quizObj.lastAttempt = attempts.length > 0 ? attempts[0] : null;

      // Check if quiz is available based on dates
      const now = new Date();
      quizObj.isAvailable = true;

      if (quiz.availableFrom && now < new Date(quiz.availableFrom)) {
        quizObj.isAvailable = false;
        quizObj.availabilityStatus = "not_yet_available";
      } else if (quiz.availableTo && now > new Date(quiz.availableTo)) {
        quizObj.isAvailable = false;
        quizObj.availabilityStatus = "expired";
      } else if (quiz.dueDate && now > new Date(quiz.dueDate)) {
        quizObj.availabilityStatus = "overdue";
      } else {
        quizObj.availabilityStatus = "available";
      }

      // Check if student can take the quiz (attempt limit)
      quizObj.canTakeQuiz =
        quizObj.isAvailable && attempts.length < quiz.attempts;

      return quizObj;
    })
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        quizzesWithAttempts,
        "Student quizzes retrieved successfully."
      )
    );
});

// Get quiz for student to take (without correct answers)
export const getStudentQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { _id: studentId } = req.user;

  if (!quizId) {
    throw new ApiError(400, "Quiz ID is required.");
  }

  const quiz = await Quiz.findOne({ _id: quizId, isPublished: true }).populate(
    "courseId",
    "title"
  );

  if (!quiz) {
    throw new ApiError(404, "Quiz not found or not published.");
  }

  // Check if student is enrolled in the course
  const enrollment = await Enrollment.findOne({
    courseId: quiz.courseId._id,
    userId: studentId,
  });
  if (!enrollment) {
    throw new ApiError(403, "You are not enrolled in this course.");
  }

  // Check availability
  const now = new Date();
  if (quiz.availableFrom && now < new Date(quiz.availableFrom)) {
    throw new ApiError(400, "Quiz is not yet available.");
  }
  if (quiz.availableTo && now > new Date(quiz.availableTo)) {
    throw new ApiError(400, "Quiz is no longer available.");
  }

  // Check attempt limit
  const studentAttempts = await QuizAttempt.find({ quizId, studentId });
  if (studentAttempts.length >= quiz.attempts) {
    throw new ApiError(
      400,
      "You have reached the maximum number of attempts for this quiz."
    );
  }

  // Remove correct answers from options
  const quizForStudent = quiz.toObject();
  quizForStudent.questions = quiz.questions.map((question) => ({
    ...question.toObject(),
    options: question.options.map((option) => ({
      text: option.text,
      _id: option._id,
    })),
  }));

  // Shuffle questions if enabled
  if (quiz.shuffleQuestions) {
    quizForStudent.questions = shuffleArray(quizForStudent.questions);
  }

  // Shuffle answers if enabled
  if (quiz.shuffleAnswers) {
    quizForStudent.questions = quizForStudent.questions.map((question) => ({
      ...question,
      options: shuffleArray(question.options),
    }));
  }

  quizForStudent.studentAttempts = studentAttempts.length;

  return res
    .status(200)
    .json(new ApiResponse(200, quizForStudent, "Quiz retrieved for student."));
});

// Start quiz attempt
export const startQuizAttempt = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { _id: studentId } = req.user;

  if (!quizId) {
    throw new ApiError(400, "Quiz ID is required.");
  }

  const quiz = await Quiz.findOne({ _id: quizId, isPublished: true });
  if (!quiz) {
    throw new ApiError(404, "Quiz not found or not published.");
  }

  // Check if student is enrolled
  const enrollment = await Enrollment.findOne({
    courseId: quiz.courseId,
    userId: studentId,
  });
  if (!enrollment) {
    throw new ApiError(403, "You are not enrolled in this course.");
  }

  // Check if there's already an ongoing attempt
  const ongoingAttempt = await QuizAttempt.findOne({
    quizId,
    studentId,
    isCompleted: false,
  });

  if (ongoingAttempt) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          ongoingAttempt,
          "Quiz attempt already in progress."
        )
      );
  }

  // Check attempt limit
  const completedAttempts = await QuizAttempt.find({
    quizId,
    studentId,
    isCompleted: true,
  });

  if (completedAttempts.length >= quiz.attempts) {
    throw new ApiError(400, "Maximum attempts reached.");
  }

  // Calculate max points
  const maxPoints = quiz.questions.reduce(
    (total, question) => total + question.points,
    0
  );

  // Create new attempt
  const newAttempt = new QuizAttempt({
    quizId,
    studentId,
    courseId: quiz.courseId,
    startTime: new Date(),
    attemptNumber: completedAttempts.length + 1,
    maxPoints,
    answers: [],
  });

  const savedAttempt = await newAttempt.save();

  return res
    .status(201)
    .json(
      new ApiResponse(201, savedAttempt, "Quiz attempt started successfully.")
    );
});

// Submit quiz answer
export const submitQuizAnswer = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const { questionId, selectedOption, timeSpent } = req.body;
  const { _id: studentId } = req.user;

  if (!attemptId || !questionId || selectedOption === undefined) {
    throw new ApiError(
      400,
      "Attempt ID, Question ID, and selected option are required."
    );
  }

  const attempt = await QuizAttempt.findOne({
    _id: attemptId,
    studentId,
    isCompleted: false,
  });

  if (!attempt) {
    throw new ApiError(404, "Quiz attempt not found or already completed.");
  }

  const quiz = await Quiz.findById(attempt.quizId);
  if (!quiz) {
    throw new ApiError(404, "Quiz not found.");
  }

  const question = quiz.questions.id(questionId);
  if (!question) {
    throw new ApiError(404, "Question not found.");
  }

  // Check if answer already exists
  const existingAnswerIndex = attempt.answers.findIndex(
    (answer) => answer.questionId.toString() === questionId
  );

  const isCorrect = question.options[selectedOption]?.isCorrect || false;
  const pointsEarned = isCorrect ? question.points : 0;

  const answerData = {
    questionId,
    selectedOption,
    isCorrect,
    pointsEarned,
    timeSpent: timeSpent || 0,
  };

  if (existingAnswerIndex >= 0) {
    // Update existing answer
    attempt.answers[existingAnswerIndex] = answerData;
  } else {
    // Add new answer
    attempt.answers.push(answerData);
  }

  await attempt.save();

  return res
    .status(200)
    .json(new ApiResponse(200, attempt, "Answer submitted successfully."));
});

// Submit complete quiz
export const submitQuiz = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const { answers } = req.body;
  const { _id: studentId } = req.user;

  if (!attemptId) {
    throw new ApiError(400, "Attempt ID is required.");
  }

  const attempt = await QuizAttempt.findOne({
    _id: attemptId,
    studentId,
    isCompleted: false,
  });

  if (!attempt) {
    throw new ApiError(404, "Quiz attempt not found or already completed.");
  }

  const quiz = await Quiz.findById(attempt.quizId);
  if (!quiz) {
    throw new ApiError(404, "Quiz not found.");
  }

  // Process all answers if provided
  if (answers && Array.isArray(answers)) {
    for (const answer of answers) {
      const question = quiz.questions.id(answer.questionId);
      if (question) {
        const existingAnswerIndex = attempt.answers.findIndex(
          (a) => a.questionId.toString() === answer.questionId
        );

        const isCorrect =
          question.options[answer.selectedOption]?.isCorrect || false;
        const pointsEarned = isCorrect ? question.points : 0;

        const answerData = {
          questionId: answer.questionId,
          selectedOption: answer.selectedOption,
          isCorrect,
          pointsEarned,
          timeSpent: answer.timeSpent || 0,
        };

        if (existingAnswerIndex >= 0) {
          attempt.answers[existingAnswerIndex] = answerData;
        } else {
          attempt.answers.push(answerData);
        }
      }
    }
  }

  // Complete the attempt
  attempt.endTime = new Date();
  attempt.isCompleted = true;
  attempt.totalTimeSpent = Math.floor(
    (attempt.endTime - attempt.startTime) / 1000
  );

  // Calculate total points and percentage
  attempt.totalPoints = attempt.answers.reduce(
    (total, answer) => total + answer.pointsEarned,
    0
  );
  attempt.percentage =
    attempt.maxPoints > 0 ? (attempt.totalPoints / attempt.maxPoints) * 100 : 0;
  attempt.isPassed = attempt.percentage >= quiz.passingScore;

  await attempt.save();

  return res
    .status(200)
    .json(new ApiResponse(200, attempt, "Quiz submitted successfully."));
});

// Get student's quiz attempts
export const getStudentQuizAttempts = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { _id: studentId } = req.user;

  if (!quizId) {
    throw new ApiError(400, "Quiz ID is required.");
  }

  const quiz = await Quiz.findById(quizId).populate("courseId", "title");
  if (!quiz) {
    throw new ApiError(404, "Quiz not found.");
  }

  // Check if student is enrolled
  const enrollment = await Enrollment.findOne({
    courseId: quiz.courseId._id,
    userId: studentId,
  });
  if (!enrollment) {
    throw new ApiError(403, "You are not enrolled in this course.");
  }

  const attempts = await QuizAttempt.find({ quizId, studentId }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        attempts,
        "Student quiz attempts retrieved successfully."
      )
    );
});

// Get detailed quiz results
export const getQuizResults = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const { _id: studentId } = req.user;

  if (!attemptId) {
    throw new ApiError(400, "Attempt ID is required.");
  }

  const attempt = await QuizAttempt.findOne({ _id: attemptId, studentId });
  if (!attempt) {
    throw new ApiError(404, "Quiz attempt not found.");
  }

  const quiz = await Quiz.findById(attempt.quizId).populate(
    "courseId",
    "title"
  );
  if (!quiz) {
    throw new ApiError(404, "Quiz not found.");
  }

  // Check if results should be shown
  if (!quiz.showResults) {
    throw new ApiError(403, "Results are not available for this quiz.");
  }

  // Prepare detailed results
  const results = {
    attempt,
    quiz: {
      title: quiz.title,
      description: quiz.description,
      course: quiz.courseId,
      passingScore: quiz.passingScore,
      totalQuestions: quiz.questions.length,
      showResults: quiz.showResults,
    },
    detailedAnswers: [],
  };

  // Add question details with answers
  attempt.answers.forEach((answer) => {
    const question = quiz.questions.id(answer.questionId);
    if (question) {
      results.detailedAnswers.push({
        question: question.question,
        options: question.options,
        selectedOption: answer.selectedOption,
        correctOptions: question.options.map((opt, idx) => ({
          index: idx,
          isCorrect: opt.isCorrect,
        })),
        isCorrect: answer.isCorrect,
        pointsEarned: answer.pointsEarned,
        maxPoints: question.points,
        explanation: question.explanation,
        timeSpent: answer.timeSpent,
      });
    }
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, results, "Quiz results retrieved successfully.")
    );
});

// Helper function to shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

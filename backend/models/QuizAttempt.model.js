import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  selectedOption: {
    type: Number, // index of selected option
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  pointsEarned: {
    type: Number,
    default: 0,
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
  },
});

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    answers: [answerSchema],
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    totalTimeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    maxPoints: {
      type: Number,
      default: 0,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    attemptNumber: {
      type: Number,
      required: true,
    },
    feedback: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate score and percentage before saving
quizAttemptSchema.pre("save", function (next) {
  if (this.answers && this.answers.length > 0) {
    this.totalPoints = this.answers.reduce(
      (total, answer) => total + answer.pointsEarned,
      0
    );
    this.percentage =
      this.maxPoints > 0 ? (this.totalPoints / this.maxPoints) * 100 : 0;
  }
  next();
});

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
export default QuizAttempt;

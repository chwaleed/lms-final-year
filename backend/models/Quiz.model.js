import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
    ],
    explanation: {
      type: String,
      trim: true,
    },
    points: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [questionSchema],
    duration: {
      type: Number, // in minutes
      required: true,
      default: 30,
    },
    passingScore: {
      type: Number,
      required: true,
      default: 70, // percentage
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 1, // maximum attempts allowed
    },
    showResults: {
      type: Boolean,
      default: true, // show results after completion
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    shuffleAnswers: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
    },
    availableFrom: {
      type: Date,
      default: Date.now,
    },
    availableTo: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total points before saving
quizSchema.pre("save", function (next) {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce(
      (total, question) => total + question.points,
      0
    );
  }
  next();
});

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;

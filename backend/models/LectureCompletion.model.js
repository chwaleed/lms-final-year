import mongoose from "mongoose";

const lectureCompletionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    watchTime: {
      type: Number, // in seconds
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only complete a lecture once
lectureCompletionSchema.index({ userId: 1, lectureId: 1 }, { unique: true });

const LectureCompletion = mongoose.model(
  "LectureCompletion",
  lectureCompletionSchema
);
export default LectureCompletion;

import React, { useState } from "react";
import { API_ENDPOINTS } from "../../../../config/api";

function QuizList({ quizzes, onEdit, onDelete, onViewStats }) {
  const [loadingQuizId, setLoadingQuizId] = useState(null);

  const handlePublishToggle = async (quiz) => {
    try {
      setLoadingQuizId(quiz._id);
      const response = await fetch(
        API_ENDPOINTS.TOGGLE_QUIZ_PUBLISH(quiz._id),
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        // showMessage(
        //   `Quiz ${quiz.isPublished ? "unpublished" : "published"} successfully`,
        //   "success"
        // );
        // Refresh the quiz list
        window.location.reload();
      } else {
        // showMessage(
        //   data.message || "Error toggling quiz publish status",
        //   "error"
        // );
      }
    } catch (error) {
      console.error("Error toggling quiz publish:", error);
      //   showMessage("Error toggling quiz publish status", "error");
    } finally {
      setLoadingQuizId(null);
    }
  };

  const handleDelete = async (quizId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.DELETE_QUIZ(quizId), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        onDelete(quizId);
      } else {
        // showMessage(data.message || "Error deleting quiz", "error");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      // showMessage("Error deleting quiz", "error");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No quizzes yet
        </h3>
        <p className="text-gray-500">Create your first quiz to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <div
          key={quiz._id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  {quiz.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    quiz.isPublished
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {quiz.isPublished ? "Published" : "Draft"}
                </span>
              </div>
              {quiz.description && (
                <p className="text-gray-600 mb-3">{quiz.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>📋 {quiz.questions.length} questions</span>
                <span>⏱️ {formatDuration(quiz.duration)}</span>
                <span>📊 {quiz.passingScore}% to pass</span>
                <span>🎯 {quiz.totalPoints} points</span>
                <span>🔄 {quiz.attempts} attempts allowed</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onViewStats(quiz)}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
              >
                📊 Stats
              </button>
              <button
                onClick={() => onEdit(quiz)}
                className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition duration-200"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handlePublishToggle(quiz)}
                disabled={
                  loadingQuizId === quiz._id || quiz.questions.length === 0
                }
                className={`px-4 py-2 rounded-lg transition duration-200 ${
                  quiz.isPublished
                    ? "text-red-600 hover:bg-red-50"
                    : "text-green-600 hover:bg-green-50"
                } ${
                  quiz.questions.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {loadingQuizId === quiz._id
                  ? "..."
                  : quiz.isPublished
                  ? "📤 Unpublish"
                  : "📢 Publish"}
              </button>
              <button
                onClick={() => handleDelete(quiz._id)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
              >
                🗑️ Delete
              </button>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>📅 Created: {formatDate(quiz.createdAt)}</span>
              {quiz.dueDate && <span>⏰ Due: {formatDate(quiz.dueDate)}</span>}
              {quiz.availableFrom && (
                <span>🟢 Available from: {formatDate(quiz.availableFrom)}</span>
              )}
              {quiz.availableTo && (
                <span>🔴 Available to: {formatDate(quiz.availableTo)}</span>
              )}
            </div>
          </div>

          {quiz.questions.length === 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ This quiz has no questions yet. Add questions to enable
                publishing.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default QuizList;

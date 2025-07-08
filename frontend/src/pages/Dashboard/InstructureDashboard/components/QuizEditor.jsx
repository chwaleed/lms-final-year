import React, { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "../../../../config/api";
// import { useGlobalMessage } from "../../../../context/GlobalMessageProvider";
import QuestionForm from "./QuestionForm";
import axios from "axios";

function QuizEditor({ quiz, onSubmit, onCancel }) {
  const [quizData, setQuizData] = useState(quiz);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("settings"); // settings, questions
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  // const { showMessage } = useGlobalMessage();

  const fetchQuizData = useCallback(async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.QUIZ_BY_ID(quiz._id));
      if (response.data.success) {
        setQuizData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    }
  }, [quiz._id]);

  useEffect(() => {
    // Fetch the latest quiz data
    fetchQuizData();
  }, [fetchQuizData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();

    if (!quizData.title.trim()) {
      // showMessage("Quiz title is required", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(API_ENDPOINTS.UPDATE_QUIZ(quiz._id), {
        ...quizData,
        duration: parseInt(quizData.duration),
        passingScore: parseInt(quizData.passingScore),
        attempts: parseInt(quizData.attempts),
      });

      if (response.data.success) {
        setQuizData(response.data.data);
        // showMessage("Quiz updated successfully", "success");
      } else {
        // showMessage(data.message || "Error updating quiz", "error");
      }
    } catch (error) {
      console.error("Error updating quiz:", error);
      // showMessage("Error updating quiz", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionAdded = () => {
    fetchQuizData(); // Refresh quiz data
    setShowQuestionForm(false);
    // showMessage("Question added successfully", "success");
  };

  const handleQuestionUpdated = () => {
    fetchQuizData(); // Refresh quiz data
    setEditingQuestion(null);
    // showMessage("Question updated successfully", "success");
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const response = await axios.delete(
        API_ENDPOINTS.DELETE_QUESTION(quiz._id, questionId)
      );

      if (response.data.success) {
        fetchQuizData(); // Refresh quiz data
        // showMessage("Question deleted successfully", "success");
      } else {
        // showMessage(data.message || "Error deleting question", "error");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      // showMessage("Error deleting question", "error");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center p-6 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Edit Quiz</h2>
          <p className="text-gray-600">{quizData.title}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSubmit(quizData)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
          >
            Save & Close
          </button>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-6 py-3 font-medium ${
            activeTab === "settings"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Quiz Settings
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          className={`px-6 py-3 font-medium ${
            activeTab === "questions"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Questions ({quizData.questions.length})
        </button>
      </div>

      <div className="p-6">
        {activeTab === "settings" && (
          <form onSubmit={handleUpdateQuiz} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={quizData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={quizData.description || ""}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={quizData.duration}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  name="passingScore"
                  value={quizData.passingScore}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attempts Allowed
                </label>
                <input
                  type="number"
                  name="attempts"
                  value={quizData.attempts}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formatDate(quizData.dueDate)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From
                </label>
                <input
                  type="datetime-local"
                  name="availableFrom"
                  value={formatDate(quizData.availableFrom)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available To
                </label>
                <input
                  type="datetime-local"
                  name="availableTo"
                  value={formatDate(quizData.availableTo)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Quiz Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="showResults"
                    checked={quizData.showResults}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Show results after completion
                  </span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="shuffleQuestions"
                    checked={quizData.shuffleQuestions}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Shuffle questions
                  </span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="shuffleAnswers"
                    checked={quizData.shuffleAnswers}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Shuffle answer options
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Quiz"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "questions" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Questions ({quizData.questions.length})
              </h3>
              <button
                onClick={() => setShowQuestionForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Add Question
              </button>
            </div>

            {(showQuestionForm || editingQuestion) && (
              <QuestionForm
                quiz={quizData}
                question={editingQuestion}
                onSubmit={
                  editingQuestion ? handleQuestionUpdated : handleQuestionAdded
                }
                onCancel={() => {
                  setShowQuestionForm(false);
                  setEditingQuestion(null);
                }}
              />
            )}

            <div className="space-y-4">
              {quizData.questions.map((question, index) => (
                <div
                  key={question._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">
                        Question {index + 1} ({question.points} point
                        {question.points !== 1 ? "s" : ""})
                      </h4>
                      <p className="text-gray-600 mt-1">{question.question}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingQuestion(question)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`flex items-center space-x-2 p-2 rounded ${
                          option.isCorrect
                            ? "bg-green-50 border border-green-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <span className="text-sm font-medium">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        <span className="text-sm">{option.text}</span>
                        {option.isCorrect && (
                          <span className="text-green-600 text-xs">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {question.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {quizData.questions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">❓</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No questions yet
                </h3>
                <p className="text-gray-500">
                  Add your first question to get started!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizEditor;

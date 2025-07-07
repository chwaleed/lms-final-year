import React, { useState } from "react";
import { API_ENDPOINTS } from "../../../../config/api";
// import { useGlobalMessage } from "../../../../context/GlobalMessageProvider";

function QuizForm({ course, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 30,
    passingScore: 70,
    attempts: 1,
    showResults: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    dueDate: "",
    availableFrom: "",
    availableTo: "",
  });
  const [loading, setLoading] = useState(false);
  // const { showMessage } = useGlobalMessage();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      // showMessage("Quiz title is required", "error");
      return;
    }

    if (formData.duration < 1) {
      // showMessage("Duration must be at least 1 minute", "error");
      return;
    }

    if (formData.passingScore < 0 || formData.passingScore > 100) {
      // showMessage("Passing score must be between 0 and 100", "error");
      return;
    }

    if (formData.attempts < 1) {
      // showMessage("At least 1 attempt must be allowed", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.CREATE_QUIZ, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...formData,
          courseId: course._id,
          duration: parseInt(formData.duration),
          passingScore: parseInt(formData.passingScore),
          attempts: parseInt(formData.attempts),
        }),
      });

      const data = await response.json();
      if (data.success) {
        onSubmit(data.data);
      } else {
        // showMessage(data.message || "Error creating quiz", "error");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      // showMessage("Error creating quiz", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Create New Quiz</h2>
          <p className="text-gray-600">Course: {course.title}</p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quiz description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passing Score (%) *
            </label>
            <input
              type="number"
              name="passingScore"
              value={formData.passingScore}
              onChange={handleInputChange}
              min="0"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attempts Allowed *
            </label>
            <input
              type="number"
              name="attempts"
              value={formData.attempts}
              onChange={handleInputChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
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
              value={formData.availableFrom}
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
              value={formData.availableTo}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Quiz Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="showResults"
                checked={formData.showResults}
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
                checked={formData.shuffleQuestions}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Shuffle questions</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="shuffleAnswers"
                checked={formData.shuffleAnswers}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Shuffle answer options
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Quiz"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuizForm;

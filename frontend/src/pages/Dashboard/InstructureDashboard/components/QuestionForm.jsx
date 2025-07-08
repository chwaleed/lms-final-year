import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../../../config/api";
import axios from "axios";
// import { useGlobalMessage } from "../../../../context/GlobalMessageProvider";

function QuestionForm({ quiz, question, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    question: "",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
    explanation: "",
    points: 1,
  });
  const [loading, setLoading] = useState(false);
  // const { showMessage } = useGlobalMessage();

  useEffect(() => {
    if (question) {
      setFormData({
        question: question.question || "",
        options: question.options || [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
        explanation: question.explanation || "",
        points: question.points || 1,
      });
    }
  }, [question]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const handleCorrectAnswerChange = (index) => {
    const newOptions = formData.options.map((option, i) => ({
      ...option,
      isCorrect: i === index,
    }));
    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { text: "", isCorrect: false }],
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      // showMessage("At least 2 options are required", "error");
      return;
    }

    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.question.trim()) {
      // showMessage("Question is required", "error");
      return;
    }

    const validOptions = formData.options.filter(
      (option) => option.text.trim() !== ""
    );
    if (validOptions.length < 2) {
      // showMessage("At least 2 options with text are required", "error");
      return;
    }

    console.log("here is the data");
    const hasCorrectAnswer = validOptions.some((option) => option.isCorrect);
    if (!hasCorrectAnswer) {
      // showMessage("Please select the correct answer", "error");
      return;
    }

    if (formData.points < 1) {
      // showMessage("Points must be at least 1", "error");
      return;
    }

    try {
      setLoading(true);
      const url = question
        ? API_ENDPOINTS.UPDATE_QUESTION(quiz._id, question._id)
        : API_ENDPOINTS.ADD_QUESTION(quiz._id);

      const method = question ? "PUT" : "POST";

      let response;

      const payload = {
        ...formData,
        options: validOptions,
        points: parseInt(formData.points),
      };

      if (method === "PUT") {
        response = await axios.put(url, payload);
      } else {
        response = await axios.post(url, payload);
      }

      if (response.data.success) {
        // Reset form data for new questions
        if (!question) {
          setFormData({
            question: "",
            options: [
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
            ],
            explanation: "",
            points: 1,
          });
        }

        onSubmit(response.data.data);

        // Hide the form after successful submission
        onCancel();
      } else {
        // showMessage(response.data.message || "Error saving question", "error");
      }
    } catch (error) {
      console.error("Error saving question:", error);
      // showMessage("Error saving question", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {question ? "Edit Question" : "Add New Question"}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question *
          </label>
          <textarea
            name="question"
            value={formData.question}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your question here..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Answer Options *
          </label>
          <div className="space-y-3">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={option.isCorrect}
                  onChange={() => handleCorrectAnswerChange(index)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 min-w-[20px]">
                  {String.fromCharCode(65 + index)}.
                </span>
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) =>
                    handleOptionChange(index, "text", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-between items-center">
            <button
              type="button"
              onClick={addOption}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Add Option
            </button>
            <p className="text-xs text-gray-500">
              Select the radio button next to the correct answer
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points *
            </label>
            <input
              type="number"
              name="points"
              value={formData.points}
              onChange={handleInputChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation (Optional)
          </label>
          <textarea
            name="explanation"
            value={formData.explanation}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide an explanation for the correct answer..."
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
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
            {loading
              ? "Saving..."
              : question
              ? "Update Question"
              : "Add Question"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuestionForm;

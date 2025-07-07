import React, { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "../../../../config/api";
// import { useGlobalMessage } from "../../../../context/GlobalMessageProvider";
import Loading from "../../../../generalComponents/Loading";
import QuizList from "./QuizList";
import QuizForm from "./QuizForm";
import QuizEditor from "./QuizEditor";
import QuizStats from "./QuizStats";
import axios from "axios";

function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [activeView, setActiveView] = useState("list"); // list, create, edit, stats
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  // const { showMessage } = useGlobalMessage();

  const fetchCourses = useCallback(async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.COURSES_PAGINATED);
      if (response.success) {
        setCourses(response.data.courses);
        if (response.data.courses.length > 0) {
          setSelectedCourse(response.data.courses[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      // showMessage("Error fetching courses", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuizzes = useCallback(async (courseId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        API_ENDPOINTS.QUIZZES_BY_COURSE(courseId)
      );
      if (response.success) {
        setQuizzes(response.data);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      // showMessage("Error fetching quizzes", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (selectedCourse) {
      fetchQuizzes(selectedCourse._id);
    }
  }, [selectedCourse, fetchQuizzes]);

  const handleQuizCreated = (newQuiz) => {
    setQuizzes([newQuiz, ...quizzes]);
    setActiveView("list");
    // showMessage("Quiz created successfully", "success");
  };

  const handleQuizUpdated = (updatedQuiz) => {
    setQuizzes(
      quizzes.map((q) => (q._id === updatedQuiz._id ? updatedQuiz : q))
    );
    setActiveView("list");
    // showMessage("Quiz updated successfully", "success");
  };

  const handleQuizDeleted = (quizId) => {
    setQuizzes(quizzes.filter((q) => q._id !== quizId));
    // showMessage("Quiz deleted successfully", "success");
  };

  const handleViewChange = (view, quiz = null) => {
    setActiveView(view);
    setSelectedQuiz(quiz);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quiz Management</h1>
        <div className="flex gap-4">
          <select
            value={selectedCourse?._id || ""}
            onChange={(e) => {
              const course = courses.find((c) => c._id === e.target.value);
              setSelectedCourse(course);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
          {selectedCourse && (
            <button
              onClick={() => handleViewChange("create")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Create Quiz
            </button>
          )}
        </div>
      </div>

      {!selectedCourse ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Please select a course to manage quizzes
          </p>
        </div>
      ) : (
        <div>
          {activeView === "list" && (
            <QuizList
              quizzes={quizzes}
              onEdit={(quiz) => handleViewChange("edit", quiz)}
              onDelete={handleQuizDeleted}
              onViewStats={(quiz) => handleViewChange("stats", quiz)}
            />
          )}
          {activeView === "create" && (
            <QuizForm
              course={selectedCourse}
              onSubmit={handleQuizCreated}
              onCancel={() => handleViewChange("list")}
            />
          )}
          {activeView === "edit" && selectedQuiz && (
            <QuizEditor
              quiz={selectedQuiz}
              onSubmit={handleQuizUpdated}
              onCancel={() => handleViewChange("list")}
            />
          )}
          {activeView === "stats" && selectedQuiz && (
            <QuizStats
              quiz={selectedQuiz}
              onBack={() => handleViewChange("list")}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Quizzes;

import React, { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "../../../../config/api";
// import { useGlobalMessage } from "../../../../context/GlobalMessageProvider";
import Loading from "../../../../generalComponents/Loading";
import axios from "axios";

function QuizStats({ quiz, onBack }) {
  const [stats, setStats] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, attempts
  // const { showMessage } = useGlobalMessage();

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.QUIZ_STATS(quiz._id), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching quiz stats:", error);
      // showMessage("Error fetching quiz statistics", "error");
    }
  }, [quiz._id]);

  const fetchAttempts = useCallback(async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.QUIZ_ATTEMPTS(quiz._id));
      if (response.data.success) {
        setAttempts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      // showMessage("Error fetching quiz attempts", "error");
    } finally {
      setLoading(false);
    }
  }, [quiz._id]);

  useEffect(() => {
    fetchStats();
    fetchAttempts();
  }, [fetchStats, fetchAttempts]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center p-6 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quiz Statistics</h2>
          <p className="text-gray-600">{quiz.title}</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200"
        >
          ← Back to Quizzes
        </button>
      </div>

      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-3 font-medium ${
            activeTab === "overview"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("attempts")}
          className={`px-6 py-3 font-medium ${
            activeTab === "attempts"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Attempts ({attempts.length})
        </button>
      </div>

      <div className="p-6">
        {activeTab === "overview" && stats && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Total Attempts
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalAttempts}
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 mb-2">
                  Average Score
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {stats.averageScore.toFixed(1)}%
                </p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-purple-800 mb-2">
                  Pass Rate
                </h3>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.passRate.toFixed(1)}%
                </p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  Avg. Time
                </h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {formatDuration(Math.round(stats.averageTimeSpent))}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Score Distribution
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Highest Score</span>
                    <span className="font-semibold text-green-600">
                      {stats.highestScore.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Lowest Score</span>
                    <span className="font-semibold text-red-600">
                      {stats.lowestScore.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Score</span>
                    <span className="font-semibold text-blue-600">
                      {stats.averageScore.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Quiz Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Total Questions
                    </span>
                    <span className="font-semibold">
                      {quiz.questions.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Points</span>
                    <span className="font-semibold">{quiz.totalPoints}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Passing Score</span>
                    <span className="font-semibold">{quiz.passingScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Time Limit</span>
                    <span className="font-semibold">
                      {quiz.duration} minutes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "attempts" && (
          <div>
            {attempts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No attempts yet
                </h3>
                <p className="text-gray-500">
                  Students haven't taken this quiz yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {attempts.map((attempt) => (
                  <div
                    key={attempt._id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {attempt.studentId.fullname ||
                            attempt.studentId.username}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {attempt.studentId.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            attempt.isPassed
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {attempt.isPassed ? "Passed" : "Failed"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Score</p>
                        <p
                          className={`text-lg font-semibold ${getGradeColor(
                            attempt.percentage
                          )}`}
                        >
                          {attempt.percentage.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Points</p>
                        <p className="text-lg font-semibold">
                          {attempt.totalPoints}/{attempt.maxPoints}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Time Spent</p>
                        <p className="text-lg font-semibold">
                          {formatDuration(attempt.totalTimeSpent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Attempt</p>
                        <p className="text-lg font-semibold">
                          #{attempt.attemptNumber}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Started: {formatDate(attempt.startTime)}</span>
                        {attempt.endTime && (
                          <span>Completed: {formatDate(attempt.endTime)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizStats;

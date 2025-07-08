import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Tag,
  Typography,
  Space,
  Input,
  Select,
  Progress,
  Statistic,
  Modal,
  message,
  Spin,
  Empty,
} from "antd";
import {
  QuestionCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  CalendarOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { API_ENDPOINTS } from "../../../../config/api";
import axios from "axios";
import QuizTaker from "./QuizTaker";
import QuizResults from "./QuizResults";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

function Quizzes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentView, setCurrentView] = useState("list"); // list, taking, results
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);

  // Fetch enrolled courses
  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  // Fetch quizzes when course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchQuizzes(selectedCourse._id);
    }
  }, [selectedCourse]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEnrolledCourses = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ENROLLED_COURSES);
      if (response.data.success) {
        setEnrolledCourses(response.data.data);
        console.log("Enrolled courses:", response.data.data);
        if (response.data.data.length > 0) {
          setSelectedCourse(response.data.data[0].courseId);
        }
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      message.error("Failed to fetch enrolled courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async (courseId) => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.STUDENT_QUIZZES(courseId));
      if (response.data.success) {
        const processedQuizzes = response.data.data.map((quiz) => ({
          ...quiz,
          id: quiz._id,
          course: selectedCourse?.title || "Course",
          questions: quiz.questions.length,
          timeLimit: quiz.duration,
          attempts: quiz.studentAttempts,
          maxAttempts: quiz.attempts,
          score: quiz.bestScore,
          maxScore: 100,
          dueDate: quiz.dueDate
            ? new Date(quiz.dueDate).toLocaleDateString()
            : "No due date",
          lastAttempt: quiz.lastAttempt
            ? new Date(quiz.lastAttempt.createdAt).toLocaleDateString()
            : null,
          difficulty: "Intermediate", // You can add this to your quiz model if needed
          topics: quiz.questions
            .map((q) => q.question.substring(0, 20) + "...")
            .slice(0, 3),
          status: getQuizStatus(quiz),
        }));
        setQuizzes(processedQuizzes);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      message.error("Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  };

  const getQuizStatus = (quiz) => {
    if (!quiz.canTakeQuiz && quiz.studentAttempts >= quiz.attempts) {
      return "completed";
    }
    if (!quiz.isAvailable) {
      if (quiz.availabilityStatus === "not_yet_available") {
        return "locked";
      }
      if (quiz.availabilityStatus === "expired") {
        return "overdue";
      }
    }
    if (quiz.availabilityStatus === "overdue") {
      return "overdue";
    }
    return "available";
  };

  const handleStartQuiz = async (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView("taking");
  };

  const handleViewResults = async (quiz) => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.STUDENT_QUIZ_ATTEMPTS(quiz._id)
      );
      if (response.data.success && response.data.data.length > 0) {
        const latestAttempt = response.data.data[0];
        setSelectedAttemptId(latestAttempt._id);
        setCurrentView("results");
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      message.error("Failed to fetch quiz results");
    }
  };

  const handleQuizComplete = (attempt) => {
    setSelectedAttemptId(attempt._id);
    setCurrentView("results");
    // Refresh quizzes to update status
    if (selectedCourse) {
      fetchQuizzes(selectedCourse._id);
    }
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedQuiz(null);
    setSelectedAttemptId(null);
    // Refresh quizzes when coming back
    if (selectedCourse) {
      fetchQuizzes(selectedCourse._id);
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentView("taking");
    setSelectedAttemptId(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "available":
        return "processing";
      case "overdue":
        return "error";
      case "locked":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "available":
        return "Available";
      case "overdue":
        return "Overdue";
      case "locked":
        return "Locked";
      default:
        return status;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "green";
      case "Intermediate":
        return "orange";
      case "Advanced":
        return "red";
      default:
        return "blue";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "#52c41a";
    if (score >= 70) return "#faad14";
    return "#ff4d4f";
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || quiz.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const completedQuizzes = quizzes.filter((q) => q.status === "completed");
  const averageScore =
    completedQuizzes.length > 0
      ? Math.round(
          completedQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) /
            completedQuizzes.length
        )
      : 0;

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>Loading quizzes...</div>
      </div>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <div style={{ padding: "24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="You are not enrolled in any courses yet"
        />
      </div>
    );
  }

  // Render different views based on currentView state
  if (currentView === "taking" && selectedQuiz) {
    return (
      <QuizTaker
        quizId={selectedQuiz._id}
        onComplete={handleQuizComplete}
        onBack={handleBackToList}
      />
    );
  }

  if (currentView === "results" && selectedAttemptId) {
    return (
      <QuizResults
        attemptId={selectedAttemptId}
        onBack={handleBackToList}
        onRetake={handleRetakeQuiz}
      />
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Quizzes & Assessments</Title>
        <Paragraph type="secondary">
          Test your knowledge and track your learning progress
        </Paragraph>
      </div>

      {/* Course Selection */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24}>
          <Card>
            <Space>
              <BookOutlined />
              <Text strong>Select Course:</Text>
              <Select
                style={{ minWidth: "200px" }}
                value={selectedCourse?._id}
                onChange={(value) => {
                  const course = enrolledCourses.find(
                    (c) => c.courseId._id === value
                  );
                  setSelectedCourse(course?.courseId);
                }}
                placeholder="Select a course"
              >
                {enrolledCourses.map((enrollment) => (
                  <Option
                    key={enrollment.courseId._id}
                    value={enrollment.courseId._id}
                  >
                    {enrollment.courseId.title}
                  </Option>
                ))}
              </Select>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Quiz Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Quizzes"
              value={quizzes.length}
              prefix={<QuestionCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Completed"
              value={completedQuizzes.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Available"
              value={quizzes.filter((q) => q.status === "available").length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Average Score"
              value={averageScore}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} md={12}>
          <Search
            placeholder="Search quizzes..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} md={12}>
          <Select
            defaultValue="all"
            style={{ width: "100%" }}
            onChange={setFilterStatus}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">All Quizzes</Option>
            <Option value="available">Available</Option>
            <Option value="completed">Completed</Option>
            <Option value="locked">Locked</Option>
            <Option value="overdue">Overdue</Option>
          </Select>
        </Col>
      </Row>

      {/* Quiz Cards */}
      <Row gutter={[16, 16]}>
        {filteredQuizzes.map((quiz) => (
          <Col xs={24} lg={12} key={quiz.id}>
            <Card
              hoverable
              style={{ height: "100%" }}
              actions={
                quiz.status === "completed"
                  ? [
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleViewResults(quiz)}
                      >
                        View Results
                      </Button>,
                      quiz.attempts < quiz.maxAttempts && (
                        <Button
                          type="primary"
                          icon={<PlayCircleOutlined />}
                          onClick={() => handleStartQuiz(quiz)}
                        >
                          Retake Quiz
                        </Button>
                      ),
                    ].filter(Boolean)
                  : quiz.status === "available"
                  ? [
                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={() => handleStartQuiz(quiz)}
                      >
                        Start Quiz
                      </Button>,
                    ]
                  : [<Button disabled>Locked</Button>]
              }
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <Title level={4} style={{ margin: 0, flex: 1 }}>
                      {quiz.title}
                    </Title>
                    <Tag color={getStatusColor(quiz.status)}>
                      {getStatusText(quiz.status)}
                    </Tag>
                  </div>

                  <Text type="secondary">{quiz.course}</Text>

                  <div style={{ margin: "8px 0" }}>
                    <Space>
                      <Tag color={getDifficultyColor(quiz.difficulty)}>
                        {quiz.difficulty}
                      </Tag>
                      <Tag>{quiz.questions} questions</Tag>
                      <Tag>{quiz.timeLimit} min</Tag>
                    </Space>
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text>Due Date:</Text>
                      <Text strong>{quiz.dueDate}</Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text>Attempts:</Text>
                      <Text>
                        {quiz.attempts}/{quiz.maxAttempts}
                      </Text>
                    </div>
                  </Space>
                </div>

                {quiz.status === "completed" && quiz.score !== null && (
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <Text>Best Score:</Text>
                      <Text strong style={{ color: getScoreColor(quiz.score) }}>
                        {quiz.score.toFixed(1)}%
                      </Text>
                    </div>
                    <Progress
                      percent={Math.round(quiz.score)}
                      strokeColor={getScoreColor(quiz.score)}
                    />
                  </div>
                )}

                <div style={{ marginTop: "auto" }}>
                  {quiz.description && (
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {quiz.description}
                    </Text>
                  )}
                  {quiz.lastAttempt && (
                    <div style={{ marginTop: "4px" }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Last attempt: {quiz.lastAttempt}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredQuizzes.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <QuestionCircleOutlined
            style={{ fontSize: "48px", color: "#d9d9d9" }}
          />
          <Title level={3} type="secondary">
            No quizzes found
          </Title>
          <Paragraph type="secondary">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filter criteria"
              : selectedCourse
              ? "No quizzes are available for this course"
              : "Select a course to view available quizzes"}
          </Paragraph>
        </div>
      )}
    </div>
  );
}

export default Quizzes;

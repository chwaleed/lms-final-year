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
  List,
  Progress,
  Statistic,
} from "antd";
import {
  QuestionCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  SearchOutlined,
  FilterOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

function Quizzes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data - replace with actual data from API
  const quizzes = [
    {
      id: 1,
      title: "JavaScript Fundamentals Quiz",
      course: "Complete Web Development Bootcamp",
      questions: 15,
      timeLimit: 30,
      attempts: 2,
      maxAttempts: 3,
      status: "completed",
      score: 95,
      maxScore: 100,
      dueDate: "2025-06-20",
      lastAttempt: "2025-06-14",
      difficulty: "Intermediate",
      topics: ["Variables", "Functions", "Arrays", "Objects"],
    },
    {
      id: 2,
      title: "React Hooks Assessment",
      course: "Advanced React Development",
      questions: 20,
      timeLimit: 45,
      attempts: 1,
      maxAttempts: 2,
      status: "completed",
      score: 88,
      maxScore: 100,
      dueDate: "2025-06-22",
      lastAttempt: "2025-06-13",
      difficulty: "Advanced",
      topics: ["useState", "useEffect", "useContext", "Custom Hooks"],
    },
    {
      id: 3,
      title: "Database Normalization Quiz",
      course: "Database Design Fundamentals",
      questions: 12,
      timeLimit: 25,
      attempts: 0,
      maxAttempts: 3,
      status: "available",
      score: null,
      maxScore: 100,
      dueDate: "2025-06-18",
      lastAttempt: null,
      difficulty: "Intermediate",
      topics: ["1NF", "2NF", "3NF", "BCNF"],
    },
    {
      id: 4,
      title: "Final Assessment: Web Development",
      course: "Complete Web Development Bootcamp",
      questions: 50,
      timeLimit: 120,
      attempts: 0,
      maxAttempts: 1,
      status: "locked",
      score: null,
      maxScore: 100,
      dueDate: "2025-06-25",
      lastAttempt: null,
      difficulty: "Advanced",
      topics: ["HTML/CSS", "JavaScript", "React", "Node.js", "Database"],
      prerequisite: "Complete all course modules",
    },
    {
      id: 5,
      title: "UI/UX Principles Quiz",
      course: "UI/UX Design Principles",
      questions: 18,
      timeLimit: 35,
      attempts: 2,
      maxAttempts: 2,
      status: "completed",
      score: 92,
      maxScore: 100,
      dueDate: "2025-03-15",
      lastAttempt: "2025-03-14",
      difficulty: "Beginner",
      topics: ["Design Theory", "Color Theory", "Typography", "User Research"],
    },
  ];

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
          completedQuizzes.reduce((sum, q) => sum + q.score, 0) /
            completedQuizzes.length
        )
      : 0;

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Quizzes & Assessments</Title>
        <Paragraph type="secondary">
          Test your knowledge and track your learning progress
        </Paragraph>
      </div>

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
                      <Button icon={<EyeOutlined />}>View Results</Button>,
                      quiz.attempts < quiz.maxAttempts && (
                        <Button type="primary" icon={<PlayCircleOutlined />}>
                          Retake Quiz
                        </Button>
                      ),
                    ].filter(Boolean)
                  : quiz.status === "available"
                  ? [
                      <Button type="primary" icon={<PlayCircleOutlined />}>
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

                {quiz.status === "completed" && (
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
                        {quiz.score}/{quiz.maxScore} (
                        {Math.round((quiz.score / quiz.maxScore) * 100)}%)
                      </Text>
                    </div>
                    <Progress
                      percent={Math.round((quiz.score / quiz.maxScore) * 100)}
                      strokeColor={getScoreColor(quiz.score)}
                    />
                  </div>
                )}

                {quiz.status === "locked" && quiz.prerequisite && (
                  <div style={{ marginBottom: "16px" }}>
                    <Text type="secondary" style={{ fontStyle: "italic" }}>
                      Prerequisite: {quiz.prerequisite}
                    </Text>
                  </div>
                )}

                <div style={{ marginTop: "auto" }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Topics: {quiz.topics.join(", ")}
                  </Text>
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
              : "No quizzes are available at this time"}
          </Paragraph>
        </div>
      )}
    </div>
  );
}

export default Quizzes;

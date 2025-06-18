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
  Upload,
  message,
} from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  UploadOutlined,
  DownloadOutlined,
  EyeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

function Assignments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data - replace with actual data from API
  const assignments = [
    {
      id: 1,
      title: "Build a Personal Portfolio Website",
      course: "Complete Web Development Bootcamp",
      description:
        "Create a responsive personal portfolio website using HTML, CSS, and JavaScript. Include at least 5 sections: About, Skills, Projects, Contact, and Resume.",
      dueDate: "2025-06-20",
      submittedDate: "2025-06-15",
      status: "submitted",
      grade: 95,
      maxGrade: 100,
      feedback:
        "Excellent work! Great attention to detail and responsive design implementation.",
      requirements: [
        "Responsive design",
        "Clean code",
        "Cross-browser compatibility",
        "Accessibility features",
      ],
      submissionType: "file",
      attachments: ["portfolio.zip"],
      timeSpent: "15 hours",
    },
    {
      id: 2,
      title: "React Component Library",
      course: "Advanced React Development",
      description:
        "Build a reusable component library with at least 10 components including Button, Input, Modal, Card, and Navigation components.",
      dueDate: "2025-06-22",
      submittedDate: "2025-06-14",
      status: "graded",
      grade: 88,
      maxGrade: 100,
      feedback:
        "Good implementation of components. Consider adding more prop types validation and better documentation.",
      requirements: [
        "TypeScript",
        "Storybook documentation",
        "Unit tests",
        "NPM package",
      ],
      submissionType: "github",
      repositoryUrl: "https://github.com/student/react-components",
      timeSpent: "25 hours",
    },
    {
      id: 3,
      title: "Database Schema Design",
      course: "Database Design Fundamentals",
      description:
        "Design a complete database schema for an e-commerce platform including users, products, orders, and inventory management.",
      dueDate: "2025-06-18",
      submittedDate: null,
      status: "overdue",
      grade: null,
      maxGrade: 100,
      feedback: null,
      requirements: [
        "ER Diagram",
        "Normalized tables",
        "Sample queries",
        "Data dictionary",
      ],
      submissionType: "file",
      attachments: [],
      timeSpent: "8 hours",
    },
    {
      id: 4,
      title: "Final Project: Full-Stack Application",
      course: "Complete Web Development Bootcamp",
      description:
        "Develop a complete full-stack web application with user authentication, CRUD operations, and deployment to cloud platform.",
      dueDate: "2025-06-25",
      submittedDate: null,
      status: "pending",
      grade: null,
      maxGrade: 100,
      feedback: null,
      requirements: [
        "Frontend (React)",
        "Backend (Node.js)",
        "Database",
        "Authentication",
        "Deployment",
      ],
      submissionType: "github",
      repositoryUrl: null,
      timeSpent: "5 hours",
    },
    {
      id: 5,
      title: "User Research Report",
      course: "UI/UX Design Principles",
      description:
        "Conduct user research for a mobile app and create a comprehensive report with findings and recommendations.",
      dueDate: "2025-03-20",
      submittedDate: "2025-03-18",
      status: "graded",
      grade: 92,
      maxGrade: 100,
      feedback:
        "Thorough research methodology and clear presentation of findings. Excellent use of personas and user journey maps.",
      requirements: [
        "User interviews",
        "Survey data",
        "Personas",
        "Journey maps",
        "Recommendations",
      ],
      submissionType: "file",
      attachments: ["user-research-report.pdf"],
      timeSpent: "20 hours",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "graded":
        return "success";
      case "submitted":
        return "processing";
      case "pending":
        return "default";
      case "overdue":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "graded":
        return "Graded";
      case "submitted":
        return "Submitted";
      case "pending":
        return "Pending";
      case "overdue":
        return "Overdue";
      default:
        return status;
    }
  };

  const getGradeColor = (grade, maxGrade) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return "#52c41a";
    if (percentage >= 70) return "#faad14";
    return "#ff4d4f";
  };

  const isOverdue = (dueDate, status) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today && (status === "pending" || status === "draft");
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || assignment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const completedAssignments = assignments.filter((a) => a.status === "graded");
  const averageGrade =
    completedAssignments.length > 0
      ? Math.round(
          completedAssignments.reduce((sum, a) => sum + a.grade, 0) /
            completedAssignments.length
        )
      : 0;

  const handleFileUpload = (assignmentId, info) => {
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Assignments</Title>
        <Paragraph type="secondary">
          Manage your assignments, submissions, and track your grades
        </Paragraph>
      </div>

      {/* Assignment Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Assignments"
              value={assignments.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Completed"
              value={completedAssignments.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pending"
              value={assignments.filter((a) => a.status === "pending").length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Average Grade"
              value={averageGrade}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} md={12}>
          <Search
            placeholder="Search assignments..."
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
            <Option value="all">All Assignments</Option>
            <Option value="pending">Pending</Option>
            <Option value="submitted">Submitted</Option>
            <Option value="graded">Graded</Option>
            <Option value="overdue">Overdue</Option>
          </Select>
        </Col>
      </Row>

      {/* Assignment Cards */}
      <Row gutter={[16, 16]}>
        {filteredAssignments.map((assignment) => (
          <Col xs={24} key={assignment.id}>
            <Card
              style={{
                borderLeft: isOverdue(assignment.dueDate, assignment.status)
                  ? "4px solid #ff4d4f"
                  : assignment.status === "graded"
                  ? "4px solid #52c41a"
                  : "4px solid #1890ff",
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
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
                        {assignment.title}
                      </Title>
                      <Space>
                        {isOverdue(assignment.dueDate, assignment.status) && (
                          <Tag
                            color="error"
                            icon={<ExclamationCircleOutlined />}
                          >
                            Overdue
                          </Tag>
                        )}
                        <Tag color={getStatusColor(assignment.status)}>
                          {getStatusText(assignment.status)}
                        </Tag>
                      </Space>
                    </div>

                    <Text type="secondary">{assignment.course}</Text>
                  </div>

                  <Paragraph>{assignment.description}</Paragraph>

                  <div style={{ marginBottom: "16px" }}>
                    <Title level={5}>Requirements:</Title>
                    <div>
                      {assignment.requirements.map((req, index) => (
                        <Tag key={index} style={{ marginBottom: "4px" }}>
                          {req}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  {assignment.feedback && (
                    <div style={{ marginBottom: "16px" }}>
                      <Title level={5}>Instructor Feedback:</Title>
                      <Text italic style={{ color: "#666" }}>
                        "{assignment.feedback}"
                      </Text>
                    </div>
                  )}
                </Col>

                <Col xs={24} lg={8}>
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#fafafa",
                      borderRadius: "8px",
                    }}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text>Due Date:</Text>
                        <Text
                          strong
                          style={{
                            color: isOverdue(
                              assignment.dueDate,
                              assignment.status
                            )
                              ? "#ff4d4f"
                              : "inherit",
                          }}
                        >
                          {assignment.dueDate}
                        </Text>
                      </div>

                      {assignment.submittedDate && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text>Submitted:</Text>
                          <Text>{assignment.submittedDate}</Text>
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text>Time Spent:</Text>
                        <Text>{assignment.timeSpent}</Text>
                      </div>

                      {assignment.grade !== null && (
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <Text>Grade:</Text>
                            <Text
                              strong
                              style={{
                                color: getGradeColor(
                                  assignment.grade,
                                  assignment.maxGrade
                                ),
                              }}
                            >
                              {assignment.grade}/{assignment.maxGrade} (
                              {Math.round(
                                (assignment.grade / assignment.maxGrade) * 100
                              )}
                              %)
                            </Text>
                          </div>
                          <Progress
                            percent={Math.round(
                              (assignment.grade / assignment.maxGrade) * 100
                            )}
                            strokeColor={getGradeColor(
                              assignment.grade,
                              assignment.maxGrade
                            )}
                            size="small"
                          />
                        </div>
                      )}

                      <div style={{ marginTop: "16px" }}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                          {assignment.status === "pending" &&
                            (assignment.submissionType === "file" ? (
                              <Upload
                                onChange={(info) =>
                                  handleFileUpload(assignment.id, info)
                                }
                                multiple
                              >
                                <Button icon={<UploadOutlined />} block>
                                  Upload Files
                                </Button>
                              </Upload>
                            ) : (
                              <Button type="primary" block>
                                Submit Repository Link
                              </Button>
                            ))}

                          {assignment.attachments &&
                            assignment.attachments.length > 0 && (
                              <Button icon={<DownloadOutlined />} block>
                                Download Submission
                              </Button>
                            )}

                          {assignment.repositoryUrl && (
                            <Button icon={<EyeOutlined />} block>
                              View Repository
                            </Button>
                          )}

                          <Button icon={<EyeOutlined />} block>
                            View Details
                          </Button>
                        </Space>
                      </div>
                    </Space>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredAssignments.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <FileTextOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
          <Title level={3} type="secondary">
            No assignments found
          </Title>
          <Paragraph type="secondary">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filter criteria"
              : "No assignments are available at this time"}
          </Paragraph>
        </div>
      )}
    </div>
  );
}

export default Assignments;

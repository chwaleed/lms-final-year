import {
  Row,
  Col,
  Card,
  Typography,
  Progress,
  Table,
  Statistic,
  Space,
  Select,
  DatePicker,
  Button,
} from "antd";
import {
  TrophyOutlined,
  BookOutlined,
  LineChartOutlined,
  DownloadOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

function Grades() {
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("current");

  // Mock data - replace with actual data from API
  const gradeData = {
    currentGPA: 3.7,
    cumulativeGPA: 3.6,
    totalCredits: 45,
    completedCourses: 8,
  };

  const courseGrades = [
    {
      key: "1",
      courseName: "Complete Web Development Bootcamp",
      courseCode: "WEB101",
      instructor: "Dr. Sarah Johnson",
      credits: 4,
      letterGrade: "A",
      percentage: 95,
      gradePoints: 4.0,
      semester: "Spring 2025",
      assignments: [
        { name: "Portfolio Website", grade: 95, maxGrade: 100, weight: 30 },
        { name: "JavaScript Quiz", grade: 98, maxGrade: 100, weight: 20 },
        { name: "Final Project", grade: 92, maxGrade: 100, weight: 50 },
      ],
    },
    {
      key: "2",
      courseName: "Advanced React Development",
      courseCode: "REA301",
      instructor: "Prof. Michael Chen",
      credits: 3,
      letterGrade: "B+",
      percentage: 88,
      gradePoints: 3.3,
      semester: "Spring 2025",
      assignments: [
        { name: "Component Library", grade: 88, maxGrade: 100, weight: 40 },
        { name: "Hooks Assessment", grade: 90, maxGrade: 100, weight: 25 },
        {
          name: "State Management Project",
          grade: 85,
          maxGrade: 100,
          weight: 35,
        },
      ],
    },
    {
      key: "3",
      courseName: "Database Design Fundamentals",
      courseCode: "DB201",
      instructor: "Dr. Emily Rodriguez",
      credits: 3,
      letterGrade: "B",
      percentage: 82,
      gradePoints: 3.0,
      semester: "Spring 2025",
      assignments: [
        { name: "ER Diagram Design", grade: 85, maxGrade: 100, weight: 30 },
        { name: "Normalization Quiz", grade: 78, maxGrade: 100, weight: 20 },
        {
          name: "Database Implementation",
          grade: 83,
          maxGrade: 100,
          weight: 50,
        },
      ],
    },
    {
      key: "4",
      courseName: "Introduction to Python",
      courseCode: "PY101",
      instructor: "Prof. David Wilson",
      credits: 3,
      letterGrade: "A+",
      percentage: 97,
      gradePoints: 4.0,
      semester: "Fall 2024",
      assignments: [
        { name: "Basic Syntax Quiz", grade: 95, maxGrade: 100, weight: 20 },
        {
          name: "Data Structures Project",
          grade: 98,
          maxGrade: 100,
          weight: 40,
        },
        {
          name: "Final Algorithm Challenge",
          grade: 98,
          maxGrade: 100,
          weight: 40,
        },
      ],
    },
    {
      key: "5",
      courseName: "UI/UX Design Principles",
      courseCode: "DES201",
      instructor: "Ms. Lisa Anderson",
      credits: 3,
      letterGrade: "A",
      percentage: 92,
      gradePoints: 4.0,
      semester: "Fall 2024",
      assignments: [
        { name: "User Research Report", grade: 92, maxGrade: 100, weight: 35 },
        {
          name: "Design System Creation",
          grade: 94,
          maxGrade: 100,
          weight: 40,
        },
        { name: "Usability Testing", grade: 90, maxGrade: 100, weight: 25 },
      ],
    },
  ];

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "#52c41a";
    if (percentage >= 80) return "#faad14";
    if (percentage >= 70) return "#fa8c16";
    return "#ff4d4f";
  };

  const getLetterGradeColor = (grade) => {
    if (grade.includes("A")) return "#52c41a";
    if (grade.includes("B")) return "#faad14";
    if (grade.includes("C")) return "#fa8c16";
    return "#ff4d4f";
  };

  const expandedRowRender = (record) => {
    const columns = [
      {
        title: "Assignment",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Grade",
        key: "grade",
        render: (_, assignment) => (
          <Space>
            <Text strong>
              {assignment.grade}/{assignment.maxGrade}
            </Text>
            <Text type="secondary">
              ({Math.round((assignment.grade / assignment.maxGrade) * 100)}%)
            </Text>
          </Space>
        ),
      },
      {
        title: "Weight",
        dataIndex: "weight",
        key: "weight",
        render: (weight) => `${weight}%`,
      },
      {
        title: "Progress",
        key: "progress",
        render: (_, assignment) => (
          <Progress
            percent={Math.round((assignment.grade / assignment.maxGrade) * 100)}
            strokeColor={getGradeColor(
              (assignment.grade / assignment.maxGrade) * 100
            )}
            size="small"
          />
        ),
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={record.assignments.map((assignment, index) => ({
          ...assignment,
          key: `${record.key}-${index}`,
        }))}
        pagination={false}
        size="small"
      />
    );
  };

  const columns = [
    {
      title: "Course",
      key: "course",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.courseName}</Text>
          <Text type="secondary">{record.courseCode}</Text>
          <Text type="secondary">{record.instructor}</Text>
        </Space>
      ),
    },
    {
      title: "Credits",
      dataIndex: "credits",
      key: "credits",
      width: 80,
      align: "center",
    },
    {
      title: "Grade",
      key: "grade",
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={0} style={{ textAlign: "center" }}>
          <Text
            strong
            style={{
              fontSize: "18px",
              color: getLetterGradeColor(record.letterGrade),
            }}
          >
            {record.letterGrade}
          </Text>
          <Text type="secondary">{record.percentage}%</Text>
        </Space>
      ),
    },
    {
      title: "GPA Points",
      dataIndex: "gradePoints",
      key: "gradePoints",
      width: 100,
      align: "center",
      render: (points) => (
        <Text
          strong
          style={{
            color:
              points >= 3.5 ? "#52c41a" : points >= 3.0 ? "#faad14" : "#ff4d4f",
          }}
        >
          {points.toFixed(1)}
        </Text>
      ),
    },
    {
      title: "Progress",
      key: "progress",
      width: 150,
      render: (_, record) => (
        <Progress
          percent={record.percentage}
          strokeColor={getGradeColor(record.percentage)}
          size="small"
        />
      ),
    },
    {
      title: "Semester",
      dataIndex: "semester",
      key: "semester",
      width: 120,
    },
  ];

  const filteredGrades = courseGrades.filter((course) => {
    const matchesCourse =
      selectedCourse === "all" || course.key === selectedCourse;
    const matchesSemester =
      selectedSemester === "all" ||
      (selectedSemester === "current" && course.semester === "Spring 2025") ||
      (selectedSemester === "previous" && course.semester !== "Spring 2025");
    return matchesCourse && matchesSemester;
  });

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Academic Performance</Title>
        <Text type="secondary">
          Track your grades, GPA, and academic progress across all courses
        </Text>
      </div>

      {/* GPA and Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Current GPA"
              value={gradeData.currentGPA}
              precision={2}
              prefix={<TrophyOutlined />}
              valueStyle={{
                color: gradeData.currentGPA >= 3.5 ? "#52c41a" : "#faad14",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Cumulative GPA"
              value={gradeData.cumulativeGPA}
              precision={2}
              prefix={<LineChartOutlined />}
              valueStyle={{
                color: gradeData.cumulativeGPA >= 3.5 ? "#52c41a" : "#faad14",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Credits"
              value={gradeData.totalCredits}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Courses Completed"
              value={gradeData.completedCourses}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Select
            style={{ width: "100%" }}
            value={selectedSemester}
            onChange={setSelectedSemester}
            placeholder="Select Semester"
          >
            <Option value="current">Current Semester</Option>
            <Option value="previous">Previous Semesters</Option>
            <Option value="all">All Semesters</Option>
          </Select>
        </Col>
        <Col xs={24} sm={8}>
          <Select
            style={{ width: "100%" }}
            value={selectedCourse}
            onChange={setSelectedCourse}
            placeholder="Select Course"
          >
            <Option value="all">All Courses</Option>
            {courseGrades.map((course) => (
              <Option key={course.key} value={course.key}>
                {course.courseCode} - {course.courseName}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8}>
          <Button icon={<DownloadOutlined />} style={{ width: "100%" }}>
            Download Transcript
          </Button>
        </Col>
      </Row>

      {/* Grade Breakdown Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col span={24}>
          <Card title="Grade Distribution">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={6}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#52c41a",
                    }}
                  >
                    {
                      courseGrades.filter((c) => c.letterGrade.includes("A"))
                        .length
                    }
                  </div>
                  <Text type="secondary">A Grades</Text>
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#faad14",
                    }}
                  >
                    {
                      courseGrades.filter((c) => c.letterGrade.includes("B"))
                        .length
                    }
                  </div>
                  <Text type="secondary">B Grades</Text>
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#fa8c16",
                    }}
                  >
                    {
                      courseGrades.filter((c) => c.letterGrade.includes("C"))
                        .length
                    }
                  </div>
                  <Text type="secondary">C Grades</Text>
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#1890ff",
                    }}
                  >
                    {Math.round(
                      courseGrades.reduce((sum, c) => sum + c.percentage, 0) /
                        courseGrades.length
                    )}
                    %
                  </div>
                  <Text type="secondary">Average Score</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Detailed Grades Table */}
      <Card title="Course Grades" style={{ marginBottom: "24px" }}>
        <Table
          columns={columns}
          dataSource={filteredGrades}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) =>
              record.assignments && record.assignments.length > 0,
          }}
          pagination={false}
          scroll={{ x: true }}
        />
      </Card>

      {/* Academic Standing */}
      <Card title="Academic Standing">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong>Current Status:</Text>
              <Text
                style={{
                  color:
                    gradeData.currentGPA >= 3.5
                      ? "#52c41a"
                      : gradeData.currentGPA >= 3.0
                      ? "#faad14"
                      : "#ff4d4f",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                {gradeData.currentGPA >= 3.5
                  ? "Dean's List"
                  : gradeData.currentGPA >= 3.0
                  ? "Good Standing"
                  : "Academic Warning"}
              </Text>

              <div style={{ marginTop: "16px" }}>
                <Text strong>Progress to Graduation:</Text>
                <Progress
                  percent={Math.round((gradeData.totalCredits / 120) * 100)}
                  strokeColor="#52c41a"
                  style={{ marginTop: "8px" }}
                />
                <Text type="secondary">
                  {gradeData.totalCredits}/120 credits completed
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong>Academic Goals:</Text>
              <div>
                <Text>• Maintain GPA above 3.5 ✓</Text>
              </div>
              <div>
                <Text>• Complete 15 credits this semester</Text>
                <Progress
                  percent={73}
                  size="small"
                  style={{ marginTop: "4px" }}
                />
              </div>
              <div>
                <Text>• Graduate with honors (3.7+ GPA)</Text>
                <Progress
                  percent={Math.round((gradeData.cumulativeGPA / 3.7) * 100)}
                  size="small"
                  strokeColor="#722ed1"
                  style={{ marginTop: "4px" }}
                />
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default Grades;

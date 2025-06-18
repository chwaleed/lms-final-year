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
  Rate,
  Avatar,
} from "antd";
import {
  BookOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../../../config/api";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

function Courses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const navigate = useNavigate();

  const getEnrolledCourses = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/course/enrolled-courses`
      );

      if (response?.data) {
        setEnrolledCourses(response.data.enrollments);
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      window.message.error("Falied to fetch enrolled courses");
    }
  };

  useEffect(() => {
    getEnrolledCourses();
  }, []);

  const formatPrice = (price) => {
    if (price === 0 || price === null || price === undefined) {
      return "Free";
    }
    return `$${price}`;
  };

  const filteredCourses = enrolledCourses.filter((enrollment) => {
    const matchesSearch = enrollment.courseId.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      enrollment.courseId.title.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getCourseImage = (course) => {
    if (
      course.thumbnail &&
      course.thumbnail !== "https://placehold.co/600x400.png"
    ) {
      return `${API_BASE_URL}/${course.thumbnail}`;
    }
    return "https://placehold.co/600x400.png";
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>My Courses</Title>
        <Paragraph type="secondary">
          Track your learning progress and continue where you left off
        </Paragraph>{" "}
        <div className="flex justify-end">
          <Button onClick={() => navigate("/student/explore-courses")}>
            Explore Courses
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} md={12}>
          <Search
            placeholder="Search courses..."
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
            <Option value="all">All Courses</Option>
            <Option value="in-progress">In Progress</Option>
            <Option value="completed">Completed</Option>
            <Option value="not-started">Not Started</Option>
          </Select>
        </Col>
      </Row>

      {/* Course Cards */}
      <Row gutter={[16, 16]}>
        {filteredCourses.map((course) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={course._id}>
            <Card
              hoverable
              style={{
                height: "420px",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                border: "1px solid #f0f0f0",
              }}
              bodyStyle={{ padding: "16px", height: "calc(100% - 200px)" }}
              cover={
                <div
                  style={{
                    height: "200px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <img
                    alt={course.courseId.title}
                    src={getCourseImage(course.courseId)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.3s ease",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                    }}
                  >
                    <Tag
                      color={course.courseId.price === 0 ? "green" : "blue"}
                      style={{ fontWeight: "bold" }}
                    >
                      {formatPrice(course.courseId.price)}
                    </Tag>
                  </div>
                </div>
              }
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                {/* Course Title */}
                <Title
                  level={5}
                  ellipsis={{ rows: 2 }}
                  style={{
                    marginBottom: "8px",
                    fontSize: "16px",
                    fontWeight: "600",
                    lineHeight: "1.3",
                  }}
                >
                  {course.courseId.title}
                </Title>

                {/* Instructor */}
                <div
                  style={{
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    style={{ marginRight: "8px" }}
                  />
                  <Text type="secondary" style={{ fontSize: "13px" }}>
                    {course.userId?.name || "Unknown Instructor"}
                  </Text>
                </div>

                {/* Description */}
                <Paragraph
                  ellipsis={{ rows: 2 }}
                  style={{
                    marginBottom: "16px",
                    fontSize: "13px",
                    lineHeight: "1.4",
                    color: "#666",
                  }}
                >
                  {course.description || "No description available"}
                </Paragraph>

                {/* Course Stats */}
                <div style={{ marginTop: "auto" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <Rate
                      disabled
                      defaultValue={4.5}
                      style={{ fontSize: "12px" }}
                    />
                    <Text style={{ fontSize: "11px", color: "#999" }}>
                      (1.2k reviews)
                    </Text>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <Space size="small">
                      <PlayCircleOutlined style={{ color: "#1890ff" }} />
                      <Text style={{ fontSize: "12px", color: "#666" }}>
                        {Math.floor(Math.random() * 20) + 5} lessons
                      </Text>
                    </Space>
                    <Space size="small">
                      <ClockCircleOutlined style={{ color: "#1890ff" }} />
                      <Text style={{ fontSize: "12px", color: "#666" }}>
                        {Math.floor(Math.random() * 10) + 5}h
                      </Text>
                    </Space>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                      type="default"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        navigate(
                          `/student/course-learn/${course.courseId._id}`
                        );
                      }}
                      style={{
                        flex: 1,
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    >
                      Continue Learning
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredCourses.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <BookOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
          <Title level={3} type="secondary">
            No courses found
          </Title>
          <Paragraph type="secondary">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filter criteria"
              : "You haven't enrolled in any courses yet"}
          </Paragraph>
        </div>
      )}
    </div>
  );
}

export default Courses;

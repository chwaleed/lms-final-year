import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Input,
  Select,
  Pagination,
  Rate,
  Skeleton,
  Empty,
  Modal,
  Space,
  Divider,
  Tag,
  Badge,
  Avatar,
} from "antd";
import Model from "../../../../generalComponents/Model";
import {
  FilterOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  BookOutlined,
  TrophyOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import useFetch from "../../../../generalFunctions/useFetch";
import { API_ENDPOINTS } from "../../../../config/api";
import API_BASE_URL from "../../../../config/api";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

function ExploreCourses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [isPriceModalVisible, setIsPriceModalVisible] = useState(false);
  const [pendingEnrollmentCourse, setPendingEnrollmentCourse] = useState(null);
  const [isProcessingEnrollment, setIsProcessingEnrollment] = useState(false);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  // Construct API URL with query parameters
  const apiUrl = `${
    API_ENDPOINTS.ALL_COURSES
  }?page=${currentPage}&limit=${pageSize}&search=${encodeURIComponent(
    debouncedSearchTerm
  )}&sortBy=${sortBy}&sortOrder=${sortOrder}&excludeEnrolled=true`;

  const { data, loading, error, refetch } = useFetch(apiUrl, [
    currentPage,
    pageSize,
    debouncedSearchTerm,
    sortBy,
    sortOrder,
  ]);

  let courses = data?.data?.courses || [];
  const pagination = data?.data?.pagination || {};
  const totalCourses = pagination.totalCourses || 0;

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle sort change
  const handleSortChange = (value) => {
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // Handle course details modal
  const showCourseDetails = (course) => {
    setSelectedCourse(course);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedCourse(null);
  };
  const handleEnrollCourse = async (courseId, coursePrice = 0) => {
    try {
      // Show development message for paid courses
      if (coursePrice > 0) {
        setPendingEnrollmentCourse({ id: courseId, price: coursePrice });
        setIsPriceModalVisible(true);
        // Don't set enrollingCourseId here for paid courses
      } else {
        setEnrollingCourseId(courseId);
        await proceedWithEnrollment(courseId);
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      window.message.error("Failed to enroll in the course. Please try again.");
      setEnrollingCourseId(null);
    }
  };
  const handlePriceModalOk = async () => {
    if (pendingEnrollmentCourse) {
      setIsProcessingEnrollment(true); // Set loading state for modal button
      setIsPriceModalVisible(false);
      setEnrollingCourseId(pendingEnrollmentCourse.id); // Set loading for course cards
      await proceedWithEnrollment(pendingEnrollmentCourse.id);
      setPendingEnrollmentCourse(null);
      setIsProcessingEnrollment(false);
    }
  };
  const handlePriceModalCancel = () => {
    setIsPriceModalVisible(false);
    setPendingEnrollmentCourse(null);
  };

  const proceedWithEnrollment = async (courseId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/course/enrollment/${courseId}`
      );

      if (response.status === 201) {
        window.message.success("Successfully enrolled in the course!");
        refetch();
      }
    } catch (error) {
      if (error.status === 401) {
        window.message.error("You need to be logged in to enroll in courses.");
        return;
      }
      console.error("Enrollment error:", error);
      window.message.error("Failed to enroll in the course. Please try again.");
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Format price
  const formatPrice = (price) => {
    if (price === 0 || price === null || price === undefined) {
      return "Free";
    }
    return `$${price}`;
  };

  // Get course image
  const getCourseImage = (course) => {
    if (
      course.thumbnail &&
      course.thumbnail !== "https://placehold.co/600x400.png"
    ) {
      return `${API_BASE_URL}/${course.thumbnail}`;
    }
    return "https://placehold.co/600x400.png";
  };

  // Get difficulty level color
  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "green";
      case "intermediate":
        return "orange";
      case "advanced":
        return "red";
      default:
        return "blue";
    }
  };

  if (error) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Empty
          description="Failed to load courses"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={refetch}>
            Try Again
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <Title level={1} style={{ marginBottom: "8px", color: "#1890ff" }}>
          Explore Courses
        </Title>
        <Paragraph
          type="secondary"
          style={{ fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}
        >
          Discover new skills and advance your knowledge with our comprehensive
          course catalog
        </Paragraph>
      </div>

      {/* Search and Filter Controls */}
      <Card
        style={{
          marginBottom: "32px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={14}>
            <Input
              placeholder="Search courses by title, description, or instructor..."
              allowClear
              size="large"
              prefix={<EyeOutlined style={{ color: "#bfbfbf" }} />}
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ borderRadius: "8px" }}
            />
          </Col>
          <Col xs={24} md={7}>
            <Select
              placeholder="Sort by"
              style={{ width: "100%" }}
              size="large"
              value={`${sortBy}-${sortOrder}`}
              onChange={handleSortChange}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="createdAt-desc">Newest First</Option>
              <Option value="createdAt-asc">Oldest First</Option>
              <Option value="title-asc">Title A-Z</Option>
              <Option value="title-desc">Title Z-A</Option>
              <Option value="enrolledStudents-desc">Most Popular</Option>
            </Select>
          </Col>
          <Col xs={24} md={3}>
            <Button
              type="default"
              size="large"
              icon={<FilterOutlined />}
              style={{ width: "100%", borderRadius: "8px" }}
            >
              Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Results count */}
      {!loading && (
        <div style={{ marginBottom: "24px" }}>
          <Text type="secondary">
            {debouncedSearchTerm
              ? `Found ${totalCourses} courses for "${debouncedSearchTerm}"`
              : `Showing ${totalCourses} courses`}
          </Text>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Row gutter={[24, 24]}>
          {Array.from({ length: pageSize }).map((_, index) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={index}>
              <Card style={{ borderRadius: "12px" }}>
                <Skeleton loading={true} avatar active>
                  <div style={{ height: "200px" }} />
                </Skeleton>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Course Grid */}
      {!loading && (
        <Row gutter={[24, 24]}>
          {courses.length > 0 ? (
            courses.map((course) => (
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
                        alt={course.title}
                        src={getCourseImage(course)}
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
                          color={course.price === 0 ? "green" : "blue"}
                          style={{ fontWeight: "bold" }}
                        >
                          {formatPrice(course.price)}
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
                      {course.title}
                    </Title>{" "}
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
                      />{" "}
                      <Text type="secondary" style={{ fontSize: "13px" }}>
                        {course.userId?.fullname || "Unknown Instructor"}
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
                        {" "}
                        <Space size="small">
                          <PlayCircleOutlined style={{ color: "#1890ff" }} />
                          <Text style={{ fontSize: "12px", color: "#666" }}>
                            {course.lectureCount || 0} lessons
                          </Text>
                        </Space>
                        <Space size="small">
                          <UserOutlined style={{ color: "#1890ff" }} />
                          <Text style={{ fontSize: "12px", color: "#666" }}>
                            {course.enrolledStudents || 0} students
                          </Text>
                        </Space>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Button
                          type="default"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => showCourseDetails(course)}
                          style={{
                            flex: 1,
                            borderRadius: "6px",
                            fontSize: "12px",
                          }}
                        >
                          Details
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          icon={
                            enrollingCourseId === course._id ? (
                              <LoadingOutlined />
                            ) : (
                              <ShoppingCartOutlined />
                            )
                          }
                          onClick={() =>
                            handleEnrollCourse(course._id, course.price)
                          }
                          loading={enrollingCourseId === course._id}
                          style={{
                            flex: 1,
                            borderRadius: "6px",
                            fontSize: "12px",
                          }}
                        >
                          {course.price > 0 ? "Enroll (Dev Mode)" : "Enroll"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Empty
                  description={
                    <div>
                      <Text style={{ fontSize: "16px", color: "#666" }}>
                        {debouncedSearchTerm
                          ? `No courses found for "${debouncedSearchTerm}"`
                          : "No courses found"}
                      </Text>
                      <br />
                      <Text type="secondary">
                        Try adjusting your search terms or filters
                      </Text>
                    </div>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            </Col>
          )}
        </Row>
      )}

      {/* Pagination */}
      {!loading && courses.length > 0 && (
        <div
          style={{
            textAlign: "center",
            marginTop: "48px",
            padding: "24px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Pagination
            current={currentPage}
            total={totalCourses}
            pageSize={pageSize}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} courses`
            }
            onChange={handlePageChange}
            pageSizeOptions={["12", "24", "36", "48"]}
            size="default"
          />{" "}
        </div>
      )}

      {/* Price/Development Mode Modal */}
      <Model
        isModalOpen={isPriceModalVisible}
        handleOk={handlePriceModalOk}
        handleCancel={handlePriceModalCancel}
      >
        <div style={{ padding: "24px" }}>
          <Title level={3} style={{ marginBottom: "16px", color: "#1890ff" }}>
            <InfoCircleOutlined style={{ marginRight: "8px" }} />
            Development Mode
          </Title>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Text strong style={{ fontSize: "16px" }}>
                Note:
              </Text>
              <Text style={{ fontSize: "14px", marginLeft: "8px" }}>
                This is a development environment. Payment gateways are not
                integrated yet.
              </Text>
            </div>
            <div>
              <Text style={{ fontSize: "14px" }}>
                In a production environment, you would be redirected to a secure
                payment gateway to complete the purchase.
              </Text>
            </div>
            <div>
              <Text style={{ fontSize: "14px" }}>
                For now, you can enroll in both free and paid courses for
                testing purposes.
              </Text>
            </div>
            {pendingEnrollmentCourse && (
              <div
                style={{
                  backgroundColor: "#f6f8fa",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #e1e4e8",
                }}
              >
                <Text strong>Course Price: </Text>
                <Tag color="blue" style={{ fontSize: "14px" }}>
                  ${pendingEnrollmentCourse.price}
                </Tag>
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <Button onClick={handlePriceModalCancel} size="large">
                Cancel
              </Button>{" "}
              <Button
                type="primary"
                onClick={handlePriceModalOk}
                size="large"
                loading={isProcessingEnrollment}
              >
                Continue Enrollment
              </Button>
            </div>
          </Space>
        </div>
      </Model>

      {/* Course Details Modal */}
      <Modal
        title={
          <div
            style={{
              borderBottom: "1px solid #f0f0f0",
              paddingBottom: "16px",
              marginBottom: "16px",
            }}
          >
            <Title level={3} style={{ margin: 0 }}>
              Course Details
            </Title>
          </div>
        }
        visible={isModalVisible}
        onCancel={handleModalClose}
        width={900}
        style={{ top: 20 }}
        footer={[
          <Button key="back" onClick={handleModalClose} size="large">
            Close
          </Button>,
          <Button
            key="enroll"
            type="primary"
            size="large"
            onClick={() =>
              handleEnrollCourse(selectedCourse?._id, selectedCourse?.price)
            }
            loading={enrollingCourseId === selectedCourse?._id}
            style={{ borderRadius: "6px" }}
          >
            {selectedCourse?.price > 0
              ? `Enroll Now (Dev Mode) - ${formatPrice(selectedCourse?.price)}`
              : `Enroll Now - ${formatPrice(selectedCourse?.price)}`}
          </Button>,
        ]}
      >
        {selectedCourse && (
          <div>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={10}>
                <div style={{ position: "relative" }}>
                  <img
                    src={getCourseImage(selectedCourse)}
                    alt={selectedCourse.title}
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Badge.Ribbon
                    text={formatPrice(selectedCourse.price)}
                    color={selectedCourse.price === 0 ? "green" : "blue"}
                  />
                </div>
              </Col>
              <Col xs={24} md={14}>
                <Title level={2} style={{ marginBottom: "16px" }}>
                  {selectedCourse.title}
                </Title>

                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Space>
                      <Avatar icon={<UserOutlined />} />
                      <div>
                        {" "}
                        <Text strong>Instructor: </Text>{" "}
                        <Text style={{ fontSize: "16px" }}>
                          {selectedCourse.userId?.fullname ||
                            "Unknown Instructor"}
                        </Text>
                      </div>
                    </Space>
                  </div>{" "}
                  <div>
                    <Rate disabled defaultValue={4.5} />
                    <Text
                      style={{
                        marginLeft: "8px",
                        fontSize: "14px",
                        color: "#666",
                      }}
                    >
                      4.5 (Coming soon)
                    </Text>
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Card
                        size="small"
                        style={{ textAlign: "center", borderRadius: "8px" }}
                      >
                        <PlayCircleOutlined
                          style={{
                            fontSize: "24px",
                            color: "#1890ff",
                            marginBottom: "8px",
                          }}
                        />{" "}
                        <div>
                          <Text strong>{selectedCourse.lectureCount || 0}</Text>
                          <br />
                          <Text type="secondary">Lessons</Text>
                        </div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card
                        size="small"
                        style={{ textAlign: "center", borderRadius: "8px" }}
                      >
                        <ClockCircleOutlined
                          style={{
                            fontSize: "24px",
                            color: "#1890ff",
                            marginBottom: "8px",
                          }}
                        />{" "}
                        <div>
                          <Text strong>Coming Soon</Text>
                          <br />
                          <Text type="secondary">Duration</Text>
                        </div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card
                        size="small"
                        style={{ textAlign: "center", borderRadius: "8px" }}
                      >
                        <UserOutlined
                          style={{
                            fontSize: "24px",
                            color: "#1890ff",
                            marginBottom: "8px",
                          }}
                        />{" "}
                        <div>
                          <Text strong>
                            {selectedCourse.enrolledStudents || 0}
                          </Text>
                          <br />
                          <Text type="secondary">Students</Text>
                        </div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card
                        size="small"
                        style={{ textAlign: "center", borderRadius: "8px" }}
                      >
                        <TrophyOutlined
                          style={{
                            fontSize: "24px",
                            color: "#1890ff",
                            marginBottom: "8px",
                          }}
                        />
                        <div>
                          <Tag
                            color={getDifficultyColor("Beginner")}
                            style={{ margin: 0 }}
                          >
                            Beginner
                          </Tag>
                          <br />
                          <Text type="secondary">Level</Text>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </Space>
              </Col>
            </Row>

            <Divider style={{ margin: "32px 0" }} />

            <div>
              <Title level={4} style={{ marginBottom: "16px" }}>
                <BookOutlined
                  style={{ marginRight: "8px", color: "#1890ff" }}
                />
                Course Description
              </Title>
              <Paragraph style={{ fontSize: "15px", lineHeight: "1.6" }}>
                {selectedCourse.description ||
                  "This comprehensive course will take you through all the essential concepts and practical applications. You'll learn from industry experts and gain hands-on experience through real-world projects and exercises."}
              </Paragraph>
            </div>

            <Divider style={{ margin: "24px 0" }} />

            <div>
              <Title level={4} style={{ marginBottom: "16px" }}>
                <StarOutlined
                  style={{ marginRight: "8px", color: "#1890ff" }}
                />
                What you'll learn
              </Title>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text>✓ Master the fundamentals and advanced concepts</Text>
                </Col>
                <Col span={12}>
                  <Text>✓ Build real-world projects from scratch</Text>
                </Col>
                <Col span={12}>
                  <Text>✓ Apply best practices and industry standards</Text>
                </Col>
                <Col span={12}>
                  <Text>
                    ✓ Gain hands-on experience with practical exercises
                  </Text>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ExploreCourses;

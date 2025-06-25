import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  List,
  Avatar,
  Button,
  Typography,
  Space,
  Spin,
  Alert,
  Empty,
} from "antd";
import {
  BookOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { API_ENDPOINTS } from "../../../../config/api";
import useFetch from "../../../../generalFunctions/useFetch";

const { Title, Text } = Typography;

function Overview() {
  // Fetch enrolled courses with progress data
  const {
    data: enrolledCoursesData,
    loading: enrolledCoursesLoading,
    error: enrolledCoursesError,
  } = useFetch(API_ENDPOINTS.ENROLLED_COURSES);

  // Process the fetched data
  const enrolledCourses = enrolledCoursesData?.enrollments || [];

  // Calculate statistics from actual data
  const stats = {
    enrolledCourses: enrolledCourses.length,
    completedCourses: enrolledCourses.filter(
      (course) => course.progressDetails?.progressPercentage === 100
    ).length,
    inProgressCourses: enrolledCourses.filter(
      (course) =>
        course.progressDetails?.progressPercentage > 0 &&
        course.progressDetails?.progressPercentage < 100
    ).length,
    averageGrade:
      enrolledCourses.length > 0
        ? Math.round(
            enrolledCourses.reduce(
              (sum, course) =>
                sum + (course.progressDetails?.progressPercentage || 0),
              0
            ) / enrolledCourses.length
          )
        : 0,
  };

  // Generate recent activities from course progress
  const recentActivities = enrolledCourses
    .filter((course) => course.progressDetails?.completedLectures > 0)
    .map((course, index) => ({
      id: course._id + index,
      title: `Watched Lecture in ${course.courseId?.title || "Course"}`,
      course: course.courseId?.title || "Unknown Course",
      time: new Date(course.enrolledAt).toLocaleDateString(),
      type: "lecture",
      score: null,
    }))
    .slice(0, 5); // Show only recent 5 activities

  const getActivityIcon = (type) => {
    switch (type) {
      case "quiz":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "assignment":
        return <BookOutlined style={{ color: "#1890ff" }} />;
      case "lecture":
        return <PlayCircleOutlined style={{ color: "#722ed1" }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  // Loading state
  if (enrolledCoursesLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>
          <Text>Loading your dashboard...</Text>
        </div>
      </div>
    );
  }

  // Error state
  if (enrolledCoursesError) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message="Error Loading Dashboard"
          description="Unable to load your dashboard data. Please try refreshing the page."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2} style={{ marginBottom: "24px" }}>
        Student Dashboard
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Enrolled Courses"
              value={stats.enrolledCourses}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed Courses"
              value={stats.completedCourses}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={stats.inProgressCourses}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Average Progress"
              value={stats.averageGrade}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Activities */}
        <Col xs={24} lg={24}>
          <Card title="Recent Activities" style={{ minHeight: "300px" }}>
            {recentActivities.length > 0 ? (
              <List
                dataSource={recentActivities}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={getActivityIcon(item.type)}
                      title={
                        <Space direction="vertical" size={0}>
                          <Text strong>{item.title}</Text>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            {item.course}
                          </Text>
                        </Space>
                      }
                      description={
                        <Space>
                          <Text type="secondary">{item.time}</Text>
                          {item.score && (
                            <Text
                              style={{
                                color:
                                  item.score === "Pending"
                                    ? "#faad14"
                                    : "#52c41a",
                                fontWeight: "bold",
                              }}
                            >
                              {item.score}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                description="No recent activities"
                style={{ padding: "40px 0" }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Progress Overview */}
      {enrolledCourses.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
          <Col span={24}>
            <Card title="Course Progress Overview">
              <Row gutter={[16, 16]}>
                {enrolledCourses.slice(0, 6).map((course) => (
                  <Col xs={24} md={8} key={course._id}>
                    <Card size="small">
                      <div style={{ textAlign: "center" }}>
                        <Title level={4} style={{ marginBottom: "16px" }}>
                          {course.courseId?.title || "Unknown Course"}
                        </Title>
                        <Progress
                          type="circle"
                          percent={
                            course.progressDetails?.progressPercentage || 0
                          }
                          strokeColor={
                            course.progressDetails?.progressPercentage === 100
                              ? "#52c41a"
                              : course.progressDetails?.progressPercentage > 50
                              ? "#1890ff"
                              : "#faad14"
                          }
                        />
                        <div style={{ marginTop: "8px" }}>
                          <Text>
                            {course.progressDetails?.completedLectures || 0}/
                            {course.progressDetails?.totalLectures || 0} Lessons
                            Completed
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      {/* Empty state for no enrolled courses */}
      {enrolledCourses.length === 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
          <Col span={24}>
            <Card>
              <Empty
                description="You haven't enrolled in any courses yet"
                style={{ padding: "40px 0" }}
              >
                <Button type="primary" href="/student/explore-courses">
                  Explore Courses
                </Button>
              </Empty>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default Overview;

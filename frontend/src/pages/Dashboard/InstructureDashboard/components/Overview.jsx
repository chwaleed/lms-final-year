import React, { useState, useEffect } from "react";
import {
  Layout,
  Row,
  Col,
  Card,
  Typography,
  Statistic,
  List,
  Avatar,
  Button,
  Breadcrumb,
  Space,
  Spin,
  Alert,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  LineChartOutlined,
  PlusOutlined,
  EyeOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Line } from "@ant-design/charts";
import axios from "axios";
import { userInfoStore } from "../../../../context/store";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const Overview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = userInfoStore();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null); // Fetch instructor courses
      const coursesResponse = await axios.get("/api/courses/paginated", {
        params: { limit: 100 }, // Get all courses for stats
      });

      const courses = coursesResponse.data?.data?.courses || [];
      const totalCourses = courses.length; // Calculate total enrollments across all courses
      let totalEnrollments = 0;
      let recentEnrollments = [];
      let enrollmentTrendData = [];
      let activeStudents = 0;

      // Try to fetch detailed enrollment data, fallback to course data if not available
      try {
        // For each course, fetch enrollment data
        const enrollmentPromises = courses.map(async (course) => {
          try {
            const enrollmentResponse = await axios.get(
              `/api/instructor/course/${course._id}/enrollments`
            );
            return {
              courseId: course._id,
              courseTitle: course.title,
              enrollments: enrollmentResponse.data?.enrollments || [],
            };
          } catch (err) {
            console.error(
              `Error fetching enrollments for course ${course._id}:`,
              err
            );
            // Fallback to course's enrolledStudents count
            return {
              courseId: course._id,
              courseTitle: course.title,
              enrollments: [],
              fallbackCount: course.enrolledStudents || 0,
            };
          }
        });

        const enrollmentResults = await Promise.all(enrollmentPromises);

        // Process enrollment data
        const allEnrollments = [];
        enrollmentResults.forEach((result) => {
          if (result.enrollments.length > 0) {
            totalEnrollments += result.enrollments.length;
            result.enrollments.forEach((enrollment) => {
              allEnrollments.push({
                ...enrollment,
                courseTitle: result.courseTitle,
              });
            });
          } else if (result.fallbackCount) {
            // Use fallback count from course data
            totalEnrollments += result.fallbackCount;
          }
        });

        // Get recent enrollments (last 5) if we have detailed data
        if (allEnrollments.length > 0) {
          recentEnrollments = allEnrollments
            .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))
            .slice(0, 5)
            .map((enrollment) => ({
              id: enrollment._id,
              name:
                enrollment.userId?.fullname ||
                enrollment.userId?.name ||
                "Unknown User",
              course: enrollment.courseTitle,
              avatar: enrollment.userId?.avatar || null,
              date: new Date(enrollment.enrolledAt).toLocaleDateString(),
            }));

          // Calculate enrollment trend (last 7 months)
          const now = new Date();
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          enrollmentTrendData = [];

          for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = months[date.getMonth()];
            const monthEnrollments = allEnrollments.filter((enrollment) => {
              const enrollmentDate = new Date(enrollment.enrolledAt);
              return (
                enrollmentDate.getMonth() === date.getMonth() &&
                enrollmentDate.getFullYear() === date.getFullYear()
              );
            });

            enrollmentTrendData.push({
              month: monthName,
              value: monthEnrollments.length,
            });
          }

          // Calculate active students (unique enrolled users)
          const uniqueStudentIds = new Set(
            allEnrollments.map((e) => e.userId?._id || e.userId)
          );
          activeStudents = uniqueStudentIds.size;
        } else {
          // Fallback: generate mock trend data if no detailed enrollment data
          const now = new Date();
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          enrollmentTrendData = [];

          for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = months[date.getMonth()];
            enrollmentTrendData.push({
              month: monthName,
              value: Math.floor(totalEnrollments / 7), // Distribute roughly
            });
          }

          activeStudents = totalEnrollments; // Rough estimate
        }
      } catch (err) {
        console.error("Error processing enrollment data:", err);
        // Final fallback: use basic course data
        totalEnrollments = courses.reduce(
          (sum, course) => sum + (course.enrolledStudents || 0),
          0
        );
        activeStudents = totalEnrollments;

        // Create basic trend data
        const now = new Date();
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        enrollmentTrendData = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = months[date.getMonth()];
          enrollmentTrendData.push({
            month: monthName,
            value: Math.floor(totalEnrollments / 7),
          });
        }
      }

      // Calculate enrollment change (comparing this month vs last month)
      const currentMonth =
        enrollmentTrendData[enrollmentTrendData.length - 1]?.value || 0;
      const lastMonth =
        enrollmentTrendData[enrollmentTrendData.length - 2]?.value || 0;
      const enrollmentChange =
        lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0;

      setDashboardData({
        totalEnrollments,
        enrollmentChange: parseFloat(enrollmentChange.toFixed(1)),
        totalCourses,
        totalQuizzes: 0, // You can implement this if you have quizzes
        activeStudents,
        recentEnrollments,
        enrollmentTrendData,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const enrollmentChartConfig = {
    data: dashboardData?.enrollmentTrendData || [],
    xField: "month",
    yField: "value",
    height: 300,
    point: {
      size: 5,
      shape: "diamond",
    },
    label: {
      style: {
        fill: "#aaa",
      },
    },
    tooltip: {
      formatter: (datum) => ({ name: "Enrollments", value: datum.value }),
    },
  };

  if (loading) {
    return (
      <Content className="p-4 md:p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </Content>
    );
  }
  if (error) {
    return (
      <Content className="p-4 md:p-6 bg-gray-100 min-h-screen">
        <Alert
          message="Error Loading Dashboard"
          description={error}
          type="error"
          showIcon
          action={
            <Button
              size="small"
              danger
              onClick={fetchDashboardData}
              loading={loading}
            >
              Retry
            </Button>
          }
        />
      </Content>
    );
  }

  return (
    <Content className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item href="">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <span>Dashboard</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Overview</Breadcrumb.Item>
      </Breadcrumb>{" "}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <Title level={2} className="text-gray-800">
              Dashboard Overview
            </Title>
            <Paragraph className="text-gray-600">
              Welcome back, {user?.name || user?.fullname || "Instructor"}!
              Here's what's happening with your LMS.
            </Paragraph>
          </div>
          <Button
            type="primary"
            onClick={fetchDashboardData}
            loading={loading}
            icon={<ArrowUpOutlined />}
          >
            Refresh
          </Button>
        </div>
      </div>
      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Statistic
              title={<Text className="text-gray-500">Total Enrollments</Text>}
              value={dashboardData?.totalEnrollments || 0}
              precision={0}
              valueStyle={{
                color:
                  dashboardData?.enrollmentChange >= 0 ? "#3f8600" : "#cf1322",
                fontWeight: "bold",
              }}
              prefix={<UserOutlined className="mr-2 text-green-500" />}
              suffix={
                dashboardData?.enrollmentChange !== 0 && (
                  <span
                    className={`text-xs ${
                      dashboardData?.enrollmentChange >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {dashboardData?.enrollmentChange >= 0 ? (
                      <ArrowUpOutlined />
                    ) : (
                      <ArrowDownOutlined />
                    )}
                    {Math.abs(dashboardData?.enrollmentChange || 0)}%
                  </span>
                )
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Statistic
              title={<Text className="text-gray-500">Total Courses</Text>}
              value={dashboardData?.totalCourses || 0}
              valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
              prefix={<BookOutlined className="mr-2 text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Statistic
              title={<Text className="text-gray-500">Active Students</Text>}
              value={dashboardData?.activeStudents || 0}
              valueStyle={{ color: "#eb2f96", fontWeight: "bold" }}
              prefix={<TeamOutlined className="mr-2 text-pink-500" />}
            />
          </Card>
        </Col>
      </Row>
      {/* Charts and Recent Activity */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} lg={16}>
          <Card
            title={
              <>
                <LineChartOutlined className="mr-2" /> Enrollment Trends (Last 7
                Months)
              </>
            }
            className="shadow-lg"
          >
            {dashboardData?.enrollmentTrendData?.length > 0 ? (
              <Line {...enrollmentChartConfig} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No enrollment data available
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <>
                <UserOutlined className="mr-2" /> Recent Enrollments
              </>
            }
            className="shadow-lg"
            extra={<Button type="link">View All</Button>}
          >
            {dashboardData?.recentEnrollments?.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={dashboardData.recentEnrollments}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar src={item.avatar} icon={<UserOutlined />} />
                      }
                      title={<span>{item.name}</span>}
                      description={
                        <Text type="secondary" className="text-xs">
                          Enrolled in "{item.course}" on {item.date}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent enrollments
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Content>
  );
};

export default Overview;

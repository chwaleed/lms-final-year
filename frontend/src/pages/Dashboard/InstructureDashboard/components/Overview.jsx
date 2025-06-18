import React from "react";
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
import { Line } from "@ant-design/charts"; // For the chart

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// Sample Data (replace with actual data fetching)
const dashboardData = {
  totalEnrollments: 1234,
  enrollmentChange: 12.5, // percentage
  totalCourses: 78,
  totalQuizzes: 215,
  activeStudents: 890,
  recentEnrollments: [
    {
      id: 1,
      name: "Alice Wonderland",
      course: "Introduction to React",
      avatar:
        "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      date: "2024-07-28",
    },
    {
      id: 2,
      name: "Bob The Builder",
      course: "Advanced Tailwind CSS",
      avatar:
        "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      date: "2024-07-27",
    },
    {
      id: 3,
      name: "Charlie Brown",
      course: "State Management with Zustand",
      avatar:
        "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      date: "2024-07-27",
    },
  ],
  enrollmentTrendData: [
    { month: "Jan", value: 150 },
    { month: "Feb", value: 200 },
    { month: "Mar", value: 180 },
    { month: "Apr", value: 250 },
    { month: "May", value: 300 },
    { month: "Jun", value: 280 },
    { month: "Jul", value: 320 },
  ],
};

const Overview = () => {
  const enrollmentChartConfig = {
    data: dashboardData.enrollmentTrendData,
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

  return (
    // Assuming this Content is within your main Ant Design Layout
    // The parent Layout would have the Sider (sidebar)
    <Content className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item href="">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <span>Dashboard</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Overview</Breadcrumb.Item>
      </Breadcrumb>

      <div className="mb-6">
        <Title level={2} className="text-gray-800">
          Dashboard Overview
        </Title>
        <Paragraph className="text-gray-600">
          Welcome back, Admin! Here's what's happening with your LMS.
        </Paragraph>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Statistic
              title={<Text className="text-gray-500">Total Enrollments</Text>}
              value={dashboardData.totalEnrollments}
              precision={0}
              valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
              prefix={<UserOutlined className="mr-2 text-green-500" />}
              suffix={
                <span className="text-xs text-green-500">
                  <ArrowUpOutlined /> {dashboardData.enrollmentChange}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Statistic
              title={<Text className="text-gray-500">Total Courses</Text>}
              value={dashboardData.totalCourses}
              valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
              prefix={<BookOutlined className="mr-2 text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Statistic
              title={<Text className="text-gray-500">Total Quizzes</Text>}
              value={dashboardData.totalQuizzes}
              valueStyle={{ color: "#faad14", fontWeight: "bold" }}
              prefix={
                <QuestionCircleOutlined className="mr-2 text-yellow-500" />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Statistic
              title={<Text className="text-gray-500">Active Students</Text>}
              value={dashboardData.activeStudents}
              valueStyle={{ color: "#eb2f96", fontWeight: "bold" }}
              prefix={<TeamOutlined className="mr-2 text-pink-500" />}
            />
            {/* Example of adding a small trend, replace with actual data
            <div className="text-xs text-red-500 mt-1">
              <ArrowDownOutlined /> 2.1% last week
            </div>
            */}
          </Card>
        </Col>
      </Row>

      {/* Charts and Recent Activity */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} lg={16}>
          <Card
            title={
              <>
                <LineChartOutlined className="mr-2" /> Enrollment Trends (Last 6
                Months)
              </>
            }
            className="shadow-lg"
          >
            <Line {...enrollmentChartConfig} />
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
            <List
              itemLayout="horizontal"
              dataSource={dashboardData.recentEnrollments}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar src={item.avatar} icon={<UserOutlined />} />
                    }
                    title={<a href={`/users/${item.id}`}>{item.name}</a>}
                    description={
                      <Text type="secondary" className="text-xs">
                        Enrolled in "{item.course}" on {item.date}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Quick Actions" className="shadow-lg">
            <Space wrap>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create New Course
              </Button>
              <Button icon={<UserOutlined />}>Manage Users</Button>
              <Button icon={<BookOutlined />}>View All Courses</Button>
              <Button icon={<QuestionCircleOutlined />}>Manage Quizzes</Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </Content>
  );
};

export default Overview;

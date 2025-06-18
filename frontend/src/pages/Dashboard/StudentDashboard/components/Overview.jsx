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
} from "antd";
import {
  BookOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

function Overview() {
  // Mock data - replace with actual data from API
  const stats = {
    enrolledCourses: 5,
    completedCourses: 2,
    inProgressCourses: 3,
    averageGrade: 85,
  };

  const recentActivities = [
    {
      id: 1,
      title: "Completed Quiz: JavaScript Basics",
      course: "Web Development",
      time: "2 hours ago",
      type: "quiz",
      score: "95%",
    },
    {
      id: 2,
      title: "Submitted Assignment: React Components",
      course: "Advanced React",
      time: "1 day ago",
      type: "assignment",
      score: "Pending",
    },
    {
      id: 3,
      title: "Watched Lecture: State Management",
      course: "Advanced React",
      time: "2 days ago",
      type: "lecture",
      score: null,
    },
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      title: "Final Project Submission",
      course: "Web Development",
      dueDate: "2025-06-20",
      priority: "high",
    },
    {
      id: 2,
      title: "Chapter 5 Quiz",
      course: "Database Design",
      dueDate: "2025-06-18",
      priority: "medium",
    },
    {
      id: 3,
      title: "Essay: Modern UI/UX Trends",
      course: "UI/UX Design",
      dueDate: "2025-06-22",
      priority: "low",
    },
  ];

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ff4d4f";
      case "medium":
        return "#faad14";
      case "low":
        return "#52c41a";
      default:
        return "#d9d9d9";
    }
  };

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
              title="Average Grade"
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
        <Col xs={24} lg={12}>
          <Card title="Recent Activities" style={{ height: "400px" }}>
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
          </Card>
        </Col>

        {/* Upcoming Deadlines */}
        <Col xs={24} lg={12}>
          <Card title="Upcoming Deadlines" style={{ height: "400px" }}>
            <List
              dataSource={upcomingDeadlines}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<CalendarOutlined />}
                        style={{
                          backgroundColor: getPriorityColor(item.priority),
                        }}
                      />
                    }
                    title={
                      <Space direction="vertical" size={0}>
                        <Text strong>{item.title}</Text>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {item.course}
                        </Text>
                      </Space>
                    }
                    description={
                      <Text type="secondary">Due: {item.dueDate}</Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Overview */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col span={24}>
          <Card title="Course Progress Overview">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card size="small">
                  <div style={{ textAlign: "center" }}>
                    <Title level={4}>Web Development</Title>
                    <Progress
                      type="circle"
                      percent={75}
                      strokeColor="#52c41a"
                    />
                    <div style={{ marginTop: "8px" }}>
                      <Text>15/20 Lessons Completed</Text>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small">
                  <div style={{ textAlign: "center" }}>
                    <Title level={4}>Advanced React</Title>
                    <Progress
                      type="circle"
                      percent={60}
                      strokeColor="#1890ff"
                    />
                    <div style={{ marginTop: "8px" }}>
                      <Text>12/20 Lessons Completed</Text>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small">
                  <div style={{ textAlign: "center" }}>
                    <Title level={4}>Database Design</Title>
                    <Progress
                      type="circle"
                      percent={30}
                      strokeColor="#faad14"
                    />
                    <div style={{ marginTop: "8px" }}>
                      <Text>6/20 Lessons Completed</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Overview;

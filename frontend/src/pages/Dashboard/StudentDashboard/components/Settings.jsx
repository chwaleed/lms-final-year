import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Upload,
  Avatar,
  Typography,
  Space,
  Divider,
  notification,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BookOutlined,
  BellOutlined,
  SecurityScanOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  CameraOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function Settings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Mock user data - replace with actual data from API
  const [userProfile, setUserProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@student.university.edu",
    phone: "+1 (555) 123-4567",
    studentId: "STU123456",
    major: "Computer Science",
    year: "Junior",
    bio: "Passionate computer science student with interests in web development and artificial intelligence.",
    avatar: null,
    dateOfBirth: "1998-05-15",
    address: "123 University Ave, College Town, ST 12345",
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Mother",
      phone: "+1 (555) 987-6543",
    },
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    assignmentReminders: true,
    gradeNotifications: true,
    courseUpdates: true,
    deadlineAlerts: true,
    weeklyDigest: false,
  });

  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "America/New_York",
    theme: "light",
    defaultDashboard: "overview",
  });

  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUserProfile({ ...userProfile, ...values });
      notification.success({
        message: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch {
      notification.error({
        message: "Update Failed",
        description: "There was an error updating your profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      notification.error({
        message: "Password Mismatch",
        description: "New password and confirmation do not match.",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      notification.success({
        message: "Password Changed",
        description: "Your password has been successfully updated.",
      });
      form.resetFields(["currentPassword", "newPassword", "confirmPassword"]);
    } catch {
      notification.error({
        message: "Password Change Failed",
        description: "There was an error changing your password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key, value) => {
    setNotifications({ ...notifications, [key]: value });
    notification.success({
      message: "Notification Settings Updated",
      description: `${key.replace(/([A-Z])/g, " $1").toLowerCase()} ${
        value ? "enabled" : "disabled"
      }.`,
    });
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences({ ...preferences, [key]: value });
    notification.success({
      message: "Preferences Updated",
      description: "Your preferences have been saved.",
    });
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Account Settings</Title>
      <Text type="secondary">
        Manage your profile, preferences, and account security
      </Text>

      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        {/* Profile Information */}
        <Col xs={24} lg={12}>
          <Card title="Profile Information" extra={<UserOutlined />}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <Avatar
                size={80}
                src={userProfile.avatar}
                icon={<UserOutlined />}
                style={{ marginBottom: "8px" }}
              />
              <div>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={() => false}
                >
                  <Button icon={<CameraOutlined />} size="small">
                    Change Photo
                  </Button>
                </Upload>
              </div>
            </div>

            <Form
              layout="vertical"
              initialValues={userProfile}
              onFinish={handleProfileUpdate}
            >
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your first name",
                      },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your last name",
                      },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>

              <Form.Item label="Phone" name="phone">
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Student ID" name="studentId">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Academic Year" name="year">
                    <Select>
                      <Option value="Freshman">Freshman</Option>
                      <Option value="Sophomore">Sophomore</Option>
                      <Option value="Junior">Junior</Option>
                      <Option value="Senior">Senior</Option>
                      <Option value="Graduate">Graduate</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Major" name="major">
                <Input prefix={<BookOutlined />} />
              </Form.Item>

              <Form.Item label="Bio" name="bio">
                <TextArea rows={3} placeholder="Tell us about yourself..." />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  block
                >
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Security Settings */}
        <Col xs={24} lg={12}>
          <Card title="Security Settings" extra={<SecurityScanOutlined />}>
            <Form layout="vertical" onFinish={handlePasswordChange} form={form}>
              <Form.Item
                label="Current Password"
                name="currentPassword"
                rules={[
                  {
                    required: true,
                    message: "Please enter your current password",
                  },
                ]}
              >
                <Input.Password
                  prefix={<SecurityScanOutlined />}
                  iconRender={(visible) =>
                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item
                label="New Password"
                name="newPassword"
                rules={[
                  { required: true, message: "Please enter your new password" },
                  { min: 8, message: "Password must be at least 8 characters" },
                ]}
              >
                <Input.Password
                  prefix={<SecurityScanOutlined />}
                  iconRender={(visible) =>
                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item
                label="Confirm New Password"
                name="confirmPassword"
                rules={[
                  {
                    required: true,
                    message: "Please confirm your new password",
                  },
                ]}
              >
                <Input.Password
                  prefix={<SecurityScanOutlined />}
                  iconRender={(visible) =>
                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  block
                >
                  Change Password
                </Button>
              </Form.Item>
            </Form>

            <Divider />

            <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong>Two-Factor Authentication</Text>
              <Text type="secondary">
                Add an extra layer of security to your account
              </Text>
              <Button type="default" block>
                Setup 2FA
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Notification Preferences */}
        <Col xs={24} lg={12}>
          <Card title="Notification Preferences" extra={<BellOutlined />}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Text>Email Notifications</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Receive notifications via email
                  </Text>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onChange={(checked) =>
                    handleNotificationChange("emailNotifications", checked)
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Text>Push Notifications</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Receive browser push notifications
                  </Text>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onChange={(checked) =>
                    handleNotificationChange("pushNotifications", checked)
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Text>Assignment Reminders</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Get reminded about upcoming assignments
                  </Text>
                </div>
                <Switch
                  checked={notifications.assignmentReminders}
                  onChange={(checked) =>
                    handleNotificationChange("assignmentReminders", checked)
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Text>Grade Notifications</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Get notified when grades are posted
                  </Text>
                </div>
                <Switch
                  checked={notifications.gradeNotifications}
                  onChange={(checked) =>
                    handleNotificationChange("gradeNotifications", checked)
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Text>Course Updates</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Receive updates about course content
                  </Text>
                </div>
                <Switch
                  checked={notifications.courseUpdates}
                  onChange={(checked) =>
                    handleNotificationChange("courseUpdates", checked)
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Text>Deadline Alerts</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Get alerts for approaching deadlines
                  </Text>
                </div>
                <Switch
                  checked={notifications.deadlineAlerts}
                  onChange={(checked) =>
                    handleNotificationChange("deadlineAlerts", checked)
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Text>Weekly Digest</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Receive weekly summary emails
                  </Text>
                </div>
                <Switch
                  checked={notifications.weeklyDigest}
                  onChange={(checked) =>
                    handleNotificationChange("weeklyDigest", checked)
                  }
                />
              </div>
            </Space>
          </Card>
        </Col>

        {/* General Preferences */}
        <Col xs={24} lg={12}>
          <Card title="General Preferences">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text strong>Language</Text>
                <Select
                  style={{ width: "100%", marginTop: "8px" }}
                  value={preferences.language}
                  onChange={(value) =>
                    handlePreferenceChange("language", value)
                  }
                >
                  <Option value="en">English</Option>
                  <Option value="es">Español</Option>
                  <Option value="fr">Français</Option>
                  <Option value="de">Deutsch</Option>
                </Select>
              </div>

              <div>
                <Text strong>Timezone</Text>
                <Select
                  style={{ width: "100%", marginTop: "8px" }}
                  value={preferences.timezone}
                  onChange={(value) =>
                    handlePreferenceChange("timezone", value)
                  }
                >
                  <Option value="America/New_York">Eastern Time (ET)</Option>
                  <Option value="America/Chicago">Central Time (CT)</Option>
                  <Option value="America/Denver">Mountain Time (MT)</Option>
                  <Option value="America/Los_Angeles">Pacific Time (PT)</Option>
                </Select>
              </div>

              <div>
                <Text strong>Theme</Text>
                <Select
                  style={{ width: "100%", marginTop: "8px" }}
                  value={preferences.theme}
                  onChange={(value) => handlePreferenceChange("theme", value)}
                >
                  <Option value="light">Light</Option>
                  <Option value="dark">Dark</Option>
                  <Option value="auto">Auto</Option>
                </Select>
              </div>

              <div>
                <Text strong>Default Dashboard View</Text>
                <Select
                  style={{ width: "100%", marginTop: "8px" }}
                  value={preferences.defaultDashboard}
                  onChange={(value) =>
                    handlePreferenceChange("defaultDashboard", value)
                  }
                >
                  <Option value="overview">Overview</Option>
                  <Option value="courses">My Courses</Option>
                  <Option value="assignments">Assignments</Option>
                  <Option value="grades">Grades</Option>
                </Select>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Emergency Contact */}
        <Col span={24}>
          <Card title="Emergency Contact Information">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Form.Item label="Contact Name">
                  <Input defaultValue={userProfile.emergencyContact.name} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Relationship">
                  <Input
                    defaultValue={userProfile.emergencyContact.relationship}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Phone Number">
                  <Input defaultValue={userProfile.emergencyContact.phone} />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" icon={<SaveOutlined />}>
              Update Emergency Contact
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Settings;

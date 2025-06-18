import React from "react";
import { Form, Input, Button, Typography, Radio } from "antd"; // Added Radio
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SolutionOutlined,
  IdcardOutlined,
} from "@ant-design/icons"; // Added IdcardOutlined for Role
import { Link } from "react-router";

const { Title } = Typography;

const RegistrationForm = ({ onSubmit }) => {
  const [form] = Form.useForm();

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
      <div className="text-center mb-8">
        <Title level={2} className="!text-gray-700">
          Create Your Account
        </Title>
        <p className="text-gray-500">
          Join us today! It takes only a few steps.
        </p>
      </div>
      <Form
        form={form}
        name="register"
        onFinish={(e) => {
          onSubmit(e, form);
        }}
        layout="vertical"
        scrollToFirstError
        initialValues={{ role: "student" }}
      >
        <Form.Item
          name="fullName"
          label={<span className="font-semibold text-gray-600">Full Name</span>}
          rules={[
            {
              required: true,
              message: "Please input your full name!",
              whitespace: true,
            },
          ]}
        >
          <Input
            prefix={
              <SolutionOutlined className="site-form-item-icon text-gray-400" />
            }
            placeholder="e.g., John Doe"
            size="large"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label={
            <span className="font-semibold text-gray-600">Email Address</span>
          }
          rules={[
            {
              type: "email",
              message: "The input is not a valid E-mail!",
            },
            {
              required: true,
              message: "Please input your E-mail!",
            },
          ]}
        >
          <Input
            prefix={
              <MailOutlined className="site-form-item-icon text-gray-400" />
            }
            placeholder="your.email@example.com"
            size="large"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          name="username"
          label={<span className="font-semibold text-gray-600">Username</span>}
          rules={[
            {
              required: true,
              message: "Please input your username!",
              whitespace: true,
            },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message:
                "Username can only contain letters, numbers, and underscores.",
            },
          ]}
        >
          <Input
            prefix={
              <UserOutlined className="site-form-item-icon text-gray-400" />
            }
            placeholder="Choose a unique username"
            size="large"
            className="rounded-md"
          />
        </Form.Item>

        {/* Role Selection */}
        <Form.Item
          name="role"
          label={
            <span className="font-semibold text-gray-600">Register as</span>
          }
          rules={[{ required: true, message: "Please select your role!" }]}
        >
          <Radio.Group
            size="large"
            className="w-full"
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="student" className="!flex-1 !text-center">
              <IdcardOutlined className="mr-1" /> Student
            </Radio.Button>
            <Radio.Button value="instructor" className="!flex-1 !text-center">
              <IdcardOutlined className="mr-1" /> Teacher
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="password"
          label={<span className="font-semibold text-gray-600">Password</span>}
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
            {
              min: 8,
              message: "Password must be at least 8 characters long.",
            },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={
              <LockOutlined className="site-form-item-icon text-gray-400" />
            }
            placeholder="Enter your password (min. 8 characters)"
            size="large"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          name="confirm"
          label={
            <span className="font-semibold text-gray-600">
              Confirm Password
            </span>
          }
          dependencies={["password"]}
          hasFeedback
          rules={[
            {
              required: true,
              message: "Please confirm your password!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The two passwords that you entered do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={
              <LockOutlined className="site-form-item-icon text-gray-400" />
            }
            placeholder="Re-enter your password"
            size="large"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item shouldUpdate>
          {() => {
            const hasErrors = form
              .getFieldsError()
              .some(({ errors }) => errors.length > 0);

            return (
              <Button
                type="primary"
                htmlType="submit"
                disabled={hasErrors}
                className="w-full bg-teal-600 hover:bg-teal-700 border-teal-600 hover:border-teal-700"
                size="large"
              >
                Register
              </Button>
            );
          }}
        </Form.Item>
        <div className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to={"/login"} className="text-teal-600 hover:text-teal-500">
            Log in here!
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default RegistrationForm;

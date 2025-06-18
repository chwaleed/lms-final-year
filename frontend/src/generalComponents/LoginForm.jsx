import React from "react";
import { Form, Input, Button, Checkbox, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link } from "react-router";

const { Title } = Typography;

const LoginForm = ({ onSubmit }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
      <div className="text-center mb-8">
        <Title level={2} className="!text-gray-700">
          Welcome Back!
        </Title>
        <p className="text-gray-500">Please enter your credentials to login.</p>
      </div>
      <Form
        name="normal_login"
        className="login-form"
        initialValues={{
          remember: true,
        }}
        onFinish={onSubmit}
        layout="vertical" // Makes labels appear above inputs
      >
        <Form.Item
          name="username"
          label={<span className="font-semibold text-gray-600">Username</span>}
          rules={[
            {
              required: true,
              message: "Please input your Username!",
            },
          ]}
        >
          <Input
            prefix={
              <UserOutlined className="site-form-item-icon text-gray-400" />
            }
            placeholder="Username or Email"
            size="large"
            className="rounded-md"
          />
        </Form.Item>
        <Form.Item
          name="password"
          label={<span className="font-semibold text-gray-600">Password</span>}
          rules={[
            {
              required: true,
              message: "Please input your Password!",
            },
          ]}
        >
          <Input.Password
            prefix={
              <LockOutlined className="site-form-item-icon text-gray-400" />
            }
            type="password"
            placeholder="Password"
            size="large"
            className="rounded-md"
          />
        </Form.Item>
        <Form.Item>
          <div className="flex justify-between items-center">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="text-gray-600">Remember me</Checkbox>
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item shouldUpdate>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button w-full bg-indigo-600 hover:bg-indigo-700 border-indigo-600 hover:border-indigo-700"
            size="large"
          >
            Log in
          </Button>
        </Form.Item>
        <div className="text-center text-sm text-gray-500">
          Or{" "}
          <Link
            to={"/register"}
            className="text-indigo-600 hover:text-indigo-500"
          >
            register now!
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default LoginForm;

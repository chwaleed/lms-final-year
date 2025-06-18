import React from "react";
import { userInfoStore } from "../context/store";
import { useNavigate } from "react-router";
import { logout } from "../generalFunctions/methods";
import { Button, Typography, Space } from "antd";
import { ExclamationCircleOutlined, LogoutOutlined } from "@ant-design/icons";
import Model from "./Model";

const { Title, Text } = Typography;

function LogoutModel({ isModalOpen, setIsModalOpen }) {
  const { clearUser } = userInfoStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const success = await logout();

    if (success) {
      clearUser();
      navigate("/login");
    }
    setIsModalOpen(false);
  };
  return (
    <Model
      isModalOpen={isModalOpen}
      handleOk={handleLogout}
      handleCancel={() => setIsModalOpen(false)}
    >
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        {/* Icon */}
        <ExclamationCircleOutlined
          style={{
            fontSize: "48px",
            color: "#faad14",
            marginBottom: "16px",
          }}
        />

        {/* Title */}
        <Title level={3} style={{ marginBottom: "8px" }}>
          Logout
        </Title>

        {/* Message */}
        <Text style={{ fontSize: "16px", color: "#666" }}>
          {/* You are about to logout, {userName} */}
        </Text>

        <div style={{ marginTop: "8px" }}>
          <Text style={{ fontSize: "14px", color: "#999" }}>
            You will need to sign in again to access your account.
          </Text>
        </div>

        {/* Action Buttons */}
        <Space
          style={{
            marginTop: "32px",
            width: "100%",
            justifyContent: "center",
          }}
          size="middle"
        >
          <Button
            size="large"
            onClick={() => setIsModalOpen(false)}
            style={{ minWidth: "100px" }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            danger
            size="large"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ minWidth: "100px" }}
          >
            Logout
          </Button>
        </Space>
      </div>
    </Model>
  );
}

export default LogoutModel;

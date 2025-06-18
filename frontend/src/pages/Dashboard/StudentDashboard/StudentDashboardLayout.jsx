import { Outlet, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import Sidebar from "../../../generalComponents/Sidebar";
import { Layout } from "antd";
import LogoutModel from "../../../generalComponents/LogoutModel";
import { studentNavigationItems } from "../../../utils/navigationData";

const { Sider, Content } = Layout;

function StudentDashboardLayout() {
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const onClick = (e) => {
    setSelectedKey(e.key);
    if (e.key == "logout") {
      setIsModalOpen(true);
      return;
    }

    navigate(`/student/${e.key}`);
  };
  useEffect(() => {
    const currentPath = window.location.pathname.split("/").pop();

    if (currentPath === "dashboard") {
      navigate("/student/dashboard");
      return;
    }
    setSelectedKey(currentPath);
  }, [navigate]);

  return (
    <Layout className="site-layout ">
      <Sider
        className="site-layout-sider"
        width={280}
        style={{ position: "fixed", height: "100vh" }}
      >
        <Sidebar
          selectedKey={selectedKey}
          menuItems={studentNavigationItems}
          onMenuClick={onClick}
        />
      </Sider>
      <Layout style={{ marginLeft: 280, height: "100vh" }}>
        <Content>
          <Outlet />
        </Content>
      </Layout>
      <style jsx="true">{`
        body {
          background-color: #f5f5f5;
        }
      `}</style>
      <LogoutModel setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} />
    </Layout>
  );
}

export default StudentDashboardLayout;

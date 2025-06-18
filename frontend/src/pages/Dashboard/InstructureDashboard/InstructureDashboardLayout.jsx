import { Layout, Menu, Card, Col, Row } from "antd";
import { Outlet, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import Sidebar from "../../../generalComponents/Sidebar";
import LogoutModel from "../../../generalComponents/LogoutModel";
import { instructorNavigationItems } from "../../../utils/navigationData";

const { Sider, Content } = Layout;

function InstructureDashboardLayout() {
  const [selectedKey, setSelectedKey] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const nevigate = useNavigate();

  const onClick = (e) => {
    setSelectedKey(e.key);

    if (e.key == "logout") {
      setIsModalOpen(true);
      return;
    }

    nevigate(`/instructor/${e.key}`);
  };

  useEffect(() => {
    const currentPath = window.location.pathname.split("/").pop();

    // if (currentPath === "dashboard") {
    //   nevigate("/instructor/dashboard");
    //   return;
    // }
    setSelectedKey(currentPath);
  }, []);

  return (
    <Layout className="site-layout ">
      <Sider
        className="site-layout-sider"
        width={280}
        style={{ position: "fixed", height: "100vh" }}
      >
        <Sidebar
          selectedKey={selectedKey}
          menuItems={instructorNavigationItems}
          onMenuClick={onClick}
        />
      </Sider>
      <Layout style={{ marginLeft: 280, height: "100vh" }}>
        <Content>
          <Outlet />
        </Content>
      </Layout>
      <LogoutModel isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </Layout>
  );
}

export default InstructureDashboardLayout;

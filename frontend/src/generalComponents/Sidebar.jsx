// src/components/Sidebar.js
import React from "react";
import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";

import { Link } from "react-router-dom";

function Sidebar({ collapsed, selectedKey = "3", onMenuClick, menuItems }) {
  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={280}
      collapsedWidth={70}
      className="overflow-auto h-screen fixed left-0 top-0 bottom-0 z-[1001] bg-gradient-to-b from-gray-800 to-gray-900 border-r border-white/10 shadow-2xl"
    >
      {/* Header Section */}
      <div
        className={`h-20 flex items-center ${
          collapsed ? "justify-center" : "justify-start pl-6"
        } bg-black/20 border-b border-white/10 transition-all duration-200`}
      >
        {collapsed ? (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/30">
            L
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/30">
              L
            </div>
            <div>
              <div className="text-white text-xl font-bold leading-tight tracking-tight">
                LMS Admin
              </div>
              <div className="text-white/60 text-xs font-medium">
                Learning Management
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 px-4">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={onMenuClick}
          className="bg-transparent border-none text-sm"
          items={menuItems.map((item) => ({
            key: item.path,
            icon: (
              <span
                className={`text-base transition-colors duration-200 ${
                  selectedKey === item.key ? "text-blue-500" : "text-white/70"
                }`}
              >
                {item.icon}
              </span>
            ),
            label: (
              <span
                className={`transition-all duration-200 ${
                  selectedKey === item.path
                    ? "text-white font-semibold"
                    : "text-white/80 font-medium"
                }`}
              >
                {item.label}
              </span>
            ),
            className: `my-2 rounded-xl h-12 leading-[48px] transition-all duration-300 cursor-pointer relative overflow-hidden ${
              selectedKey === item.path
                ? "bg-gradient-to-r from-blue-500/20 to-blue-700/20 border border-blue-500/40 shadow-lg shadow-blue-500/20"
                : "border border-transparent hover:bg-gradient-to-r hover:from-white/5 hover:to-white/2 hover:border-white/10 hover:translate-x-1 hover:shadow-sm hover:shadow-black/10"
            }`,
          }))}
        />
      </div>
    </Sider>
  );
}

export default Sidebar;

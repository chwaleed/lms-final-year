import React, { useState } from "react";
import { BookOpen, Video } from "lucide-react";
import CourseDetailsTab from "./components/CourseDetailsTab";
import LecturesTab from "./components/LecturesTab";

function CourseEditPage() {
  const [activeTab, setActiveTab] = useState("details");
  const tabs = [
    { id: "details", label: "Course Details", icon: BookOpen },
    { id: "lectures", label: "Lectures", icon: Video },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-gray-600 mt-1">
            Manage your course content and details
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {" "}
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <IconComponent size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "details" && <CourseDetailsTab />}
          {activeTab === "lectures" && <LecturesTab />}
        </div>
      </div>
      <style jsx="true">{`
        body {
          background-color: #f5f5f5;
        }
      `}</style>
    </div>
  );
}

export default CourseEditPage;

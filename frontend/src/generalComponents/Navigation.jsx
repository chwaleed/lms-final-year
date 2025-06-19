import { Button } from "antd";
import { Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userInfoStore } from "../context/store";

const links = [
  { name: "Courses", key: "courses" },
  { name: "For Educators", key: "#1" },
  { name: "For Students", key: "#2" },
  { name: "Pricing", key: "#3" },
];

const Navigation = () => {
  const { user } = userInfoStore();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">EduSpark AI</span>
          </div>
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <p
                key={link.key}
                onClick={() => navigate("/courses")}
                className="text-gray-800 cursor-pointer hover:text-blue-500 transition-colors"
              >
                {link.name}
              </p>
            ))}
          </div>
          {/* Action Buttons */}
          {user ? (
            <Button
              type="text"
              className="border border-blue-500 text-blue-500 hover:bg-blue-50"
              onClick={() =>
                user?.role === "instructor"
                  ? navigate("/instructor/dashboard")
                  : navigate("/student/dashboard")
              }
            >
              Dashboard
            </Button>
          ) : (
            <div className="flex items-center space-x-4">
              <Button
                type="text"
                className="border border-blue-500 text-blue-500 hover:bg-blue-50"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                type="primary"
                className="bg-orange-500 hover:bg-orange-600 border-orange-500"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

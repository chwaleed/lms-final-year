import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import InstructurRoutes from "./pages/Routes/InstructorRoutes";
import Unauthorized from "./pages/Unauthorized";
import StudentRoutes from "./pages/Routes/StudentRoutes";
import axios from "axios";
import { useEffect, useState } from "react";
import { userInfoStore } from "./context/store";
import NotFound from "./pages/NotFound";
import Loading from "./generalComponents/Loading";
import ExploreCourses from "./pages/Dashboard/StudentDashboard/components/ExploreCourses";

function AppWrapper() {
  const { user, setUser, clearUser } = userInfoStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const isAuthenticatedUser = async () => {
    try {
      const response = await axios.get("/api/verify");
      if (response.status !== 200) throw new Error("Failed to verify user");

      if (response.data && response.data.statusCode === 200) {
        setUser(response.data.data);
      }
    } catch (error) {
      clearUser();
      window.message?.error(
        error.response?.data?.message || "Failed to verify user"
      );

      if (
        location.pathname !== "/login" &&
        location.pathname !== "/register" &&
        location.pathname !== "/"
      ) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/register") {
      setIsLoading(false);
      setAuthChecked(true);
    } else {
      isAuthenticatedUser();
    }
  }, []);

  // Show loading page when authenticating
  if (isLoading || !authChecked) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/courses" element={<ExploreCourses />} />
      <Route
        path="/login"
        element={
          user ? (
            user.role === "instructor" ? (
              <Navigate to="/instructor/dashboard" replace />
            ) : user.role === "student" ? (
              <Navigate to="/student/dashboard" replace />
            ) : (
              <Login />
            )
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            user.role === "instructor" ? (
              <Navigate to="/instructor/dashboard" replace />
            ) : user.role === "student" ? (
              <Navigate to="/student/dashboard" replace />
            ) : (
              <Register />
            )
          ) : (
            <Register />
          )
        }
      />

      {user?.role === "instructor"
        ? InstructurRoutes
        : user?.role === "student"
        ? StudentRoutes
        : null}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;

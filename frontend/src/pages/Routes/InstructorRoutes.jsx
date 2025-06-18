import { Route } from "react-router-dom";
import Overview from "../Dashboard/InstructureDashboard/components/Overview";
import Courses from "../Dashboard/InstructureDashboard/components/Courses";
import Quizzes from "../Dashboard/InstructureDashboard/components/Quizzes";
import Students from "../Dashboard/InstructureDashboard/components/Students";
import Setting from "../Dashboard/InstructureDashboard/components/Setting";
import NotFound from "../NotFound";
import InstructureDashboardLayout from "../Dashboard/InstructureDashboard/InstructureDashboardLayout";
import CourseEditPage from "../Dashboard/InstructureDashboard/pages/CourseEditPage";

const InstructurRoutes = [
  <Route
    key="instructor"
    path="/instructor"
    element={<InstructureDashboardLayout />}
  >
    <Route index element={<Overview />} />
    <Route path="dashboard" element={<Overview />} />
    <Route path="courses" element={<Courses />} />
    <Route path="course/edit/:id" element={<CourseEditPage />} />
    <Route path="quizzes" element={<Quizzes />} />
    <Route path="students" element={<Students />} />
    <Route path="settings" element={<Setting />} />
  </Route>,
];

export default InstructurRoutes;

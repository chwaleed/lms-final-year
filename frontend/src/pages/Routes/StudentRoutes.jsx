import { Route } from "react-router";

import StudentDashboardLayout from "../Dashboard/StudentDashboard/StudentDashboardLayout";
import Quizzes from "../Dashboard/StudentDashboard/components/QuizzesNew";
import Overview from "../Dashboard/StudentDashboard/components/Overview";
import Courses from "../Dashboard/StudentDashboard/components/Courses";
import ExploreCourses from "../Dashboard/StudentDashboard/components/ExploreCourses";
import Grades from "../Dashboard/StudentDashboard/components/Grades";
import Settings from "../Dashboard/StudentDashboard/components/Settings";
import Assignments from "../Dashboard/StudentDashboard/components/Assignments";
import CourseLearn from "../Dashboard/StudentDashboard/components/CourseLearn";

const StudentRoutes = [
  <Route key="student" path="/student" element={<StudentDashboardLayout />}>
    <Route index element={<Overview />} />
    <Route path="dashboard" element={<Overview />} />
    <Route path="courses" element={<Courses />} />
    <Route path="explore-courses" element={<ExploreCourses />} />
    <Route path="quizzes" element={<Quizzes />} />
    {/* <Route path="assignments" element={<Assignments />} /> */}
    {/* <Route path="grades" element={<Grades />} /> */}
    <Route path="course-learn/:courseId" element={<CourseLearn />} />
    {/* <Route path="settings" element={<Settings />} /> */}
  </Route>,
];

export default StudentRoutes;

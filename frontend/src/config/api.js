// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  // Course endpoints
  COURSES_PAGINATED: `${API_BASE_URL}/api/courses/paginated`,
  ALL_COURSES: `${API_BASE_URL}/api/all-courses`,
  COURSE_BY_ID: (id) => `${API_BASE_URL}/api/course/${id}`,
  COURSE_ENROLLMENT: `${API_BASE_URL}/api/course/enrollment/`,

  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/login`,
  REGISTER: `${API_BASE_URL}/api/register`,
  LOGOUT: `${API_BASE_URL}/api/logout`,
  VERIFY: `${API_BASE_URL}/api/verify`,
  PROFILE: `${API_BASE_URL}/api/profile`,

  // Instructor endpoints
  CREATE_COURSE: `${API_BASE_URL}/api/instructor/create-course`,
  UPDATE_COURSE: (id) => `${API_BASE_URL}/api/instructor/course/update/${id}`,
  INSTRUCTOR_STUDENTS: `${API_BASE_URL}/api/instructor/students`,
  COURSE_ENROLLMENTS: (courseId) =>
    `${API_BASE_URL}/api/instructor/course/${courseId}/enrollments`,
  UPLOAD_THUMBNAIL: (id) =>
    `${API_BASE_URL}/api/instructor/course/${id}/upload-thumbnail`,
  DELETE_THUMBNAIL: (id) =>
    `${API_BASE_URL}/api/instructor/course/${id}/delete-thumbnail`,

  // Lecture endpoints
  CREATE_LECTURE: `${API_BASE_URL}/api/instructor/course/create-lecture`,
  LECTURE_BY_ID: (id) => `${API_BASE_URL}/api/lecture/${id}`,
  LECTURES_BY_COURSE: (courseId) =>
    `${API_BASE_URL}/api/course/${courseId}/lectures`,
  UPDATE_LECTURE: (id) => `${API_BASE_URL}/api/instructor/lecture/${id}`,
  DELETE_LECTURE: (id) => `${API_BASE_URL}/api/instructor/lecture/${id}`,
  STREAM_VIDEO: (id) => `${API_BASE_URL}/api/lectures/stream/${id}`,
  DOWNLOAD_VIDEO: (id) => `${API_BASE_URL}/api/lectures/download/${id}`,
  VIDEO_METADATA: (id) => `${API_BASE_URL}/api/lecture/${id}/metadata`,

  // Lecture completion endpoints
  MARK_LECTURE_COMPLETE: (id) => `${API_BASE_URL}/api/lecture/${id}/complete`,
  UNMARK_LECTURE_COMPLETE: (id) => `${API_BASE_URL}/api/lecture/${id}/complete`,
  USER_COMPLETED_LECTURES: (courseId) =>
    `${API_BASE_URL}/api/course/${courseId}/completed-lectures`,
  COURSE_PROGRESS: (courseId) =>
    `${API_BASE_URL}/api/course/${courseId}/progress`,
};

export default API_BASE_URL;

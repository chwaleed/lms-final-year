import axios from "axios";

const API_BASE_URL = "http://localhost5000";

const createCourse = async (courseData) => {
  try {
    const response = await axios.post("/api/instructor/create-course", {
      ...courseData,
    });
    console.log(response);
    if (response.data && response.data.statusCode == 201) {
      window.message?.success("Course created successfully!");
      return response.data.data;
    }
  } catch (error) {
    window.message?.error(
      error.response?.data?.message || "Failed to create course"
    );
  }
};

const getCourse = async (courseId) => {
  try {
    const response = await axios.get(`/api/course/${courseId}`);
    if (response.data && response.data.statusCode == 200) {
      return response.data.data;
    }
  } catch (error) {
    window.message?.error(
      error.response?.data?.message || "Failed to fetch course"
    );
  }
};

const updateCourse = async (courseId, form) => {
  try {
    const response = await axios.patch(
      `/api/instructor/course/update/${courseId}`,
      form
    );
    if (response.data && response.data.statusCode == 200) {
      window.message?.success("Course updated successfully!");
      return response.data.data;
    }
  } catch (error) {
    window.message?.error(
      error.response?.data?.message || "Failed to update course"
    );
  }
};

const uploadCourseThumbnail = async (courseId, file) => {
  try {
    const formData = new FormData();
    formData.append("thumbnail", file);

    const response = await axios.post(
      `/api/instructor/course/${courseId}/upload-thumbnail`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data && response.data.statusCode === 200) {
      window.message?.success("Course thumbnail uploaded successfully!");
      return response.data.data;
    }
  } catch (error) {
    window.message?.error(
      error.response?.data?.message || "Failed to upload thumbnail"
    );
    throw error;
  }
};

const deleteCourseThumbnail = async (courseId) => {
  try {
    const response = await axios.delete(
      `/api/instructor/course/${courseId}/delete-thumbnail`
    );

    if (response.data && response.data.statusCode === 200) {
      window.message?.success("Course thumbnail deleted successfully!");
      return response.data.data;
    }
  } catch (error) {
    window.message?.error(
      error.response?.data?.message || "Failed to delete thumbnail"
    );
    throw error;
  }
};

export const deleteCourse = async (courseId) => {
  try {
    const response = await axios.delete(
      `/api/instructor/delete/course/${courseId}`
    );

    if (response.data && response.data.statusCode === 200) {
      window.message?.success(
        response.data.message || "Course deleted successfully!"
      );
      return response.data.data;
    }
  } catch (error) {
    console.error("Delete course error:", error);
    window.message?.error(
      error.response?.data?.message || "Failed to delete course"
    );
    throw error;
  }
};

export {
  createCourse,
  getCourse,
  updateCourse,
  uploadCourseThumbnail,
  deleteCourseThumbnail,
};

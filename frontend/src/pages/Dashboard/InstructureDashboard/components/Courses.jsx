import Table from "../../../../generalComponents/Table";
import { Content } from "antd/es/layout/layout";
import { Breadcrumb, Button, FloatButton } from "antd";
import Title from "antd/es/typography/Title";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusOutlined,
  BookOutlined,
  TeamOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import Model from "../../../../generalComponents/Model";
import { Loader } from "lucide-react";
import { createCourse, deleteCourse } from "../methods";
import useFetch from "../../../../generalFunctions/useFetch";
import { debounce } from "lodash";

function Courses() {
  const [searchText, setSearchText] = useState("");
  const [inputValue, setInputValue] = useState(""); // Separate state for input display
  const [currentPage, setCurrentPage] = useState(1);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [createCourseLoading, setCreateCourseLoading] = useState(false);
  const navigate = useNavigate();

  function handleDelete(courseId) {
    console.log(`Delete course with ID: ${courseId}`);
    confirm("Are you sure you want to delete this course?") &&
      deleteCourse(courseId)
        .then(() => {
          window.message?.success("Course deleted successfully!");
          refetch(); // Refetch courses after deletion
        })
        .catch((error) => {
          window.message?.error(
            error.response?.data?.message || "Failed to delete course"
          );
        });

    // Add your delete logic here
  }

  const columns = [
    {
      title: "Course Name",
      key: "title",
      render: (record) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <BookOutlined className="text-white text-sm" />
          </div>
          <div>
            <h4 className="text-gray-800 truncate w-96 font-semibold text-sm">
              {record.title}
            </h4>
            {record.description && (
              <p className="text-xs text-gray-500 truncate w-96">
                {record.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      key: "price",
      render: (record) => (
        <div className="flex items-center space-x-2">
          <DollarOutlined className="text-green-500" />
          <span className="text-gray-700 font-medium">
            {record.price ? record.price : "Free"}
          </span>
        </div>
      ),
    },
    {
      title: "Enrolled Students",
      key: "enrolledStudents",
      render: (record) => (
        <div className="flex items-center space-x-2">
          <TeamOutlined className="text-blue-500" />
          <span className="text-gray-700 font-medium">
            {record.enrolledStudents || 0}
          </span>
          <span className="text-xs text-gray-500">students</span>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record) => (
        <div className="flex space-x-2">
          <Button
            type="primary"
            size="small"
            ghost
            href={`/course/${record._id}`}
            className="hover:bg-blue-50"
          >
            View
          </Button>
          <Button
            type="default"
            size="small"
            onClick={() => navigate(`/instructor/course/edit/${record._id}`)}
            className="hover:bg-gray-50"
          >
            Edit
          </Button>
          <Button
            type="primary"
            size="small"
            danger
            ghost
            onClick={() => handleDelete(record._id)}
            className="hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const buildQueryString = () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: "10",
      ...(searchText && { search: searchText }),
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    return `api/courses/paginated?${params.toString()}`;
  };

  const {
    data: fetchedData,
    loading,
    error,
    refetch,
  } = useFetch(buildQueryString(), {
    dependencies: [currentPage, searchText],
  });

  const courseData = fetchedData?.data || {
    courses: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalCourses: 0,
      coursesPerPage: 10,
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: null,
      prevPage: null,
    },
    searchQuery: "",
  };

  const debouncedSearch = useCallback(
    debounce((query) => {
      setSearchText(query);
      setCurrentPage(1); // Reset to first page when searching
    }, 300),
    []
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setInputValue(value); // Update input display immediately
    debouncedSearch(value); // Debounced API call
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCreateCourse = async () => {
    if (!courseName.trim()) return;

    setCreateCourseLoading(true);
    try {
      const newCourse = await createCourse({
        title: courseName.trim(),
        description: courseDescription.trim(),
      });

      if (newCourse) {
        setIsModelOpen(false);
        setCourseName("");
        setCourseDescription("");

        refetch();
      }
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      setCreateCourseLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModelOpen(false);
    setCourseName("");
    setCourseDescription("");
  };

  return (
    <Content className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item href="/">
          <span className="text-gray-600 hover:text-blue-600">Home</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <span className="text-gray-600 hover:text-blue-600">Dashboard</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <span className="text-gray-800 font-medium">Courses</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Title level={2} className="text-gray-800">
              Course Management
            </Title>
            <p className="text-gray-600">
              {loading
                ? "Loading..."
                : `${courseData.pagination.totalCourses} courses found`}
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setIsModelOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-none hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Create Course
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">Error loading courses: {error.message}</p>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table
          columns={columns}
          data={courseData.courses}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={courseData.pagination.totalPages}
          totalItems={courseData.pagination.totalCourses}
          onSearch={handleSearch}
          searchText={inputValue} // Use inputValue for immediate display
          title="All Courses"
          loading={loading}
        />
      </div>

      {/* Create Course Modal */}
      <Model
        isModalOpen={isModelOpen}
        title="Create a new course"
        handleCancel={handleModalCancel}
        handleOk={handleCreateCourse}
        className="rounded-2xl overflow-hidden shadow-2xl"
        bodyStyle={{ padding: 0 }}
        headStyle={{ display: "none" }}
        footer={null}
      >
        <div className="p-6">
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold">Create a new course</h1>

            <div>
              <label
                htmlFor="courseNameInput"
                className="block font-semibold mb-3"
              >
                Course Name *
              </label>
              <input
                id="courseNameInput"
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Enter an engaging course name..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none placeholder-slate-400"
              />
            </div>

            <div>
              <label
                htmlFor="courseDescriptionInput"
                className="block font-semibold mb-3"
              >
                Course Description (Optional)
              </label>
              <textarea
                id="courseDescriptionInput"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                placeholder="Describe what students will learn..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none placeholder-slate-400 resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-200">
            <Button
              onClick={handleModalCancel}
              disabled={createCourseLoading}
              className="flex-1 sm:flex-none px-6 py-3 text-slate-600 bg-white border-2 border-slate-200 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Cancel
            </Button>

            <Button
              type="primary"
              onClick={handleCreateCourse}
              disabled={!courseName.trim() || createCourseLoading}
              className="flex-1 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-0 focus:ring-4 focus:ring-blue-200"
            >
              <span className="flex items-center justify-center gap-2">
                {createCourseLoading ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                )}
                Create Course
              </span>
            </Button>
          </div>
        </div>
      </Model>

      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        onClick={() => setIsModelOpen(true)}
        tooltip="Create New Course"
        className="!bg-gradient-to-r !from-blue-500 !to-purple-600"
      />
    </Content>
  );
}

export default Courses;

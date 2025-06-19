import React, { useState } from "react";
import Table from "../../../../generalComponents/Table";
import useFetch from "../../../../generalFunctions/useFetch";
import { API_ENDPOINTS } from "../../../../config/api";
import Loading from "../../../../generalComponents/Loading";

function Students() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");

  const pageSize = 10;

  // Fetch students data
  const {
    data: studentsData,
    loading,
    error,
  } = useFetch(API_ENDPOINTS.INSTRUCTOR_STUDENTS);

  // Debug: Log the data structure
  React.useEffect(() => {
    if (studentsData) {
      console.log("Students data:", studentsData);
    }
  }, [studentsData]);

  // Filter students based on search text
  const filteredStudents = React.useMemo(() => {
    if (!studentsData?.students) return [];

    if (!searchText || searchText.trim() === "") {
      return studentsData.students;
    }

    const searchLower = searchText.toString().toLowerCase().trim();
    return studentsData.students.filter((student) => {
      const studentName = (student?.studentName || "").toLowerCase();
      const studentEmail = (student?.studentEmail || "").toLowerCase();
      const courseName = (student?.courseName || "").toLowerCase();

      return (
        studentName.includes(searchLower) ||
        studentEmail.includes(searchLower) ||
        courseName.includes(searchLower)
      );
    });
  }, [studentsData?.students, searchText]);

  // Paginate filtered data
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredStudents.slice(
    startIndex,
    startIndex + pageSize
  );

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle search - Fixed to properly handle string values
  const handleSearch = (event) => {
    let text = "";

    if (typeof event === "string") {
      text = event;
    } else if (event?.target?.value !== undefined) {
      text = event.target.value;
    }

    setSearchText(text);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: "studentName",
      dataIndex: "studentName",
      title: "Student Name",
      render: (record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">
            {record?.studentName || "N/A"}
          </span>
          <span className="text-sm text-gray-500">
            {record?.studentEmail || "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "courseName",
      dataIndex: "courseName",
      title: "Course Name",
      render: (record) => (
        <div className="flex flex-col">
          <span className="text-gray-900 font-medium">
            {record?.courseName || "N/A"}
          </span>
          <span className="text-xs text-gray-500">
            Course ID: {record?.courseId || "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "enrollmentDate",
      dataIndex: "enrollmentDate",
      title: "Enrollment Date",
      render: (record) => (
        <span className="text-gray-600">
          {formatDate(record?.enrollmentDate)}
        </span>
      ),
    },
    {
      key: "progress",
      dataIndex: "progress",
      title: "Progress",
      render: (record) => {
        const progress = record?.progress || 0;
        const isCompleted = record?.completed || progress === 100;

        return (
          <div className="flex items-center space-x-3">
            <div className="flex-1 min-w-0">
              <div className="w-20 bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? "bg-green-500"
                      : progress > 70
                      ? "bg-blue-500"
                      : progress > 30
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 mt-1">
                {Math.round(progress)}%
              </span>
            </div>
            {isCompleted && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                ✓ Completed
              </span>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            Error loading students
          </p>
          <p className="text-sm text-gray-500">
            {error?.message || "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  const totalStudents = studentsData?.totalStudents || filteredStudents.length;
  const completedCount = filteredStudents.filter(
    (s) => s?.completed || s?.progress === 100
  ).length;
  const inProgressCount = filteredStudents.filter(
    (s) => !s?.completed && s?.progress !== 100 && (s?.progress || 0) > 0
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Students
            </h1>
            <p className="text-gray-600">
              Manage and track students enrolled in your courses
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <span className="text-2xl">👨‍🎓</span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {totalStudents}
                </div>
                <div className="text-sm font-medium text-blue-800">
                  Total Students
                </div>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {completedCount}
                </div>
                <div className="text-sm font-medium text-green-800">
                  Completed Courses
                </div>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-yellow-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-600">
                  {inProgressCount}
                </div>
                <div className="text-sm font-medium text-yellow-800">
                  In Progress
                </div>
              </div>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white  ">
        <Table
          columns={columns}
          data={paginatedData}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          title="Students"
          onSearch={handleSearch}
          searchText={searchText}
        />
      </div>
    </div>
  );
}

export default Students;

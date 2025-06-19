import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Layout,
  Typography,
  Card,
  List,
  Button,
  Divider,
  Progress,
  Tag,
  Space,
  Breadcrumb,
  Alert,
  Skeleton,
  Tooltip,
  Empty,
  message,
} from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  DownloadOutlined,
  BookOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  LeftOutlined,
  EyeOutlined,
  VideoCameraOutlined,
  CheckCircleOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import useFetch from "../../../../generalFunctions/useFetch";
import { API_ENDPOINTS } from "../../../../config/api";
import axios from "axios";
import { userInfoStore } from "../../../../context/store";

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

function CourseLearn() {
  const { courseId } = useParams();
  console.log("Course ID:", courseId);
  const videoRef = useRef(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [completedLectures, setCompletedLectures] = useState(new Set());
  const [courseProgress, setCourseProgress] = useState(0);
  const [totalLectures, setTotalLectures] = useState(0);
  const { user } = userInfoStore(); // Assuming you have a user info store
  const [markingComplete, setMarkingComplete] = useState(false);

  // Fetch course details
  const {
    data: courseData,
    loading: courseLoading,
    error: courseError,
  } = useFetch(API_ENDPOINTS.COURSE_BY_ID(courseId));
  // Fetch lectures for the course
  const {
    data: lecturesData,
    loading: lecturesLoading,
    error: lecturesError,
  } = useFetch(API_ENDPOINTS.LECTURES_BY_COURSE(courseId));
  // Fetch course progress
  const { data: progressData, loading: progressLoading } = useFetch(
    API_ENDPOINTS.COURSE_PROGRESS(courseId)
  );

  const course = courseData?.data;
  const lectures = useMemo(() => lecturesData?.data || [], [lecturesData]);
  const progress = progressData?.data;
  // Auto-select first lecture when lectures are loaded
  useEffect(() => {
    if (lectures.length > 0 && !selectedLecture) {
      setSelectedLecture(lectures[0]);
    }
  }, [lectures, selectedLecture]);

  // Set up progress data when loaded
  useEffect(() => {
    if (progress) {
      setCompletedLectures(new Set(progress.completedLectureIds || []));
      setCourseProgress(progress.progressPercentage || 0);
      setTotalLectures(progress.totalLectures || 0);
    }
  }, [progress]);
  // Video event handlers
  const handleVideoLoad = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLectureSelect = (lecture) => {
    setSelectedLecture(lecture);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleDownload = (lectureId) => {
    const downloadUrl = API_ENDPOINTS.DOWNLOAD_VIDEO(lectureId);
    window.open(downloadUrl, "_blank");
  };

  // Mark lecture as complete
  const handleMarkComplete = async (lectureId) => {
    if (completedLectures.has(lectureId)) {
      message.info("Lecture already marked as completed");
      return;
    }

    setMarkingComplete(true);
    try {
      const response = await axios.post(
        API_ENDPOINTS.MARK_LECTURE_COMPLETE(lectureId),
        {
          watchTime: Math.floor(currentTime),
        }
      );

      if (response.data.success) {
        setCompletedLectures((prev) => new Set([...prev, lectureId]));

        // Update progress locally
        const newCompletedCount = completedLectures.size + 1;
        const newProgress =
          totalLectures > 0
            ? Math.round((newCompletedCount / totalLectures) * 100)
            : 0;
        setCourseProgress(newProgress);

        message.success("Lecture marked as completed!");
      } else {
        message.error(
          response.data.message || "Failed to mark lecture as completed"
        );
      }
    } catch (error) {
      console.error("Error marking lecture as complete:", error);
      message.error("Failed to mark lecture as completed");
    } finally {
      setMarkingComplete(false);
    }
  };

  // Unmark lecture as complete
  const handleUnmarkComplete = async (lectureId) => {
    if (!completedLectures.has(lectureId)) {
      message.info("Lecture is not marked as completed");
      return;
    }

    setMarkingComplete(true);
    try {
      const response = await axios.delete(
        API_ENDPOINTS.UNMARK_LECTURE_COMPLETE(lectureId)
      );

      if (response.data.success) {
        setCompletedLectures((prev) => {
          const newSet = new Set(prev);
          newSet.delete(lectureId);
          return newSet;
        });

        // Update progress locally
        const newCompletedCount = completedLectures.size - 1;
        const newProgress =
          totalLectures > 0
            ? Math.round((newCompletedCount / totalLectures) * 100)
            : 0;
        setCourseProgress(newProgress);

        message.success("Lecture unmarked as completed!");
      } else {
        message.error(
          response.data.message || "Failed to unmark lecture as completed"
        );
      }
    } catch (error) {
      console.error("Error unmarking lecture as complete:", error);
      message.error("Failed to unmark lecture as completed");
    } finally {
      setMarkingComplete(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  const getProgress = () => {
    if (duration === 0) return 0;
    return (currentTime / duration) * 100;
  };

  const getOverallProgress = () => {
    return courseProgress;
  };

  if (courseLoading || lecturesLoading || progressLoading) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Content className="p-6">
          <Skeleton active />
        </Content>
      </Layout>
    );
  }

  if (courseError || lecturesError) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Content className="p-6">
          <Alert
            message="Error Loading Course"
            description="There was an error loading the course content. Please try again."
            type="error"
            action={
              <Button
                size="small"
                danger
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-6">
        {/* Header with Breadcrumb */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <Title level={2} className="mb-2 text-gray-800">
                {course?.title}
              </Title>
              <Space size="middle" wrap>
                <Tag icon={<BookOutlined />} color="blue">
                  {lectures.length} Lectures
                </Tag>
                <Tag icon={<TeamOutlined />} color="green">
                  {course?.enrolledStudents || 0} Students
                </Tag>
                <Tag icon={<ClockCircleOutlined />} color="orange">
                  Course Progress: {Math.round(getOverallProgress())}%
                </Tag>
              </Space>
            </div>

            <Progress
              type="circle"
              percent={Math.round(getOverallProgress())}
              size={80}
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
            />
          </div>
        </div>

        <Layout className="bg-white rounded-xl shadow-sm">
          {/* Main Video Content */}
          <Content className="p-6">
            {selectedLecture ? (
              <div className="space-y-6">
                {/* Video Player */}
                <Card className="shadow-lg rounded-xl overflow-hidden">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-auto max-h-[60vh] object-contain"
                      src={API_ENDPOINTS.STREAM_VIDEO(selectedLecture._id)}
                      onLoadedMetadata={handleVideoLoad}
                      onTimeUpdate={handleTimeUpdate}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      controls
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  {/* Video Controls */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <Title level={4} className="mb-0">
                        {selectedLecture.title}
                      </Title>{" "}
                      <Space>
                        <Tooltip title="Download Video">
                          <Button
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownload(selectedLecture._id)}
                            type="text"
                          />
                        </Tooltip>

                        {user?.role == "student" && (
                          <Tooltip
                            title={
                              completedLectures.has(selectedLecture._id)
                                ? "Unmark as completed"
                                : "Mark as completed"
                            }
                          >
                            <Button
                              icon={
                                completedLectures.has(selectedLecture._id) ? (
                                  <CheckCircleOutlined />
                                ) : (
                                  <CheckOutlined />
                                )
                              }
                              onClick={() =>
                                completedLectures.has(selectedLecture._id)
                                  ? handleUnmarkComplete(selectedLecture._id)
                                  : handleMarkComplete(selectedLecture._id)
                              }
                              loading={markingComplete}
                              type={
                                completedLectures.has(selectedLecture._id)
                                  ? "primary"
                                  : "default"
                              }
                            />
                          </Tooltip>
                        )}

                        <Button
                          type="primary"
                          icon={
                            isPlaying ? (
                              <PauseCircleOutlined />
                            ) : (
                              <PlayCircleOutlined />
                            )
                          }
                          onClick={handlePlayPause}
                        >
                          {isPlaying ? "Pause" : "Play"}
                        </Button>
                      </Space>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <Progress
                        percent={getProgress()}
                        showInfo={false}
                        strokeColor="#1890ff"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {selectedLecture.description && (
                      <Paragraph className="text-gray-600 mb-0">
                        {selectedLecture.description}
                      </Paragraph>
                    )}
                  </div>
                </Card>

                {/* Course Description */}
                {course?.description && (
                  <Card title="About This Course" className="shadow-sm">
                    <Paragraph>{course.description}</Paragraph>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="text-center py-12">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No lectures available for this course"
                />
              </Card>
            )}
          </Content>

          {/* Lecture List Sidebar */}
          <Sider
            width={400}
            className="bg-white border-l border-gray-200"
            breakpoint="lg"
            collapsedWidth="0"
          >
            <div className="p-4 border-b  border-gray-200">
              <Title level={4} color="white" className="mb-0 !text-white">
                <VideoCameraOutlined className="mr-2" />
                Course Content
              </Title>{" "}
              <Text type="secondary">
                {completedLectures.size} of {lectures.length} completed
              </Text>
            </div>

            <div className="h-[calc(100vh-200px)] overflow-y-auto">
              {lectures.length > 0 ? (
                <List
                  dataSource={lectures}
                  renderItem={(lecture, index) => (
                    <List.Item
                      className={`cursor-pointer transition-colors hover:bg-blue-50 px-4 py-3 border-b border-gray-100 ${
                        selectedLecture?._id === lecture._id
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : ""
                      }`}
                      onClick={() => handleLectureSelect(lecture)}
                    >
                      <List.Item.Meta
                        avatar={
                          <div className="flex items-center space-x-2">
                            {" "}
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                completedLectures.has(lecture._id)
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {completedLectures.has(lecture._id)
                                ? "✓"
                                : index + 1}
                            </div>
                            {selectedLecture?._id === lecture._id && (
                              <PlayCircleOutlined className="text-blue-500" />
                            )}
                          </div>
                        }
                        title={
                          <Text strong={selectedLecture?._id === lecture._id}>
                            {lecture.title}
                          </Text>
                        }
                        description={
                          <div className="text-xs">
                            {" "}
                            <Space>
                              <EyeOutlined />
                              <span>Video Lecture</span>
                              {completedLectures.has(lecture._id) && (
                                <Tag size="small" color="success">
                                  Completed
                                </Tag>
                              )}
                            </Space>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div className="p-4 text-center">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No lectures available"
                  />
                </div>
              )}
            </div>
          </Sider>
        </Layout>
      </Content>
    </Layout>
  );
}

export default CourseLearn;

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "@ant-design/icons";
import useFetch from "../../../../generalFunctions/useFetch";
import { API_ENDPOINTS } from "../../../../config/api";

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

function CourseLearn() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchedLectures, setWatchedLectures] = useState(new Set());

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
  const course = courseData?.data;
  const lectures = useMemo(() => lecturesData?.data || [], [lecturesData]);

  // Auto-select first lecture when lectures are loaded
  useEffect(() => {
    if (lectures.length > 0 && !selectedLecture) {
      setSelectedLecture(lectures[0]);
    }
  }, [lectures, selectedLecture]);

  // Video event handlers
  const handleVideoLoad = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);

      // Mark lecture as watched when 80% completed
      const progress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      if (
        progress >= 80 &&
        selectedLecture &&
        !watchedLectures.has(selectedLecture._id)
      ) {
        setWatchedLectures((prev) => new Set([...prev, selectedLecture._id]));
      }
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
    if (lectures.length === 0) return 0;
    return (watchedLectures.size / lectures.length) * 100;
  };

  if (courseLoading || lecturesLoading) {
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
          <Breadcrumb className="mb-4">
            <Breadcrumb.Item>
              <Button
                type="link"
                icon={<LeftOutlined />}
                onClick={() => navigate("/student/courses")}
                className="p-0"
              >
                My Courses
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Text strong>{course?.title}</Text>
            </Breadcrumb.Item>
          </Breadcrumb>

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
                      </Title>
                      <Space>
                        <Tooltip title="Download Video">
                          <Button
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownload(selectedLecture._id)}
                            type="text"
                          />
                        </Tooltip>
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
              </Title>
              <Text type="secondary">
                {watchedLectures.size} of {lectures.length} completed
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
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                watchedLectures.has(lecture._id)
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {watchedLectures.has(lecture._id)
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
                            <Space>
                              <EyeOutlined />
                              <span>Video Lecture</span>
                              {watchedLectures.has(lecture._id) && (
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

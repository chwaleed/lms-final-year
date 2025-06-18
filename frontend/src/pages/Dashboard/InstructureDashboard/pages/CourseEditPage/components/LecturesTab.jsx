import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Upload,
  Space,
  Typography,
  Empty,
  Tag,
  Row,
  Col,
  Divider,
  message,
  Progress,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  UploadOutlined,
  VideoCameraOutlined,
  LoadingOutlined,
  EyeOutlined,
  FileOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { Modal } from "antd";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * LecturesTab Component
 *
 * Features:
 * - Upload video lectures with drag & drop
 * - Real-time video preview during upload
 * - Fullscreen video preview modal
 * - Delete uploaded videos before submission
 * - Video thumbnail preview in lecture cards
 * - Load existing lectures from backend
 * - CRUD operations for lectures
 * - Progress tracking for video uploads
 */

function LecturesTab() {
  const [lectures, setLectures] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cleanup video URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewVideo) {
        URL.revokeObjectURL(previewVideo);
      }
    };
  }, [previewVideo]);

  // Load existing lectures when component mounts
  useEffect(() => {
    const loadLectures = async () => {
      const pathParts = window.location.pathname.split("/").filter(Boolean);
      const courseId = pathParts[pathParts.length - 1];

      if (courseId) {
        setLoading(true);
        try {
          const response = await axios.get(`/api/course/${courseId}/lectures`);
          if (response.data.success) {
            setLectures(response.data.data || []);
          }
        } catch (error) {
          console.error("Error loading lectures:", error);
          message.error("Failed to load existing lectures");
        } finally {
          setLoading(false);
        }
      }
    };

    loadLectures();
  }, []);

  const uploadVideoLecture = async (lectureData, videoFile) => {
    try {
      const formData = new FormData();

      formData.append("title", lectureData.title);
      formData.append("description", lectureData.description || "");

      const pathParts = window.location.pathname.split("/").filter(Boolean);
      const courseId = pathParts[pathParts.length - 1];
      formData.append("courseId", courseId);

      if (videoFile) {
        formData.append("video", videoFile);
      }
      const response = await axios.post(
        "/api/instructor/course/create-lecture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error uploading lecture:", error);
      throw error;
    }
  };

  const handleSubmit = async (values) => {
    const videoFile = fileList.length > 0 ? fileList[0].originFileObj : null;

    setSubmitting(true);

    try {
      if (editingLecture) {
        console.log("Updating existing lecture:", editingLecture);

        if (videoFile) {
          setUploading(true);
          setUploadProgress(0);
        }

        let updatedLecture;
        if (videoFile) {
          const apiResponse = await uploadVideoLecture(values, videoFile);
          console.log("API response for update:", apiResponse);

          updatedLecture = {
            ...apiResponse.data.lecture,
            id: editingLecture.id,
            videoFile,
          };
        } else {
          // Update lecture without video
          if (editingLecture._id) {
            const response = await axios.patch(
              `/api/instructor/lecture/${editingLecture._id}`,
              {
                title: values.title,
                description: values.description,
              }
            );
            updatedLecture = response.data.data;
          } else {
            updatedLecture = {
              ...editingLecture,
              ...values,
              updatedAt: new Date().toISOString(),
            };
          }
        }

        setLectures((prev) =>
          prev.map((lecture) =>
            (lecture.id || lecture._id) ===
            (editingLecture.id || editingLecture._id)
              ? updatedLecture
              : lecture
          )
        );
        setEditingLecture(null);
        message.success("Lecture updated successfully!");
      } else {
        // Create new lecture
        console.log("Creating new lecture with values:", values);

        if (videoFile) {
          setUploading(true);
          setUploadProgress(0);

          const apiResponse = await uploadVideoLecture(values, videoFile);
          console.log("API response for create:", apiResponse);

          if (apiResponse.success && apiResponse.data.lecture) {
            const newLecture = {
              ...apiResponse.data.lecture,
              videoFile,
            };
            setLectures((prev) => [...prev, newLecture]);
            message.success("Lecture created successfully!");
          } else {
            throw new Error("Invalid API response");
          }
        } else {
          const newLecture = {
            ...values,
            id: Date.now(),
            createdAt: new Date().toISOString(),
          };
          setLectures((prev) => [...prev, newLecture]);
          message.success("Lecture created successfully!");
        }
      }

      form.resetFields();
      setFileList([]);
      setShowCreateForm(false);

      if (previewVideo) {
        URL.revokeObjectURL(previewVideo);
      }
      setPreviewVideo(null);
      setShowPreview(false);
    } catch (error) {
      console.error("Error saving lecture:", error);
      message.error(
        error.response?.data?.message ||
          "Failed to save lecture. Please try again."
      );
    } finally {
      setSubmitting(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };
  const handleEdit = (lecture) => {
    form.setFieldsValue({
      title: lecture.title,
      description: lecture.description,
      duration: lecture.duration,
      order: lecture.order,
    });

    if (lecture.videoFile) {
      const videoFileObj = {
        uid: "-1",
        name: lecture.videoFile.name,
        status: "done",
        originFileObj: lecture.videoFile,
      };
      setFileList([videoFileObj]);

      // Generate preview for existing video
      if (lecture.videoFile) {
        const videoUrl = URL.createObjectURL(lecture.videoFile);
        setPreviewVideo(videoUrl);
      }
    } else {
      setFileList([]);
      setPreviewVideo(null);
    }

    setEditingLecture(lecture);
    setShowCreateForm(true);
  };
  const handleDelete = async (lectureId) => {
    window.confirm(
      "Are you sure you want to delete this lecture? This action cannot be undone."
    );
    try {
      const response = await axios.delete(
        `/api/instructor/lecture/${lectureId}`
      );
      console.log(response);
      if (response.data?.success) {
        const fileToRemove = lectures.find(
          (lecture) => lecture._id === lectureId
        );
        const fileId = fileToRemove?.videoFile?.uid;
        console.log("File to remove:", fileToRemove, fileId);

        setFileList((prev) => prev.filter((file) => file.uid !== fileId));

        setLectures((prev) =>
          prev.filter((lecture) => lecture._id != lectureId)
        );
        window.message.success("Lecture deleted successfully!");
      } else {
        message.error("Failed to delete lecture");
      }
    } catch (error) {
      console.error("Error deleting lecture:", error);
      window.message.error(
        error.response?.data?.message || "Failed to delete lecture"
      );
    }
  };
  const handleCancel = () => {
    if (submitting || uploading) {
      Modal.confirm({
        title: "Cancel Upload",
        content: "Are you sure you want to cancel? The upload will be stopped.",
        okText: "Yes, Cancel",
        okType: "danger",
        cancelText: "Continue Upload",
        onOk() {
          form.resetFields();
          setFileList([]);
          setEditingLecture(null);
          setShowCreateForm(false);
          setSubmitting(false);
          setUploading(false);
          setUploadProgress(0);
          setPreviewVideo(null);
          setShowPreview(false);
        },
      });
    } else {
      form.resetFields();
      setFileList([]);
      setEditingLecture(null);
      setShowCreateForm(false);
      setPreviewVideo(null);
      setShowPreview(false);
    }
  };

  const handleRemoveVideo = () => {
    Modal.confirm({
      title: "Remove Video",
      content: "Are you sure you want to remove the selected video?",
      okText: "Remove",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        setFileList([]);
        setPreviewVideo(null);
        setShowPreview(false);
        message.success("Video removed successfully!");
      },
    });
  };

  const handlePreviewVideo = (file) => {
    if (file && file.originFileObj) {
      const videoUrl = URL.createObjectURL(file.originFileObj);
      setPreviewVideo(videoUrl);
      setShowPreview(true);
    }
  };
  const uploadProps = {
    beforeUpload: (file) => {
      const isVideo = file.type.startsWith("video/");
      if (!isVideo) {
        message.error("You can only upload video files!");
        return false;
      }
      const isLt500M = file.size / 1024 / 1024 < 500;
      if (!isLt500M) {
        message.error("Video must be smaller than 500MB!");
        return false;
      }
      return false; // Prevent auto upload
    },
    fileList,
    onChange: ({ fileList: newFileList }) => {
      const latestFile = newFileList.slice(-1)[0]; // Only keep the last file
      setFileList(newFileList.slice(-1));

      // Generate preview for the uploaded video
      if (latestFile && latestFile.originFileObj) {
        const videoUrl = URL.createObjectURL(latestFile.originFileObj);
        setPreviewVideo(videoUrl);
      } else {
        setPreviewVideo(null);
      }
    },
    onRemove: () => {
      setFileList([]);
      setPreviewVideo(null);
      if (previewVideo) {
        URL.revokeObjectURL(previewVideo);
      }
    },
    disabled: submitting || uploading,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: false,
    },
    onPreview: (file) => {
      handlePreviewVideo(file);
    },
  };

  const sortedLectures = lectures.sort((a, b) => {
    const orderA = a.order || 0;
    const orderB = b.order || 0;
    return orderA - orderB;
  });
  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "32px",
          padding: "24px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, color: "#262626" }}>
              Course Lectures
            </Title>
            <Text type="secondary" style={{ fontSize: "16px" }}>
              Manage your course lectures and content
            </Text>
          </Col>
          {!showCreateForm && (
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setShowCreateForm(true)}
                disabled={submitting || uploading}
                style={{
                  borderRadius: "8px",
                  height: "48px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                Add New Lecture
              </Button>
            </Col>
          )}
        </Row>
      </div>{" "}
      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card
          title={
            <Space>
              {(submitting || uploading) && (
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />}
                />
              )}
              <Text strong style={{ fontSize: "18px" }}>
                {editingLecture ? "Edit Lecture" : "Create New Lecture"}
              </Text>
            </Space>
          }
          style={{
            marginBottom: "32px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
          headStyle={{
            backgroundColor: "#fafafa",
            borderBottom: "1px solid #f0f0f0",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ order: lectures.length + 1 }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Lecture Title"
                  name="title"
                  rules={[
                    { required: true, message: "Please enter lecture title!" },
                  ]}
                >
                  <Input
                    placeholder="Enter lecture title"
                    size="large"
                    disabled={submitting || uploading}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Description" name="description">
              <TextArea
                rows={3}
                placeholder="Describe what this lecture covers"
                size="large"
                disabled={submitting || uploading}
              />
            </Form.Item>{" "}
            <Form.Item label="Video File">
              <Upload.Dragger {...uploadProps}>
                <p style={{ margin: 0 }}>
                  <UploadOutlined
                    style={{ fontSize: "48px", color: "#40a9ff" }}
                  />
                </p>
                <p style={{ fontSize: "16px", margin: "8px 0" }}>
                  Click or drag video file to this area to upload
                </p>
                <p style={{ fontSize: "14px", color: "#8c8c8c", margin: 0 }}>
                  Support for MP4, AVI, MOV files. Maximum file size: 500MB
                </p>
              </Upload.Dragger>
            </Form.Item>
            {/* Video Preview */}
            {previewVideo && (
              <Form.Item label="Video Preview">
                <Card size="small">
                  <Row
                    justify="space-between"
                    align="middle"
                    style={{ marginBottom: 16 }}
                  >
                    <Col>
                      <Space>
                        <FileOutlined style={{ color: "#1890ff" }} />
                        <Text strong>Preview</Text>
                      </Space>
                    </Col>
                    <Col>
                      <Space>
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => setShowPreview(true)}
                        >
                          View Fullscreen
                        </Button>
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={handleRemoveVideo}
                          disabled={submitting || uploading}
                        >
                          Remove Video
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                  <video
                    controls
                    style={{
                      width: "100%",
                      maxHeight: "300px",
                      borderRadius: "8px",
                      backgroundColor: "#000",
                    }}
                    src={previewVideo}
                  >
                    Your browser does not support the video tag.
                  </video>
                </Card>
              </Form.Item>
            )}
            {/* Upload Progress */}
            {uploading && (
              <Form.Item>
                <Card size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Text strong>Uploading video...</Text>
                    <Progress
                      percent={uploadProgress}
                      status={uploadProgress === 100 ? "success" : "active"}
                      strokeColor={{
                        from: "#108ee9",
                        to: "#87d068",
                      }}
                    />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Please don't close this page while uploading
                    </Text>
                  </Space>
                </Card>
              </Form.Item>
            )}
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={submitting}
                  disabled={uploading}
                >
                  {submitting
                    ? uploading
                      ? "Uploading..."
                      : "Saving..."
                    : editingLecture
                    ? "Update Lecture"
                    : "Create Lecture"}
                </Button>
                <Button
                  onClick={handleCancel}
                  size="large"
                  disabled={
                    uploading && uploadProgress > 0 && uploadProgress < 100
                  }
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}{" "}
      {/* Lectures List */}
      <div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <div style={{ marginTop: "16px" }}>
              <Text type="secondary">Loading lectures...</Text>
            </div>
          </div>
        ) : lectures.length === 0 ? (
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "80px 40px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            }}
          >
            <Empty
              image={
                <VideoCameraOutlined
                  style={{ fontSize: "72px", color: "#d9d9d9" }}
                />
              }
              description={
                <div>
                  <Title
                    level={3}
                    type="secondary"
                    style={{ marginTop: "24px" }}
                  >
                    No lectures yet
                  </Title>
                  <Text type="secondary" style={{ fontSize: "16px" }}>
                    Start creating lectures to build your course content.
                  </Text>
                  <div style={{ marginTop: "24px" }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      size="large"
                      onClick={() => setShowCreateForm(true)}
                      style={{
                        borderRadius: "8px",
                        height: "48px",
                        paddingLeft: "24px",
                        paddingRight: "24px",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      Create Your First Lecture
                    </Button>
                  </div>
                </div>
              }
            />
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "32px" }}
          >
            {sortedLectures.map((lecture) => (
              <Card
                key={lecture.id || lecture._id}
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
                bodyStyle={{ padding: 0 }}
              >
                {/* Video Player Section - YouTube Style */}
                <div style={{ position: "relative", backgroundColor: "#000" }}>
                  {lecture.videoFile || lecture.data?.streamUrl ? (
                    <video
                      controls
                      style={{
                        width: "100%",
                        height: "500px",
                        objectFit: "contain",
                        backgroundColor: "#000",
                      }}
                      src={
                        lecture.videoFile
                          ? URL.createObjectURL(lecture.videoFile)
                          : `/api${lecture.data.streamUrl}`
                      }
                      poster=""
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "500px",
                        backgroundColor: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                      }}
                    >
                      <VideoCameraOutlined
                        style={{
                          fontSize: "64px",
                          color: "#d9d9d9",
                          marginBottom: "16px",
                        }}
                      />
                      <Text type="secondary">No video uploaded</Text>
                    </div>
                  )}
                </div>{" "}
                {/* Video Details Section - Below Video */}
                <div style={{ padding: "20px 24px" }}>
                  <Row justify="space-between" align="start" gutter={[16, 16]}>
                    <Col xs={24} lg={18} xl={20}>
                      {/* Title and Order */}
                      <div style={{ marginBottom: "12px" }}>
                        <Space align="start" size="middle" wrap>
                          <Tag
                            color="blue"
                            style={{
                              fontSize: "14px",
                              padding: "4px 12px",
                              borderRadius: "20px",
                              fontWeight: "500",
                            }}
                          >
                            Lecture {lecture.order || 1}
                          </Tag>
                          <Title
                            level={3}
                            style={{
                              margin: 0,
                              color: "#262626",
                              fontSize: "24px",
                              fontWeight: "600",
                              lineHeight: "1.3",
                            }}
                          >
                            {lecture.title}
                          </Title>
                        </Space>
                      </div>

                      {/* Meta Information */}
                      <div style={{ marginBottom: "16px" }}>
                        <Space
                          split={<Divider type="vertical" />}
                          size="middle"
                          wrap
                        >
                          {lecture.duration && (
                            <Space>
                              <ClockCircleOutlined
                                style={{ color: "#1890ff" }}
                              />
                              <Text
                                type="secondary"
                                style={{ fontSize: "14px" }}
                              >
                                {lecture.duration} minutes
                              </Text>
                            </Space>
                          )}
                          {(lecture.videoFile ||
                            lecture.data?.originalName) && (
                            <Space>
                              <PlayCircleOutlined
                                style={{ color: "#52c41a" }}
                              />
                              <Text
                                type="secondary"
                                style={{ fontSize: "14px" }}
                              >
                                {lecture.videoFile?.name ||
                                  lecture.data?.originalName}
                              </Text>
                            </Space>
                          )}
                          {(lecture.videoUrl || lecture.data?.streamUrl) && (
                            <Space>
                              <Text
                                type="success"
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "500",
                                }}
                              >
                                ✓ Video uploaded successfully
                              </Text>
                            </Space>
                          )}
                        </Space>
                      </div>

                      {/* Description */}
                      {lecture.description && (
                        <div style={{ marginBottom: "20px" }}>
                          <Paragraph
                            style={{
                              fontSize: "16px",
                              lineHeight: "1.6",
                              color: "#595959",
                              margin: 0,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {lecture.description}
                          </Paragraph>
                        </div>
                      )}
                    </Col>

                    {/* Action Buttons */}
                    <Col xs={24} lg={6} xl={4}>
                      {" "}
                      <Space
                        direction="horizontal"
                        size="small"
                        style={{ width: "100%" }}
                        wrap
                      >
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(lecture)}
                          disabled={submitting || uploading}
                          style={{
                            borderRadius: "8px",
                            height: "40px",
                            fontWeight: "500",
                            minWidth: "120px",
                          }}
                        >
                          Edit
                        </Button>

                        {(lecture.videoFile || lecture.data?.streamUrl) && (
                          <Button
                            icon={<EyeOutlined />}
                            onClick={() => {
                              if (lecture.videoFile) {
                                const videoUrl = URL.createObjectURL(
                                  lecture.videoFile
                                );
                                setPreviewVideo(videoUrl);
                                setShowPreview(true);
                              } else if (lecture.data?.streamUrl) {
                                setPreviewVideo(
                                  `/api${lecture.data.streamUrl}`
                                );
                                setShowPreview(true);
                              }
                            }}
                            disabled={submitting || uploading}
                            style={{
                              borderRadius: "8px",
                              height: "40px",
                              fontWeight: "500",
                              minWidth: "120px",
                            }}
                          >
                            Fullscreen
                          </Button>
                        )}

                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() =>
                            handleDelete(lecture.id || lecture._id)
                          }
                          disabled={submitting || uploading}
                          style={{
                            borderRadius: "8px",
                            height: "40px",
                            fontWeight: "500",
                            minWidth: "120px",
                          }}
                        >
                          Delete
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>{" "}
      {/* Fullscreen Video Preview Modal */}
      <Modal
        title={
          <Space>
            <PlayCircleOutlined style={{ color: "#1890ff" }} />
            <Text strong style={{ fontSize: "16px" }}>
              Fullscreen Video Preview
            </Text>
          </Space>
        }
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        footer={[
          <Button
            key="close"
            size="large"
            onClick={() => setShowPreview(false)}
            style={{ borderRadius: "8px" }}
          >
            Close
          </Button>,
        ]}
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{
          padding: "0",
          backgroundColor: "#000",
          borderRadius: "0 0 8px 8px",
        }}
        styles={{
          content: {
            borderRadius: "12px",
            overflow: "hidden",
          },
        }}
      >
        {previewVideo && (
          <video
            controls
            autoPlay
            style={{
              width: "100%",
              maxHeight: "75vh",
              backgroundColor: "#000",
              outline: "none",
            }}
            src={previewVideo}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </Modal>
    </div>
  );
}

export default LecturesTab;

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Upload,
  Space,
  message,
  Popconfirm,
} from "antd";
import {
  UploadOutlined,
  SaveOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  getCourse,
  updateCourse,
  uploadCourseThumbnail,
  deleteCourseThumbnail,
} from "../../../methods";

const { TextArea } = Input;

function CourseDetailsTab() {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    setImageUrl(null);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (beforeUpload(file)) {
        handleImageUpload({ file });
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleImageUpload = async (info) => {
    const { file } = info;
    console.log("Upload initiated with file:", file);

    // Get the actual file object - this was a potential issue
    const fileObj = file.originFileObj || file;
    console.log("File object:", fileObj);

    if (fileObj && fileObj instanceof File) {
      try {
        setUploading(true);
        console.log("Starting upload...");

        // Upload to server
        const id = window.location.pathname.split("/").pop();
        console.log("Course ID:", id);

        const result = await uploadCourseThumbnail(id, fileObj);
        console.log("Upload result:", result);

        if (result && result.imageUrl) {
          setImageUrl(result.imageUrl);
          setImageError(false);
          form.setFieldValue("thumbnail", result.thumbnailPath);
          message.success("Thumbnail uploaded successfully!");
        } else {
          console.error("Upload result missing imageUrl:", result);
          message.error("Upload failed - no image URL returned");
        }
      } catch (error) {
        console.error("Upload error:", error);
        message.error(`Failed to upload thumbnail: ${error.message}`);
        // Don't re-throw the error here as it's handled
      } finally {
        setUploading(false);
      }
    } else {
      console.error("Invalid file object:", fileObj);
      message.error("Invalid file selected");
    }
  };

  const handleDeleteThumbnail = async () => {
    try {
      setUploading(true);
      const id = window.location.pathname.split("/").pop();
      const result = await deleteCourseThumbnail(id);
      if (result) {
        setImageUrl("https://placehold.co/600x400.png");
        setImageError(false);
        form.setFieldValue("thumbnail", null);
        message.success("Thumbnail deleted successfully!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Failed to delete thumbnail");
    } finally {
      setUploading(false);
    }
  };

  const id = window.location.pathname.split("/").pop();

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          console.log("Loading course data for ID:", id);
          const course = await getCourse(id);
          console.log("Course data:", course);

          form.setFieldsValue({
            title: course.title || "",
            description: course.description || "",
            price: course.price || 0,
            thumbnail: course.thumbnail || null,
          });

          // Set image URL - handle both local paths and full URLs
          if (course.thumbnail) {
            if (course.thumbnail.startsWith("http")) {
              setImageUrl(course.thumbnail);
            } else if (
              course.thumbnail !== "https://placehold.co/600x400.png"
            ) {
              setImageUrl(`http://localhost:5000/${course.thumbnail}`);
            }
          }
        } catch (error) {
          console.error("Error loading course:", error);
          message.error("Failed to load course data");
        }
      })();
    }
  }, [id, form]);
  console.log("here is the iamge url ", imageUrl);
  const beforeUpload = (file) => {
    console.log("Validating file:", file);

    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/gif";

    if (!isJpgOrPng) {
      console.error("Invalid file type:", file.type);
      message.error("You can only upload JPG/PNG/GIF files!");
      return false;
    }

    const isLt1M = file.size / 1024 / 1024 < 10;
    if (!isLt1M) {
      console.error("File too large:", file.size);
      window.message.error("Image must be smaller than 10MB!");
      return false;
    }

    return true; // Allow upload
  };

  const handleSubmit = async (values) => {
    try {
      console.log("Submitting form with values:", values);
      await updateCourse(id, values);
      message.success("Course updated successfully!");
    } catch (error) {
      console.error("Error updating course:", error);
      message.error("Failed to update course");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Course Image */}
        <Form.Item
          label="Course Image"
          name="thumbnail"
          extra="JPG, GIF or PNG. 10MB max. You can also drag and drop files."
        >
          <Space align="start" size="large" className="flex items-start gap-6">
            <div
              className="relative group"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div
                className={`aspect-video w-[600px] max-w-[600px] rounded-lg overflow-hidden shadow-lg border-2 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100 ${
                  dragOver
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                {imageUrl && !imageError ? (
                  <>
                    <img
                      src={imageUrl}
                      alt="Course thumbnail"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                    />
                    {/* Delete button overlay */}
                    {imageUrl !== "https://placehold.co/600x400.png" && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Popconfirm
                          title="Delete thumbnail?"
                          description="Are you sure you want to delete this thumbnail?"
                          onConfirm={handleDeleteThumbnail}
                          okText="Yes"
                          cancelText="No"
                          disabled={uploading}
                        >
                          <Button
                            type="primary"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            loading={uploading}
                            className="shadow-lg"
                          />
                        </Popconfirm>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-xs font-medium text-gray-600">
                    <div className="w-6 h-6 mb-1 bg-blue-200 rounded flex items-center justify-center">
                      📚
                    </div>
                    <span>Course</span>
                  </div>
                )}
              </div>
            </div>

            <Upload
              name="thumbnail"
              listType="picture-card"
              accept=".jpg,.jpeg,.png,.gif"
              className="custom-upload-btn"
              showUploadList={false}
              beforeUpload={beforeUpload}
              disabled={uploading}
              customRequest={({ file, onSuccess, onError }) => {
                console.log("Custom request triggered");
                handleImageUpload({ file })
                  .then(() => {
                    console.log("Upload successful, calling onSuccess");
                    onSuccess("ok");
                  })
                  .catch((error) => {
                    console.error("Upload failed, calling onError:", error);
                    onError(error);
                  });
              }}
            >
              <div
                className={`flex flex-col items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-300 cursor-pointer group ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <UploadOutlined
                  className={`text-blue-500 text-base mb-1 group-hover:text-blue-600 transition-colors duration-200 ${
                    uploading ? "animate-spin" : ""
                  }`}
                />
                <span className="text-xs font-medium text-gray-700 group-hover:text-gray-800 transition-colors duration-200">
                  {uploading ? "Uploading..." : "Upload Thumbnail"}
                </span>
              </div>
            </Upload>
          </Space>
        </Form.Item>

        {/* Course Title */}
        <Form.Item
          label="Course Title"
          name="title"
          rules={[{ required: true, message: "Please enter course title!" }]}
        >
          <Input placeholder="Enter course title" size="large" />
        </Form.Item>

        {/* Course Description */}
        <Form.Item label="Course Description" name="description">
          <TextArea
            rows={4}
            placeholder="Describe what students will learn in this course"
          />
        </Form.Item>

        {/* Course Price */}
        <Form.Item label="Price ($)" name="price">
          <InputNumber
            placeholder="0 for free course"
            min={0}
            step={0.01}
            style={{ width: "100%" }}
            formatter={(value) =>
              `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <div style={{ textAlign: "right" }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<SaveOutlined />}
            >
              Save Course Details
            </Button>
          </div>
        </Form.Item>
      </Form>

      <style jsx="true">{`
        .custom-upload-btn .ant-upload {
          border: none !important;
          background: transparent !important;
          padding: 0 !important;
        }

        .custom-upload-btn .ant-upload:hover {
          border: none !important;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        body {
          background-color: #f5f5f5;
        }
      `}</style>
    </div>
  );
}

export default CourseDetailsTab;

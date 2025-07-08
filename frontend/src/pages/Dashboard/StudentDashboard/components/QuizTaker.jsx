import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Button,
  Radio,
  Typography,
  Progress,
  Space,
  Modal,
  message,
  Spin,
  Row,
  Col,
  Tag,
  Divider,
  Alert,
} from "antd";
import {
  ClockCircleOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { API_ENDPOINTS } from "../../../../config/api";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;

function QuizTaker({ quizId, onComplete, onBack }) {
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (quizId) {
      initializeQuiz();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (quiz && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quiz, timeRemaining]); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeQuiz = async () => {
    try {
      setLoading(true);

      // Get quiz details
      const quizResponse = await axios.get(API_ENDPOINTS.STUDENT_QUIZ(quizId));
      if (!quizResponse.data.success) {
        throw new Error(quizResponse.data.message);
      }

      const quizData = quizResponse.data.data;
      setQuiz(quizData);
      setTimeRemaining(quizData.duration * 60); // Convert minutes to seconds

      // Start quiz attempt
      const attemptResponse = await axios.post(
        API_ENDPOINTS.START_QUIZ_ATTEMPT(quizId)
      );
      if (!attemptResponse.data.success) {
        throw new Error(attemptResponse.data.message);
      }

      setAttempt(attemptResponse.data.data);
      startTimeRef.current = new Date();
    } catch (error) {
      console.error("Error initializing quiz:", error);
      message.error(error.message || "Failed to load quiz");
      onBack?.();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedOption,
        timeSpent: Math.floor((new Date() - startTimeRef.current) / 1000),
      },
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitQuiz = async () => {
    try {
      setIsSubmitting(true);

      const answersArray = Object.values(answers);
      const response = await axios.post(
        API_ENDPOINTS.SUBMIT_QUIZ(attempt._id),
        { answers: answersArray }
      );

      if (response.data.success) {
        message.success("Quiz submitted successfully!");
        onComplete?.(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      message.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const handleAutoSubmit = () => {
    Modal.warning({
      title: "Time's Up!",
      content: "Your quiz time has expired. Submitting automatically...",
      okText: "OK",
      onOk: () => handleSubmitQuiz(),
    });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    const percentage = (timeRemaining / (quiz.duration * 60)) * 100;
    if (percentage > 50) return "#52c41a";
    if (percentage > 20) return "#faad14";
    return "#ff4d4f";
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>Loading quiz...</div>
      </div>
    );
  }

  if (!quiz || !attempt) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Alert
          message="Quiz Not Available"
          description="Unable to load the quiz. Please try again later."
          type="error"
          showIcon
        />
        <Button type="primary" onClick={onBack} style={{ marginTop: "16px" }}>
          Go Back
        </Button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Quiz Header */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Title level={3} style={{ margin: 0 }}>
              {quiz.title}
            </Title>
            <Text type="secondary">{quiz.courseId.title}</Text>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <div>
                <ClockCircleOutlined
                  style={{ color: getTimeColor(), marginRight: "8px" }}
                />
                <Text
                  strong
                  style={{ color: getTimeColor(), fontSize: "18px" }}
                >
                  {formatTime(timeRemaining)}
                </Text>
              </div>
              <div>
                <Text type="secondary">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </Text>
              </div>
            </Space>
          </Col>
        </Row>

        <Divider />

        <Progress
          percent={Math.round(progress)}
          showInfo={false}
          strokeColor="#1890ff"
        />

        <div style={{ marginTop: "8px", textAlign: "center" }}>
          <Text type="secondary">
            {getAnsweredCount()} of {quiz.questions.length} questions answered
          </Text>
        </div>
      </Card>

      <Row gutter={[24, 0]}>
        {/* Question Panel */}
        <Col xs={24} lg={18}>
          <Card>
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <Tag color="blue">Question {currentQuestionIndex + 1}</Tag>
                <Tag color="orange">{currentQuestion.points} point(s)</Tag>
              </div>

              <Title level={4} style={{ marginBottom: "24px" }}>
                {currentQuestion.question}
              </Title>

              <Radio.Group
                value={answers[currentQuestion._id]?.selectedOption}
                onChange={(e) =>
                  handleAnswerChange(currentQuestion._id, e.target.value)
                }
                style={{ width: "100%" }}
              >
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="middle"
                >
                  {currentQuestion.options.map((option, index) => (
                    <Radio
                      key={option._id}
                      value={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "12px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "6px",
                        marginBottom: "8px",
                      }}
                    >
                      <Text style={{ marginLeft: "8px" }}>{option.text}</Text>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </div>

            {/* Navigation Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "24px",
              }}
            >
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <Space>
                {currentQuestionIndex === quiz.questions.length - 1 ? (
                  <Button
                    type="primary"
                    danger
                    onClick={() => setShowConfirmSubmit(true)}
                    icon={<CheckCircleOutlined />}
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button type="primary" onClick={handleNextQuestion}>
                    Next
                  </Button>
                )}
              </Space>
            </div>
          </Card>
        </Col>

        {/* Question Navigation Panel */}
        <Col xs={24} lg={6}>
          <Card title="Question Navigation" size="small">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "8px",
              }}
            >
              {quiz.questions.map((_, index) => (
                <Button
                  key={index}
                  size="small"
                  type={index === currentQuestionIndex ? "primary" : "default"}
                  style={{
                    backgroundColor: answers[quiz.questions[index]._id]
                      ? index === currentQuestionIndex
                        ? "#1890ff"
                        : "#52c41a"
                      : index === currentQuestionIndex
                      ? "#1890ff"
                      : "transparent",
                  }}
                  onClick={() => handleQuestionNavigation(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>

            <Divider />

            <div style={{ fontSize: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: "#52c41a",
                    marginRight: "8px",
                  }}
                ></div>
                <Text type="secondary">Answered</Text>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: "#1890ff",
                    marginRight: "8px",
                  }}
                ></div>
                <Text type="secondary">Current</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    border: "1px solid #d9d9d9",
                    marginRight: "8px",
                  }}
                ></div>
                <Text type="secondary">Not answered</Text>
              </div>
            </div>

            <Divider />

            <Button
              block
              danger
              onClick={() => setShowConfirmSubmit(true)}
              icon={<WarningOutlined />}
            >
              Submit Early
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Submit Confirmation Modal */}
      <Modal
        title="Submit Quiz"
        open={showConfirmSubmit}
        onOk={handleSubmitQuiz}
        onCancel={() => setShowConfirmSubmit(false)}
        confirmLoading={isSubmitting}
        okText="Submit"
        cancelText="Continue Quiz"
        okButtonProps={{ danger: true }}
      >
        <div>
          <Paragraph>Are you sure you want to submit your quiz?</Paragraph>
          <div style={{ marginBottom: "16px" }}>
            <Text strong>Quiz Progress:</Text>
            <div style={{ marginTop: "8px" }}>
              <Text>
                Answered: {getAnsweredCount()} of {quiz.questions.length}{" "}
                questions
              </Text>
            </div>
            <div>
              <Text>Time remaining: {formatTime(timeRemaining)}</Text>
            </div>
          </div>
          {getAnsweredCount() < quiz.questions.length && (
            <Alert
              message="Incomplete Quiz"
              description={`You have ${
                quiz.questions.length - getAnsweredCount()
              } unanswered questions. Unanswered questions will be marked as incorrect.`}
              type="warning"
              showIcon
              style={{ marginTop: "16px" }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}

export default QuizTaker;

import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Tag,
  Progress,
  Alert,
  Divider,
  List,
  Spin,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { API_ENDPOINTS } from "../../../../config/api";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;

function QuizResults({ attemptId, onBack, onRetake }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (attemptId) {
      fetchResults();
    }
  }, [attemptId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.QUIZ_RESULTS(attemptId));
      if (response.data.success) {
        setResults(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      message.error("Failed to load quiz results");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "#52c41a";
    if (percentage >= 70) return "#faad14";
    return "#ff4d4f";
  };

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>Loading results...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Alert
          message="Results Not Available"
          description="Unable to load quiz results. Please try again later."
          type="error"
          showIcon
        />
        <Button type="primary" onClick={onBack} style={{ marginTop: "16px" }}>
          Go Back
        </Button>
      </div>
    );
  }

  const { attempt, quiz, detailedAnswers } = results;
  const correctAnswers = detailedAnswers.filter(
    (answer) => answer.isCorrect
  ).length;
  const totalQuestions = detailedAnswers.length;

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Results Header */}
      <Card style={{ marginBottom: "24px", textAlign: "center" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <TrophyOutlined
              style={{
                fontSize: "64px",
                color: attempt.isPassed ? "#52c41a" : "#ff4d4f",
              }}
            />
          </div>

          <div>
            <Title level={2} style={{ margin: 0 }}>
              {quiz.title}
            </Title>
            <Text type="secondary" style={{ fontSize: "16px" }}>
              {quiz.course.title}
            </Text>
          </div>

          <div>
            <Tag
              color={attempt.isPassed ? "success" : "error"}
              style={{ fontSize: "16px", padding: "8px 16px" }}
            >
              {attempt.isPassed ? "PASSED" : "FAILED"}
            </Tag>
          </div>

          <Row gutter={[32, 16]} justify="center">
            <Col>
              <Statistic
                title="Your Score"
                value={attempt.percentage.toFixed(1)}
                suffix="%"
                valueStyle={{
                  color: getGradeColor(attempt.percentage),
                  fontSize: "36px",
                }}
              />
              <div style={{ textAlign: "center", marginTop: "8px" }}>
                <Tag
                  color={getGradeColor(attempt.percentage)}
                  style={{ fontSize: "14px" }}
                >
                  Grade: {getGradeLetter(attempt.percentage)}
                </Tag>
              </div>
            </Col>
            <Col>
              <Statistic
                title="Points Earned"
                value={`${attempt.totalPoints} / ${attempt.maxPoints}`}
                valueStyle={{ fontSize: "36px" }}
              />
            </Col>
            <Col>
              <Statistic
                title="Correct Answers"
                value={`${correctAnswers} / ${totalQuestions}`}
                valueStyle={{ fontSize: "36px" }}
              />
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Quiz Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Time Spent"
              value={formatDuration(attempt.totalTimeSpent)}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Passing Score"
              value={quiz.passingScore}
              suffix="%"
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Attempt Number"
              value={attempt.attemptNumber}
              prefix={<ReloadOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Detailed Results */}
      {quiz.showResults && (
        <Card title="Detailed Results" style={{ marginBottom: "24px" }}>
          <List
            itemLayout="vertical"
            dataSource={detailedAnswers}
            renderItem={(answer, index) => (
              <List.Item>
                <Card
                  size="small"
                  style={{
                    border: `2px solid ${
                      answer.isCorrect ? "#52c41a" : "#ff4d4f"
                    }`,
                    backgroundColor: answer.isCorrect ? "#f6ffed" : "#fff2f0",
                  }}
                >
                  <div style={{ marginBottom: "16px" }}>
                    <Space>
                      <Tag color="blue">Question {index + 1}</Tag>
                      <Tag color={answer.isCorrect ? "success" : "error"}>
                        {answer.isCorrect ? (
                          <>
                            <CheckCircleOutlined /> Correct
                          </>
                        ) : (
                          <>
                            <CloseCircleOutlined /> Incorrect
                          </>
                        )}
                      </Tag>
                      <Tag>
                        {answer.pointsEarned} / {answer.maxPoints} points
                      </Tag>
                    </Space>
                  </div>

                  <Title level={5} style={{ marginBottom: "16px" }}>
                    {answer.question}
                  </Title>

                  <div style={{ marginBottom: "16px" }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {answer.options.map((option, optionIndex) => {
                        const isSelected =
                          optionIndex === answer.selectedOption;
                        const isCorrect = answer.correctOptions.find(
                          (co) => co.index === optionIndex
                        )?.isCorrect;

                        let backgroundColor = "transparent";
                        let borderColor = "#d9d9d9";
                        let textColor = "inherit";

                        if (isSelected && isCorrect) {
                          backgroundColor = "#f6ffed";
                          borderColor = "#52c41a";
                          textColor = "#52c41a";
                        } else if (isSelected && !isCorrect) {
                          backgroundColor = "#fff2f0";
                          borderColor = "#ff4d4f";
                          textColor = "#ff4d4f";
                        } else if (!isSelected && isCorrect) {
                          backgroundColor = "#f6ffed";
                          borderColor = "#52c41a";
                          textColor = "#52c41a";
                        }

                        return (
                          <div
                            key={optionIndex}
                            style={{
                              padding: "12px",
                              border: `1px solid ${borderColor}`,
                              borderRadius: "6px",
                              backgroundColor,
                              color: textColor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text style={{ color: textColor }}>
                              {option.text}
                            </Text>
                            <Space>
                              {isSelected && (
                                <Tag color="blue" size="small">
                                  Selected
                                </Tag>
                              )}
                              {isCorrect && (
                                <CheckCircleOutlined
                                  style={{ color: "#52c41a" }}
                                />
                              )}
                            </Space>
                          </div>
                        );
                      })}
                    </Space>
                  </div>

                  {answer.explanation && (
                    <Alert
                      message="Explanation"
                      description={answer.explanation}
                      type="info"
                      showIcon
                      style={{ marginTop: "16px" }}
                    />
                  )}
                </Card>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <Row justify="center" gutter={16}>
          <Col>
            <Button type="default" icon={<HomeOutlined />} onClick={onBack}>
              Back to Quizzes
            </Button>
          </Col>
          {onRetake && (
            <Col>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={onRetake}
              >
                Retake Quiz
              </Button>
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
}

// Add missing Statistic component import
const Statistic = ({ title, value, suffix, prefix, valueStyle }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: "14px", color: "#8c8c8c", marginBottom: "4px" }}>
      {prefix && <span style={{ marginRight: "4px" }}>{prefix}</span>}
      {title}
    </div>
    <div style={{ fontSize: "24px", fontWeight: "bold", ...valueStyle }}>
      {value}
      {suffix && (
        <span style={{ fontSize: "16px", marginLeft: "4px" }}>{suffix}</span>
      )}
    </div>
  </div>
);

export default QuizResults;

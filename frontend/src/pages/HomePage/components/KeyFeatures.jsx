import { Card, Col, Row } from "antd";
import Paragraph from "antd/es/skeleton/Paragraph";
import Title from "antd/es/skeleton/Title";
import { BarChart3, Brain, Gamepad2, Network } from "lucide-react";

const KeyFeatures = () => {
  const features = [
    {
      icon: <Brain className="w-12 h-12 text-blue-500" />,
      title: "AI-Driven Personalization",
      description:
        "Our ML algorithms predict performance, adapt learning paths, and offer intelligent tutoring for your unique needs.",
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-blue-500" />,
      title: "Intelligent Progress Tracking",
      description:
        "Visualize your journey with clear progress zones (Safe, Average, Red) and personalized reports.",
    },
    {
      icon: <Gamepad2 className="w-12 h-12 text-blue-500" />,
      title: "Gamified Learning",
      description:
        "Engage with interactive quizzes, earn badges, and stay motivated on your learning path.",
    },
    {
      icon: <Network className="w-12 h-12 text-blue-500" />,
      title: "Career Guidance",
      description:
        "Receive AI-powered career recommendations based on your skills and market insights.",
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Title level={2} className="text-gray-800 text-4xl font-bold">
            The Future of Learning, Today
          </Title>
        </div>

        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card className="h-full text-center border-0 p-10 shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-6">{feature.icon}</div>
                <Title level={4} className="text-gray-800 mb-4">
                  {feature.title}
                </Title>
                <Paragraph className="text-gray-500">
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default KeyFeatures;

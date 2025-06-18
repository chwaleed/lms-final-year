import { Button, Col, Row } from "antd";
import Paragraph from "antd/es/skeleton/Paragraph";
import Title from "antd/es/skeleton/Title";
import {
  ArrowRight,
  BarChart3,
  Brain,
  GraduationCap,
  Users,
} from "lucide-react";

const HeroSection = () => {
  return (
    <section className="bg-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Row gutter={[48, 32]} align="middle">
          <Col xs={24} lg={12}>
            <div className="space-y-6">
              <Title
                level={1}
                className="text-gray-800 text-5xl font-bold leading-tight"
              >
                Unlock Your Potential: AI-Powered Learning, Tailored For You
              </Title>
              <Paragraph className="text-gray-500 text-lg leading-relaxed">
                Experience personalized education with intelligent tutoring,
                adaptive course suggestions, and predictive insights to guide
                your success.
              </Paragraph>
              <div className="space-y-4">
                <Button
                  type="primary"
                  size="large"
                  className="bg-orange-500 hover:bg-orange-600 border-orange-500 h-12 px-8 text-lg"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Explore Courses
                </Button>
                <div>
                  <a href="#" className="text-blue-500 hover:text-blue-600">
                    Are you an Educator? Learn More
                  </a>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-orange-500 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-lg p-4">
                    <Brain className="w-8 h-8 mb-2" />
                    <div className="text-sm font-medium">
                      AI Personalization
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <BarChart3 className="w-8 h-8 mb-2" />
                    <div className="text-sm font-medium">Progress Tracking</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <Users className="w-8 h-8 mb-2" />
                    <div className="text-sm font-medium">Collaboration</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <GraduationCap className="w-8 h-8 mb-2" />
                    <div className="text-sm font-medium">Career Guidance</div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default HeroSection;

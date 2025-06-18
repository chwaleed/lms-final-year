import { Col, Row } from "antd";
import Paragraph from "antd/es/skeleton/Paragraph";
import Title from "antd/es/skeleton/Title";
import { BrainCircuitIcon } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} lg={6}>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <BrainCircuitIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  EduSpark AI
                </span>
              </div>
              <Paragraph className="text-gray-400">
                Empowering learners with AI-driven education.
              </Paragraph>
              <div className="text-sm text-gray-400">
                © 2025 EduSpark AI. All Rights Reserved.
              </div>
            </div>
          </Col>

          <Col xs={12} sm={6} lg={6}>
            <div className="space-y-4">
              <Title level={5} className="text-white">
                Product
              </Title>
              <div className="space-y-2">
                <div>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Features
                  </a>
                </div>
                <div>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Courses
                  </a>
                </div>
                <div>
                  <a href="#" className="text-gray-300 hover:text-white">
                    For Students
                  </a>
                </div>
                <div>
                  <a href="#" className="text-gray-300 hover:text-white">
                    For Teachers
                  </a>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={12} sm={6} lg={6}>
            <div className="space-y-4">
              <Title level={5} className="text-white">
                Company
              </Title>
              <div className="space-y-2">
                <div>
                  <a href="#" className="text-gray-300 hover:text-white">
                    About Us
                  </a>
                </div>
                <div>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Careers
                  </a>
                </div>
                <div>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Contact Us
                  </a>
                </div>
                <div>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Accessibility
                  </a>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div className="space-y-4">
              <Title level={5} className="text-white">
                Legal
              </Title>
              <div className="space-y-2">
                <div>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Privacy Policy
                  </a>
                </div>
                <div>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </footer>
  );
};

export default Footer;

import { Col, Row } from "antd";
import Paragraph from "antd/es/skeleton/Paragraph";
import Title from "antd/es/skeleton/Title";

// Feature Spotlight Component
const FeatureSpotlight = ({
  title,
  description,
  visual,
  reverse = false,
  background = "white",
}) => {
  const bgClass = background === "gray" ? "bg-gray-100" : "bg-white";

  return (
    <section className={`${bgClass} py-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Row gutter={[48, 32]} align="middle">
          <Col xs={24} lg={12} order={reverse ? 2 : 1}>
            <div className="space-y-6">
              <Title level={3} className="text-gray-800 text-3xl font-bold">
                {title}
              </Title>
              <Paragraph className="text-gray-500 text-lg leading-relaxed">
                {description}
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} lg={12} order={reverse ? 1 : 2}>
            <div className="relative">{visual}</div>
          </Col>
        </Row>
      </div>
    </section>
  );
};
export default FeatureSpotlight;

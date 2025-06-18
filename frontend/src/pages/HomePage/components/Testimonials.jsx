import { Card, Col, Row } from "antd";
import Paragraph from "antd/es/skeleton/Paragraph";
import Title from "antd/es/skeleton/Title";

const Testimonials = () => {
  const testimonials = [
    {
      quote:
        "The AI-powered recommendations helped me identify my weak areas before I even realized them myself. Game-changing!",
      author: "Sarah Chen",
      role: "Computer Science Student",
    },
    {
      quote:
        "As an educator, I love how the platform provides insights into student performance and engagement patterns.",
      author: "Dr. Michael Rodriguez",
      role: "Professor, Stanford University",
    },
    {
      quote:
        "The gamification features keep me motivated, and the career guidance has been incredibly valuable for my professional development.",
      author: "Alex Thompson",
      role: "Business Analytics Student",
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Title level={2} className="text-gray-800 text-4xl font-bold">
            Trusted by Learners and Educators
          </Title>
        </div>

        <Row gutter={[32, 32]}>
          {testimonials.map((testimonial, index) => (
            <Col xs={24} lg={8} key={index}>
              <Card className="h-full border-0 shadow-lg">
                <div className="mb-6">
                  <Paragraph className="text-gray-500 italic text-lg">
                    "{testimonial.quote}"
                  </Paragraph>
                </div>
                <div>
                  <div className="font-bold text-gray-800">
                    {testimonial.author}
                  </div>
                  <div className="text-gray-500">{testimonial.role}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default Testimonials;

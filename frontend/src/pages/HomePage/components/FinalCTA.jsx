import { Button } from "antd";
import Title from "antd/es/skeleton/Title";

const FinalCTA = () => {
  return (
    <section className="bg-gray-800 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Title level={2} className="text-white text-4xl font-bold mb-8">
          Ready to Revolutionize Your Learning Experience?
        </Title>
        <Button
          type="primary"
          size="large"
          className="bg-orange-500 hover:bg-orange-600 border-orange-500 h-14 px-12 text-xl"
        >
          Sign Up For Free
        </Button>
      </div>
    </section>
  );
};
export default FinalCTA;

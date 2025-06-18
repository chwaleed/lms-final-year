import Footer from "../../generalComponents/Footer";
import Navigation from "../../generalComponents/Navigation";
import CollaborationMockup from "./components/CollaborationMockup";
import DashboardMockup from "./components/DashboardMockup";
import FeatureSpotlight from "./components/FeatureSpotlight";
import FinalCTA from "./components/FinalCTA";
import GamificationMockup from "./components/GamificationMockup";
import HeroSection from "./components/HeroSection";
import KeyFeatures from "./components/KeyFeatures";
import Testimonials from "./components/Testimonials";

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <KeyFeatures />

      <FeatureSpotlight
        title="Smarter Learning with Predictive Insights"
        description="Leverage the power of machine learning. We analyze performance data to identify potential challenges early, suggest tailored resources, and ensure you're always on the most effective learning path. Our intelligent tutors provide real-time feedback and support."
        visual={<DashboardMockup />}
        background="gray"
      />

      <FeatureSpotlight
        title="Track, Engage, and Achieve"
        description="Stay motivated with our intuitive progress tracking. See where you excel (Safe Zone), where you're on track (Average Zone), and where you need focus (Red Zone). Earn badges for milestones and enjoy gamified quizzes that make learning fun."
        visual={<GamificationMockup />}
        reverse={true}
      />

      <FeatureSpotlight
        title="Connect, Collaborate, and Chart Your Career"
        description="Join vibrant student communities and discussion forums. Participate in mentorship programs connecting experienced learners with newcomers. Gain valuable job market insights and career path recommendations tailored to your progress and aspirations."
        visual={<CollaborationMockup />}
        background="gray"
      />

      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
};
export default HomePage;

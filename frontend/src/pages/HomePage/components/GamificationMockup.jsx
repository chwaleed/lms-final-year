import { Gamepad2, GraduationCap, Star, TrendingUp } from "lucide-react";

const GamificationMockup = () => (
  <div className="bg-white rounded-2xl shadow-2xl p-6">
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Achievement Center
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-yellow-100 rounded-lg p-3 text-center">
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-sm font-medium text-yellow-700">Quiz Master</div>
        </div>
        <div className="bg-blue-100 rounded-lg p-3 text-center">
          <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-sm font-medium text-blue-700">Progress Hero</div>
        </div>
        <div className="bg-green-100 rounded-lg p-3 text-center">
          <GraduationCap className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-sm font-medium text-green-700">
            Course Complete
          </div>
        </div>
      </div>
    </div>
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm opacity-90">Current Streak</div>
          <div className="text-2xl font-bold">12 Days</div>
        </div>
        <Gamepad2 className="w-8 h-8" />
      </div>
    </div>
  </div>
);

export default GamificationMockup;

import { Avatar } from "antd";

const CollaborationMockup = () => (
  <div className="bg-white rounded-2xl shadow-2xl p-6">
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Community & Career
      </h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <Avatar className="bg-blue-500">M</Avatar>
          <div>
            <div className="font-medium text-gray-800">Mentor Match</div>
            <div className="text-sm text-gray-500">
              Connect with industry experts
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
          <Avatar className="bg-green-500">F</Avatar>
          <div>
            <div className="font-medium text-gray-800">Study Groups</div>
            <div className="text-sm text-gray-500">
              Join collaborative learning
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
          <div className="text-sm opacity-90">Recommended Career Path</div>
          <div className="text-lg font-bold">Data Scientist</div>
          <div className="text-sm opacity-90">
            92% match based on your skills
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CollaborationMockup;

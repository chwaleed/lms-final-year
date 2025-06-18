const DashboardMockup = () => (
  <div className="bg-white rounded-2xl shadow-2xl p-6">
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Performance Analytics
        </h3>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-blue-500 to-orange-500 rounded-lg p-4 text-white mb-4">
        <div className="text-sm opacity-90">Predicted Success Rate</div>
        <div className="text-2xl font-bold">87%</div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-green-600 text-sm font-medium">Safe Zone</div>
          <div className="text-green-800 text-lg font-bold">75%</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-yellow-600 text-sm font-medium">Average</div>
          <div className="text-yellow-800 text-lg font-bold">20%</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-red-600 text-sm font-medium">Red Zone</div>
          <div className="text-red-800 text-lg font-bold">5%</div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardMockup;

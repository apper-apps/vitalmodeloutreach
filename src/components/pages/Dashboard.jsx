import React, { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { modelService } from "@/services/api/modelService";

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await modelService.getStats();
      setStats(data);
    } catch (err) {
      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadStats} />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Overview</h2>
        <p className="text-gray-600">Track your model outreach performance and engagement.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Models"
          value={stats.totalModels || 0}
          icon="Users"
          gradient="from-primary-500 to-primary-600"
        />
        <StatCard
          title="Total Follows"
          value={stats.totalFollows || 0}
          icon="UserPlus"
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="DMs Sent"
          value={stats.totalDMs || 0}
          icon="MessageCircle"
          gradient="from-blue-500 to-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(stats.platformBreakdown || {}).map(([platform, count]) => (
              <div key={platform} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{platform}</span>
                <span className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded-full">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Latest model added today</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-600">{stats.totalDMs || 0} DMs sent this week</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span className="text-gray-600">{stats.totalFollows || 0} accounts followed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
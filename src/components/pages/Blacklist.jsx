import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { blacklistService } from "@/services/api/blacklistService";

const Blacklist = () => {
  const [blacklist, setBlacklist] = useState([]);
  const [filteredBlacklist, setFilteredBlacklist] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBlacklist = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await blacklistService.getAll();
      setBlacklist(data);
      setFilteredBlacklist(data);
    } catch (err) {
      setError("Failed to load blacklist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlacklist();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredBlacklist(blacklist);
    } else {
      const filtered = blacklist.filter(item =>
        item.link.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBlacklist(filtered);
    }
  }, [searchTerm, blacklist]);

  const handleRemoveFromBlacklist = async (id) => {
    if (!window.confirm("Are you sure you want to remove this from blacklist?")) return;

    try {
      await blacklistService.delete(id);
      setBlacklist(prev => prev.filter(item => item.Id !== id));
      toast.success("Removed from blacklist successfully!");
    } catch (err) {
      toast.error("Failed to remove from blacklist");
    }
  };

  const getPlatformBadgeColor = (platform) => {
    const colors = {
      Instagram: "bg-pink-100 text-pink-800 border-pink-200",
      TikTok: "bg-purple-100 text-purple-800 border-purple-200",
      OnlyFans: "bg-blue-100 text-blue-800 border-blue-200",
      Twitter: "bg-sky-100 text-sky-800 border-sky-200",
      Other: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[platform] || colors.Other;
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadBlacklist} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Blacklist</h2>
        <p className="text-gray-600">Manage blocked or inappropriate models.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search blacklist..."
          />
        </div>
        <div className="text-sm text-gray-500">
          {filteredBlacklist.length} of {blacklist.length} blocked
        </div>
      </div>

      {filteredBlacklist.length === 0 ? (
        blacklist.length === 0 ? (
          <Empty
            title="No blocked models"
            description="Models that are blocked or inappropriate will appear here."
            icon="UserX"
          />
        ) : (
          <Empty
            title="No matching results"
            description="Try adjusting your search criteria."
            icon="Search"
          />
        )
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBlacklist.map((item, index) => (
                  <tr key={item.Id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 font-medium text-sm truncate max-w-[200px] block"
                      >
                        {item.link}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPlatformBadgeColor(item.platform)}`}>
                        {item.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-[300px]">
                      <div className="truncate" title={item.reason}>
                        {item.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.dateAdded).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Trash2"
                        onClick={() => handleRemoveFromBlacklist(item.Id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blacklist;
import React from "react";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
const ModelsTable = ({ models, onEdit, onDelete, onBlacklist, accounts = [], onFollowedByChange, onDMSentChange, onDMSentDateChange, platforms = [] }) => {
  const getPlatformBadgeColor = (platform) => {
    const platformConfig = platforms.find(p => p.name === platform);
    if (platformConfig) {
      return {
        backgroundColor: platformConfig.pillBackgroundColor,
        color: platformConfig.pillTextColor,
        borderColor: platformConfig.pillTextColor + '20'
      };
    }
    // Fallback colors for unknown platforms
    return {
      backgroundColor: "#f3f4f6",
      color: "#374151",
      borderColor: "#d1d5db"
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Link
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Added
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Followed By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Follow Date
              </th>
<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DM Sent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DM Sent Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DM Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
<tbody className="bg-white divide-y divide-gray-200">
            {models.map((model, index) => {
              const getRowBackgroundColor = () => {
                if (model.dmSent) {
                  return "bg-blue-50"; // Pale blue if DM Sent is checked
                } else if (model.followedBy && model.followedBy.trim() !== "") {
                  return "bg-yellow-50"; // Pale yellow if Followed By has value but DM not sent
                } else {
                  return index % 2 === 0 ? "bg-white" : "bg-gray-25"; // Default alternating colors
                }
              };

              return (
              <tr key={model.Id} className={`hover:bg-gray-50 transition-colors duration-200 ${getRowBackgroundColor()}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={model.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-800 font-medium text-sm truncate max-w-[200px] block"
                  >
                    {model.link}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(model.dateAdded)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPlatformBadgeColor(model.platform)}`}>
                    {model.platform}
                  </span>
                </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <Select
                    value={model.followedBy || ""}
                    onChange={(e) => onFollowedByChange && onFollowedByChange(model.Id, e.target.value)}
                    className="min-w-[150px]"
                  >
                    <option value="">Select Account</option>
                    {accounts.map((account) => (
                      <option key={account.Id} value={account.username}>
                        {account.name} (@{account.username})
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(model.followDate)}
                </td>
<td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={model.dmSent || false}
                    onChange={(e) => onDMSentChange && onDMSentChange(model.Id, e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="date"
                    value={model.dmSentDate ? new Date(model.dmSentDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => onDMSentDateChange && onDMSentDateChange(model.Id, e.target.value)}
                    className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-[200px]">
                  <div className="truncate" title={model.notes}>
                    {model.notes || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
<div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Edit"
                      onClick={() => onEdit(model)}
                      className="text-primary-600 hover:text-primary-700"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="UserX"
                      onClick={() => onBlacklist(model.Id)}
                      className="text-orange-600 hover:text-orange-700"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Trash2"
                      onClick={() => onDelete(model.Id)}
                      className="text-red-600 hover:text-red-700"
                    />
</div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModelsTable;
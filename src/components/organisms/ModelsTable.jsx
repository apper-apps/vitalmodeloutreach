import React, { useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";

const ModelsTable = ({ models, onEdit, onDelete, onBlacklist, accounts = [], onFollowedByChange, onDMSentChange, onDMSentDateChange, platforms = [], onInlineUpdate }) => {
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [savingCell, setSavingCell] = useState(null);

  // Get unique platforms from models for dropdown
  const getAvailablePlatforms = () => {
    const platformsFromModels = [...new Set(models.map(m => m.platform).filter(Boolean))];
    const platformsFromConfig = platforms.map(p => p.name);
    return [...new Set([...platformsFromModels, ...platformsFromConfig])];
  };
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

  const handleCellEdit = (modelId, field, currentValue) => {
    setEditingCell(`${modelId}-${field}`);
    setEditingValue(currentValue || "");
  };

  const handleCellSave = async (modelId, field) => {
    const cellKey = `${modelId}-${field}`;
    setSavingCell(cellKey);
    
    try {
      let updateData = {};
      
      // Validate and format the value based on field type
      if (field === 'followDate' || field === 'dmSentDate') {
        if (editingValue && editingValue.trim()) {
          const date = new Date(editingValue);
          if (isNaN(date.getTime())) {
            toast.error("Please enter a valid date");
            setSavingCell(null);
            return;
          }
          updateData[field] = date.toISOString();
        } else {
          updateData[field] = null;
        }
      } else {
        updateData[field] = editingValue.trim();
      }

      // Call the update function (passed from parent)
      if (onInlineUpdate) {
        await onInlineUpdate(modelId, updateData);
      }
      
      setEditingCell(null);
      setEditingValue("");
      toast.success(`${field === 'platform' ? 'Platform' : field === 'notes' ? 'Notes' : field === 'followDate' ? 'Follow date' : 'DM sent date'} updated successfully!`);
    } catch (err) {
      toast.error("Failed to update field");
    } finally {
      setSavingCell(null);
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditingValue("");
  };

  const handleKeyDown = (e, modelId, field) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCellSave(modelId, field);
    } else if (e.key === 'Escape') {
      handleCellCancel();
    }
  };

  const EditableCell = ({ modelId, field, value, displayValue, children }) => {
    const cellKey = `${modelId}-${field}`;
    const isEditing = editingCell === cellKey;
    const isSaving = savingCell === cellKey;

    if (isEditing) {
      if (field === 'platform') {
        return (
          <Select
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onBlur={() => handleCellSave(modelId, field)}
            onKeyDown={(e) => handleKeyDown(e, modelId, field)}
            className="min-w-[120px] text-xs"
            autoFocus
          >
            <option value="">Select Platform</option>
            {getAvailablePlatforms().map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </Select>
        );
      } else if (field === 'notes') {
        return (
          <textarea
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onBlur={() => handleCellSave(modelId, field)}
            onKeyDown={(e) => handleKeyDown(e, modelId, field)}
            className="w-full min-w-[150px] px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            rows="2"
            autoFocus
          />
        );
      } else if (field === 'followDate' || field === 'dmSentDate') {
        return (
          <Input
            type="date"
            value={editingValue ? new Date(editingValue).toISOString().split('T')[0] : ''}
            onChange={(e) => setEditingValue(e.target.value)}
            onBlur={() => handleCellSave(modelId, field)}
            onKeyDown={(e) => handleKeyDown(e, modelId, field)}
            className="min-w-[130px] text-xs"
            autoFocus
          />
        );
      }
    }

    return (
      <div
        className="cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors duration-200 min-h-[32px] flex items-center"
        onClick={() => handleCellEdit(modelId, field, value)}
        title="Click to edit"
      >
        {isSaving ? (
          <div className="flex items-center space-x-2">
            <ApperIcon name="Loader2" size={12} className="animate-spin" />
            <span className="text-xs text-gray-500">Saving...</span>
          </div>
        ) : (
          children || displayValue || "-"
        )}
      </div>
    );
  };
  return (
<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto -mx-4 sm:mx-0" style={{ WebkitOverflowScrolling: 'touch' }}>
<table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '800px' }}>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                Link
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                Date Added
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                Platform
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                Followed By
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                Follow Date
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                DM Sent
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[130px]">
                DM Sent Date
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                Notes
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
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
                  <EditableCell
                    modelId={model.Id}
                    field="platform"
                    value={model.platform}
                    displayValue={model.platform}
                  >
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border`} style={getPlatformBadgeColor(model.platform)}>
                      {model.platform}
                    </span>
                  </EditableCell>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <Select
                    value={model.followedBy || ""}
                    onChange={(e) => onFollowedByChange && onFollowedByChange(model.Id, e.target.value)}
                    className="min-w-[150px] min-h-[40px] text-xs sm:text-sm"
                  >
<option value="">Select Account</option>
                    {accounts.map((account) => (
                      <option key={account.Id} value={account.username}>
                        @{account.username}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                  <EditableCell
                    modelId={model.Id}
                    field="followDate"
                    value={model.followDate}
                    displayValue={formatDate(model.followDate)}
                  />
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={model.dmSent || false}
                    onChange={(e) => onDMSentChange && onDMSentChange(model.Id, e.target.checked)}
                    className="h-5 w-5 sm:h-4 sm:w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <EditableCell
                    modelId={model.Id}
                    field="dmSentDate"
                    value={model.dmSentDate}
                    displayValue={formatDate(model.dmSentDate)}
                  />
                </td>
                <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 max-w-[150px] sm:max-w-[200px]">
                  <EditableCell
                    modelId={model.Id}
                    field="notes"
                    value={model.notes}
                    displayValue={
                      <div className="truncate" title={model.notes}>
                        {model.notes || "-"}
                      </div>
                    }
                  />
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row sm:space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Edit"
                      onClick={() => onEdit(model)}
                      className="text-primary-600 hover:text-primary-700 min-h-[36px] min-w-[36px] text-xs flex items-center justify-center"
                      title="Edit"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="UserX"
                      onClick={() => onBlacklist(model.Id)}
                      className="text-orange-600 hover:text-orange-700 min-h-[36px] min-w-[36px] text-xs flex items-center justify-center"
                      title="Blacklist"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Trash2"
                      onClick={() => onDelete(model.Id)}
                      className="text-red-600 hover:text-red-700 min-h-[36px] min-w-[36px] text-xs flex items-center justify-center"
                      title="Delete"
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
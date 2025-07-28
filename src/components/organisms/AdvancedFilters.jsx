import React from 'react';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Input from '@/components/atoms/Input';

function AdvancedFilters({
  filters,
  onFiltersChange,
  accounts,
  models,
  isExpanded,
  onToggleExpanded
}) {
  const platforms = [...new Set(models.map(model => model.platform))].sort();
  const followedByOptions = [...new Set(models.map(model => model.followedBy).filter(Boolean))].sort();

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? null : value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      platform: null,
      followedBy: null,
      dmSent: null,
      dateAddedFrom: null,
      dateAddedTo: null,
      followDateFrom: null,
      followDateTo: null,
      dmSentDateFrom: null,
      dmSentDateTo: null
    });
  };

  const activeFilterCount = Object.values(filters).filter(value => value !== null && value !== '').length;

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'yyyy-MM-dd');
  };

  return (
<div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 space-y-4">
      {/* Filter Header */}
      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="md"
            onClick={onToggleExpanded}
            className="text-gray-600 hover:text-gray-900 min-h-[44px] justify-start px-2"
          >
            <ApperIcon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
            <span className="text-sm sm:text-base">Advanced Filters</span>
          </Button>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {activeFilterCount} active
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="md"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700 min-h-[44px] w-full sm:w-auto justify-center sm:justify-start"
          >
            <ApperIcon name="X" size={14} />
            <span className="text-sm">Clear all</span>
          </Button>
        )}
      </div>

      {/* Filter Content */}
{isExpanded && (
        <div className="space-y-4">
          {/* Row 1: Platform, Followed By, DM Sent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Platform"
              value={filters.platform || ''}
              onChange={(e) => handleFilterChange('platform', e.target.value)}
              className="min-h-[44px]"
            >
              <option value="">All Platforms</option>
              {platforms.map(platform => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </Select>

            <Select
              label="Followed By"
              value={filters.followedBy || ''}
              onChange={(e) => handleFilterChange('followedBy', e.target.value)}
              className="min-h-[44px]"
            >
              <option value="">All Accounts</option>
              <option value="__none__">Not Followed</option>
              {followedByOptions.map(account => (
                <option key={account} value={account}>
                  {account}
                </option>
              ))}
            </Select>

            <Select
              label="DM Sent Status"
              value={filters.dmSent || ''}
              onChange={(e) => handleFilterChange('dmSent', e.target.value)}
              className="min-h-[44px]"
            >
              <option value="">All Statuses</option>
              <option value="true">DM Sent</option>
              <option value="false">DM Not Sent</option>
            </Select>
          </div>

          {/* Row 2: Date Added Range */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date Added Range</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                placeholder="From date"
                value={formatDateForInput(filters.dateAddedFrom)}
                onChange={(e) => handleFilterChange('dateAddedFrom', e.target.value)}
                className="min-h-[44px]"
              />
              <Input
                type="date"
                placeholder="To date"
                value={formatDateForInput(filters.dateAddedTo)}
                onChange={(e) => handleFilterChange('dateAddedTo', e.target.value)}
                className="min-h-[44px]"
              />
            </div>
          </div>

          {/* Row 3: Follow Date Range */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Follow Date Range</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                placeholder="From date"
                value={formatDateForInput(filters.followDateFrom)}
                onChange={(e) => handleFilterChange('followDateFrom', e.target.value)}
                className="min-h-[44px]"
              />
              <Input
                type="date"
                placeholder="To date"
                value={formatDateForInput(filters.followDateTo)}
                onChange={(e) => handleFilterChange('followDateTo', e.target.value)}
                className="min-h-[44px]"
              />
            </div>
          </div>

          {/* Row 4: DM Sent Date Range */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">DM Sent Date Range</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                placeholder="From date"
                value={formatDateForInput(filters.dmSentDateFrom)}
                onChange={(e) => handleFilterChange('dmSentDateFrom', e.target.value)}
                className="min-h-[44px]"
              />
              <Input
                type="date"
                placeholder="To date"
                value={formatDateForInput(filters.dmSentDateTo)}
                onChange={(e) => handleFilterChange('dmSentDateTo', e.target.value)}
                className="min-h-[44px]"
              />
            </div>
          </div>

          {/* Active Filters Summary */}
{activeFilterCount > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Active filters:</div>
              <div className="flex flex-wrap gap-2">
                {filters.platform && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Platform: {filters.platform}
                    <button
                      onClick={() => handleFilterChange('platform', null)}
                      className="ml-1 hover:text-blue-600 min-h-[20px] min-w-[20px] flex items-center justify-center"
                    >
                      <ApperIcon name="X" size={12} />
                    </button>
                  </span>
                )}
                {filters.followedBy && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Followed By: {filters.followedBy === '__none__' ? 'Not Followed' : filters.followedBy}
                    <button
                      onClick={() => handleFilterChange('followedBy', null)}
                      className="ml-1 hover:text-green-600 min-h-[20px] min-w-[20px] flex items-center justify-center"
                    >
                      <ApperIcon name="X" size={12} />
                    </button>
                  </span>
                )}
                {filters.dmSent && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    DM: {filters.dmSent === 'true' ? 'Sent' : 'Not Sent'}
                    <button
                      onClick={() => handleFilterChange('dmSent', null)}
                      className="ml-1 hover:text-purple-600 min-h-[20px] min-w-[20px] flex items-center justify-center"
                    >
                      <ApperIcon name="X" size={12} />
                    </button>
                  </span>
                )}
                {(filters.dateAddedFrom || filters.dateAddedTo) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Date Added: {filters.dateAddedFrom || '∞'} - {filters.dateAddedTo || '∞'}
                    <button
                      onClick={() => {
                        handleFilterChange('dateAddedFrom', null);
                        handleFilterChange('dateAddedTo', null);
                      }}
                      className="ml-1 hover:text-yellow-600 min-h-[20px] min-w-[20px] flex items-center justify-center"
                    >
                      <ApperIcon name="X" size={12} />
                    </button>
                  </span>
                )}
                {(filters.followDateFrom || filters.followDateTo) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Follow Date: {filters.followDateFrom || '∞'} - {filters.followDateTo || '∞'}
                    <button
                      onClick={() => {
                        handleFilterChange('followDateFrom', null);
                        handleFilterChange('followDateTo', null);
                      }}
                      className="ml-1 hover:text-indigo-600 min-h-[20px] min-w-[20px] flex items-center justify-center"
                    >
                      <ApperIcon name="X" size={12} />
                    </button>
                  </span>
                )}
                {(filters.dmSentDateFrom || filters.dmSentDateTo) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                    DM Date: {filters.dmSentDateFrom || '∞'} - {filters.dmSentDateTo || '∞'}
                    <button
                      onClick={() => {
                        handleFilterChange('dmSentDateFrom', null);
                        handleFilterChange('dmSentDateTo', null);
                      }}
                      className="ml-1 hover:text-pink-600 min-h-[20px] min-w-[20px] flex items-center justify-center"
                    >
                      <ApperIcon name="X" size={12} />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdvancedFilters;
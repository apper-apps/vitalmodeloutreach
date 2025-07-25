import React from "react";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ title, value, icon, trend, trendValue, gradient = "from-primary-500 to-primary-600" }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {value}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              <ApperIcon 
                name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
                size={14} 
                className={trend === "up" ? "text-green-600" : "text-red-600"} 
              />
              <span className={`text-sm font-medium ml-1 ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
          <ApperIcon name={icon} size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
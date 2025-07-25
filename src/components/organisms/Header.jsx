import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Header = ({ onMenuClick, title = "Dashboard" }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 lg:pl-60">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={onMenuClick}
            >
              <ApperIcon name="Menu" size={20} />
            </button>
            <h1 className="ml-4 lg:ml-0 text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
              <ApperIcon name="User" size={16} className="text-primary-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
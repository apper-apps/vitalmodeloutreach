import React from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isOpen, onClose }) => {
  const navigation = [
    { name: "Dashboard", href: "/", icon: "BarChart3" },
    { name: "Models", href: "/models", icon: "Users" },
    { name: "Blacklist", href: "/blacklist", icon: "UserX" },
    { name: "Settings", href: "/settings", icon: "Settings" }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-primary-600 to-primary-700 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6 py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                <ApperIcon name="Sparkles" size={20} className="text-primary-600" />
              </div>
              <h1 className="text-xl font-bold text-white">ModelOutreach</h1>
            </div>
          </div>
          <nav className="flex-1 px-4 pb-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-white bg-opacity-20 text-white border-l-4 border-white"
                      : "text-primary-100 hover:bg-white hover:bg-opacity-10 hover:text-white"
                  }`
                }
              >
                <ApperIcon name={item.icon} size={18} className="mr-3 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="relative flex flex-col w-64 bg-gradient-to-b from-primary-600 to-primary-700 transform translate-x-0 transition-transform duration-300 ease-in-out">
              <div className="flex items-center justify-between flex-shrink-0 px-6 py-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                    <ApperIcon name="Sparkles" size={20} className="text-primary-600" />
                  </div>
                  <h1 className="text-xl font-bold text-white">ModelOutreach</h1>
                </div>
                <button
                  onClick={onClose}
                  className="text-primary-100 hover:text-white transition-colors duration-200"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>
              <nav className="flex-1 px-4 pb-4 space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-white bg-opacity-20 text-white border-l-4 border-white"
                          : "text-primary-100 hover:bg-white hover:bg-opacity-10 hover:text-white"
                      }`
                    }
                  >
                    <ApperIcon name={item.icon} size={18} className="mr-3 flex-shrink-0" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
import React from "react";

const Loading = ({ type = "table" }) => {
  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
{[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2 sm:gap-4 py-3 border-b border-gray-100 last:border-0">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded hidden sm:block"></div>
                <div className="h-4 bg-gray-200 rounded hidden sm:block"></div>
                <div className="h-4 bg-gray-200 rounded hidden sm:block"></div>
                <div className="h-4 bg-gray-200 rounded hidden lg:block"></div>
                <div className="h-4 bg-gray-200 rounded hidden lg:block"></div>
                <div className="h-4 bg-gray-200 rounded hidden lg:block"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/organisms/Header";
import Sidebar from "@/components/organisms/Sidebar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
<div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64 transition-all duration-300">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-layout-content">
          <Outlet />
        </main>
      </div>
</div>
  );
};

export default Layout;
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import Dashboard from "@/components/pages/Dashboard";
import Models from "@/components/pages/Models";
import Blacklist from "@/components/pages/Blacklist";
import Settings from "@/components/pages/Settings";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="models" element={<Models />} />
            <Route path="blacklist" element={<Blacklist />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        
<ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="z-toast"
        />
      </div>
    </Router>
  );
}

export default App;
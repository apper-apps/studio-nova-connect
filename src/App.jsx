import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";
import Dashboard from "@/components/pages/Dashboard";
import Galleries from "@/components/pages/Galleries";
import GalleryView from "@/components/pages/GalleryView";
import Products from "@/components/pages/Products";
import CurrentSession from "@/components/pages/CurrentSession";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <div className="flex h-screen">
          {/* Sidebar */}
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col lg:ml-64">
            <Header
              onMenuClick={() => setSidebarOpen(true)}
            />
            
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/galleries" element={<Galleries />} />
                <Route path="/gallery/:id" element={<GalleryView />} />
                <Route path="/products" element={<Products />} />
                <Route path="/session" element={<CurrentSession />} />
              </Routes>
            </main>
          </div>
        </div>

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
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
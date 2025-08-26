import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";
import Dashboard from "@/components/pages/Dashboard";
import Galleries from "@/components/pages/Galleries";
import GalleryView from "@/components/pages/GalleryView";
import Products from "@/components/pages/Products";
import CurrentSession from "@/components/pages/CurrentSession";
import Login from "@/components/pages/Login";
import Register from "@/components/pages/Register";
import Subscription from "@/components/pages/Subscription";
import Settings from "@/components/pages/Settings";
import { authService } from "@/services/authService";
import Loading from "@/components/ui/Loading";
const ProtectedRoute = ({ children }) => {
  const { user, subscription } = authService.useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!subscription?.active) {
    return <Navigate to="/subscription" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, subscription } = authService.useAuth();
  
  if (user && subscription?.active) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, subscription } = authService.useAuth();

  useEffect(() => {
    authService.initialize();
  }, []);

  if (loading) {
    return <Loading />;
  }

  // Show auth layout for non-authenticated users
  if (!user) {
    return (
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
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
          />
        </div>
      </BrowserRouter>
    );
  }

  // Show subscription page for users without active subscription
  if (!subscription?.active) {
    return (
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/subscription" element={<Subscription />} />
            <Route path="*" element={<Navigate to="/subscription" replace />} />
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
          />
        </div>
      </BrowserRouter>
    );
  }

  // Show main app for authenticated users with active subscription
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
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/galleries" element={
                  <ProtectedRoute>
                    <Galleries />
                  </ProtectedRoute>
                } />
                <Route path="/gallery/:id" element={
                  <ProtectedRoute>
                    <GalleryView />
                  </ProtectedRoute>
                } />
                <Route path="/products" element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                } />
                <Route path="/session" element={
                  <ProtectedRoute>
                    <CurrentSession />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
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
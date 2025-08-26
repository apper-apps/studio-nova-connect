import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Galleries", href: "/galleries", icon: "Images" },
    { name: "Products", href: "/products", icon: "Package" },
    { name: "Current Session", href: "/session", icon: "Play" }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center px-6 py-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center">
            <ApperIcon name="Camera" size={20} className="text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-primary">IPS Studio</h1>
            <p className="text-xs text-gray-600">Photo Sales Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => onClose && onClose()}
              className={({ isActive: linkActive }) => cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                linkActive || isActive
                  ? "bg-accent text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 hover:text-primary"
              )}
            >
              <ApperIcon
                name={item.icon}
                size={20}
                className={cn(
                  "mr-3 transition-colors duration-200",
                  isActive ? "text-white" : "text-gray-500 group-hover:text-primary"
                )}
              />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Professional Photography<br />Sales Management
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white border-r border-gray-200 z-40">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        isOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: isOpen ? "0%" : "-100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl"
        >
          <div className="absolute right-4 top-4">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ApperIcon name="X" size={20} className="text-gray-600" />
            </button>
          </div>
          <SidebarContent />
        </motion.div>
      </div>
    </>
  );
};

export default Sidebar;
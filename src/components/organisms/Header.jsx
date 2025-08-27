import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";
import { useAuth } from "@/services/authService";
import { useContext } from 'react';
import { AuthContext } from '@/App';

const Header = ({ title, onMenuClick, actions, className, ipsMode, onModeChange }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, subscription } = useAuth();
  const authMethods = useContext(AuthContext);

  const modes = [
    { id: 'gallery', label: 'Gallery', icon: 'Images' },
    { id: 'compare', label: 'Compare', icon: 'Eye' },
    { id: 'slideshow', label: 'Slideshow', icon: 'Play' }
  ];
  const handleLogout = () => {
    authMethods.logout();
    setShowUserMenu(false);
  };

return (
    <header className={cn(
      "bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between",
      className
    )}>
      <div className="flex items-center">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden mr-3"
          onClick={onMenuClick}
        >
          <ApperIcon name="Menu" size={24} />
        </Button>
        
        <div>
          <h1 className="text-xl font-bold text-primary">{title}</h1>
        </div>
      </div>
      
      {/* IPS Mode Switcher - only show in gallery view */}
      {ipsMode && onModeChange && (
        <div className="flex items-center bg-surface-50 rounded-lg p-1 border">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                ipsMode === mode.id
                  ? "bg-white text-accent shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              )}
            >
              <ApperIcon name={mode.icon} size={16} />
              <span className="hidden sm:inline">{mode.label}</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4">
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
        
        {/* User Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-medium">
              {user?.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </div>
            <ApperIcon name="ChevronDown" size={16} />
          </Button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-primary">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    subscription?.active ? "bg-success" : "bg-warning"
                  )} />
                  <span className="text-xs text-gray-600">
                    {subscription?.active ? "Active Subscription" : "Subscription Required"}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  navigate("/settings");
                  setShowUserMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <ApperIcon name="Settings" size={16} />
                Account & Billing
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <ApperIcon name="LogOut" size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
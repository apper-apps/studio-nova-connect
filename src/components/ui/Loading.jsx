import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const Loading = ({ type = "default", className }) => {
  if (type === "gallery") {
    return (
<div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4", className)}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={`gallery-skeleton-${i}`} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer relative">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "cards") {
    return (
<div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`card-skeleton-${i}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full"
      />
    </div>
  );
};

export default Loading;
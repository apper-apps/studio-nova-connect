import { useEffect, useCallback } from "react";

const useKeyPress = (targetKey, handler, isActive = true) => {
  const handleKeyPress = useCallback((event) => {
    if (!isActive) return;
    
    if (event.key === targetKey) {
      handler(event);
    }
  }, [targetKey, handler, isActive]);

  useEffect(() => {
    if (isActive) {
      window.addEventListener("keydown", handleKeyPress);
    }
    
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress, isActive]);
};

export default useKeyPress;
import { useEffect, useCallback } from "react";

const useKeyPress = (targetKey, handler, isActive = true, options = {}) => {
  const { 
    shift = false, 
    ctrl = false, 
    alt = false,
    allowMultipleKeys = false 
  } = options;

  const handleKeyPress = useCallback((event) => {
    if (!isActive) return;
    
    // Check modifier keys
    const shiftMatch = shift ? event.shiftKey : !event.shiftKey || !shift;
    const ctrlMatch = ctrl ? event.ctrlKey : !event.ctrlKey || !ctrl;
    const altMatch = alt ? event.altKey : !event.altKey || !alt;
    
    // Handle multiple target keys
    const keys = Array.isArray(targetKey) ? targetKey : [targetKey];
    const keyMatch = keys.includes(event.key);
    
    if (keyMatch && shiftMatch && ctrlMatch && altMatch) {
      handler(event);
    }
  }, [targetKey, handler, isActive, shift, ctrl, alt]);

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
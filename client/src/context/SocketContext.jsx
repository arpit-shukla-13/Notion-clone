// --- English Comments Only ---
import React, { createContext, useContext } from 'react';

// 1. Create the context
// This will hold the socket instance (or null)
export const SocketContext = createContext(null);

// 2. Create a custom hook
// This makes it easy for other components (like a NotificationBell)
// to get the socket instance without complex prop drilling.
export const useSocket = () => {
  return useContext(SocketContext);
};
import React, { createContext, useContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext) || {}; // Add fallback empty object
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) { // Only connect if user exists
      socketRef.current = io('http://localhost:3000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user]);

  return (
    <WebSocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </WebSocketContext.Provider>
  );
};

import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      
      const newSocket = io('http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('WebSocket connected');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setConnected(false);
      });

      newSocket.on('user_online', (data) => {
        toast.info(`${data.userName} is online`, { autoClose: 2000 });
      });

      newSocket.on('task_updated', (data) => {
        toast.info(`Task updated by ${data.updatedBy}`, { autoClose: 2000 });
      });

      newSocket.on('deal_stage_changed', (data) => {
        toast.info(`Deal moved by ${data.changedBy}`, { autoClose: 2000 });
      });

      newSocket.on('contact_created', (data) => {
        toast.success(`New contact added by ${data.createdBy}`, { autoClose: 2000 });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const value = {
    socket,
    connected,
    emit
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

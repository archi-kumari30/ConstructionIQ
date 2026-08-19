import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [toasts, setToasts] = useState([]);
  const activeRooms = useRef(new Set());

  // Show floating toast alert helper
  const addToast = (title, message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto-remove toast after 6 seconds (except critical incidents which should remain)
    if (type !== 'danger' && type !== 'error') {
      setTimeout(() => {
        removeToast(id);
      }, 6000);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Socket connection manager
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      activeRooms.current.clear();
      return;
    }

    // In production, Vite reverse proxies /socket.io to backend port 5000.
    // In standalone or test setups, we connect to the current host origin.
    const newSocket = io({
      autoConnect: true,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO connection established:', newSocket.id);
      
      // Rejoin any active rooms if reconnected
      activeRooms.current.forEach((projectId) => {
        newSocket.emit('join_project', projectId);
      });
    });

    // Realtime listeners
    newSocket.on('low_stock_alert', (data) => {
      addToast(
        'Low Stock Warning',
        data.message || `Material stock level has fallen below threshold.`,
        'warning'
      );
    });

    newSocket.on('critical_safety_incident', (data) => {
      addToast(
        'CRITICAL SAFETY INCIDENT',
        data.message || `A critical safety incident has been reported: "${data.title}"`,
        'danger'
      );
    });

    newSocket.on('report_compiled', (data) => {
      addToast(
        'Daily Report Compiled',
        data.message || 'The operations daily site report PDF has been generated.',
        'success'
      );
      
      // Dispatch standard DOM event so active views can automatically reload lists
      window.dispatchEvent(new CustomEvent('report-compiled', { detail: data }));
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket.IO connection disconnected:', reason);
    });

    setSocket(newSocket);

    const handleLogout = () => {
      newSocket.disconnect();
      setSocket(null);
      activeRooms.current.clear();
    };

    window.addEventListener('auth-logout', handleLogout);

    return () => {
      newSocket.disconnect();
      window.removeEventListener('auth-logout', handleLogout);
    };
  }, [user]);

  const joinProjectRoom = (projectId) => {
    if (!projectId) return;
    activeRooms.current.add(projectId);
    if (socket && socket.connected) {
      socket.emit('join_project', projectId);
      console.log(`Requested to join socket project room: ${projectId}`);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinProjectRoom, toasts, addToast, removeToast }}>
      {children}
      {/* Toast Alert overlay component */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-content">
              <div className="toast-title">
                {toast.type === 'danger' && '⚠️ '}
                {toast.type === 'warning' && '⚡ '}
                {toast.type === 'success' && '✅ '}
                {toast.title}
              </div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

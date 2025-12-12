import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Device, ContentItem, Notice, DeviceType } from '../types';
import { MOCK_DEVICES, MOCK_CONTENT, MOCK_NOTICES } from '../constants';

interface SignageContextType extends AppState {
  login: (pass: string) => boolean;
  logout: () => void;
  addContent: (content: ContentItem) => void;
  removeContent: (id: string) => void;
  addNotice: (notice: Notice) => void;
  toggleNotice: (id: string) => void;
  deleteNotice: (id: string) => void;
  updateDeviceStatus: (id: string, status: 'ONLINE' | 'OFFLINE') => void;
  updateDeviceGroup: (id: string, type: DeviceType) => void;
  updateDevicePlayback: (id: string, contentId: string | null) => void;
}

const SignageContext = createContext<SignageContextType | undefined>(undefined);

export const SignageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or fall back to MOCK
  const [user, setUser] = useState<{ isAuthenticated: boolean; name: string } | null>(() => {
    const s = localStorage.getItem('campuscast_user');
    return s ? JSON.parse(s) : null;
  });

  const [devices, setDevicesState] = useState<Device[]>(() => {
    const s = localStorage.getItem('campuscast_devices');
    return s ? JSON.parse(s) : MOCK_DEVICES;
  });

  const [contentPlaylist, setContentPlaylistState] = useState<ContentItem[]>(() => {
    const s = localStorage.getItem('campuscast_content');
    return s ? JSON.parse(s) : MOCK_CONTENT;
  });

  const [notices, setNoticesState] = useState<Notice[]>(() => {
    const s = localStorage.getItem('campuscast_notices');
    return s ? JSON.parse(s) : MOCK_NOTICES;
  });

  // Helpers to save to LS
  const setDevices = (val: Device[] | ((prev: Device[]) => Device[])) => {
    setDevicesState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('campuscast_devices', JSON.stringify(next));
      return next;
    });
  };

  const setContentPlaylist = (val: ContentItem[] | ((prev: ContentItem[]) => ContentItem[])) => {
    setContentPlaylistState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('campuscast_content', JSON.stringify(next));
      return next;
    });
  };

  const setNotices = (val: Notice[] | ((prev: Notice[]) => Notice[])) => {
    setNoticesState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('campuscast_notices', JSON.stringify(next));
      return next;
    });
  };

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'campuscast_devices' && e.newValue) setDevicesState(JSON.parse(e.newValue));
      if (e.key === 'campuscast_content' && e.newValue) setContentPlaylistState(JSON.parse(e.newValue));
      if (e.key === 'campuscast_notices' && e.newValue) setNoticesState(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = (pass: string) => {
    if (pass === 'admin123') {
      const u = { isAuthenticated: true, name: 'Campus Admin' };
      setUser(u);
      localStorage.setItem('campuscast_user', JSON.stringify(u));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campuscast_user');
  };

  const addContent = (content: ContentItem) => {
    setContentPlaylist(prev => [content, ...prev]);
  };

  const removeContent = (id: string) => {
    setContentPlaylist(prev => prev.filter(c => c.id !== id));
  };

  const addNotice = (notice: Notice) => {
    setNotices(prev => [notice, ...prev]);
  };

  const toggleNotice = (id: string) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, isActive: !n.isActive } : n));
  };

  const deleteNotice = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
  };

  const updateDeviceStatus = (id: string, status: 'ONLINE' | 'OFFLINE') => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, status, lastPing: Date.now() } : d));
  };

  const updateDeviceGroup = (id: string, type: DeviceType) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, type } : d));
  };

  const updateDevicePlayback = (id: string, contentId: string | null) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, currentContentId: contentId } : d));
  };

  return (
    <SignageContext.Provider value={{
      user, devices, contentPlaylist, notices,
      login, logout, addContent, removeContent,
      addNotice, toggleNotice, deleteNotice,
      updateDeviceStatus, updateDeviceGroup, updateDevicePlayback
    }}>
      {children}
    </SignageContext.Provider>
  );
};

export const useSignage = () => {
  const context = useContext(SignageContext);
  if (!context) throw new Error('useSignage must be used within a SignageProvider');
  return context;
};
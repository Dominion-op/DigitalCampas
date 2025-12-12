import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSignage } from '../../context/SignageContext';
import { DeviceType, ContentItem, ContentType, Priority } from '../../types';
import { AlertTriangle, Clock, Calendar, Volume2 } from 'lucide-react';

const TVPlayer: React.FC<{ deviceId?: string }> = ({ deviceId: propId }) => {
  // If no ID passed via props, try to get from URL hash (rough implementation since we use HashRouter)
  const getUrlId = () => {
    const hash = window.location.hash;
    const parts = hash.split('/tv/');
    return parts.length > 1 ? parts[1] : null;
  };
  
  const deviceId = propId || getUrlId();
  const { devices, contentPlaylist, notices, updateDeviceStatus, updateDevicePlayback } = useSignage();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [contentIndex, setContentIndex] = useState(0);

  // Find this device
  const device = devices.find(d => d.id === deviceId);
  
  // Heartbeat
  useEffect(() => {
    if (device) {
      updateDeviceStatus(device.id, 'ONLINE');
      const interval = setInterval(() => {
        setCurrentTime(new Date());
        // Simple keep-alive update every minute
        updateDeviceStatus(device.id, 'ONLINE');
      }, 60000); // 1 minute
      return () => clearInterval(interval);
    }
  }, [deviceId]); // Only re-run if device ID changes

  // Filter content based on Device rules
  const relevantContent = useMemo(() => {
    if (!device) return [];
    
    return contentPlaylist.filter(content => {
      // 1. Device Targeting
      if (content.targetDeviceIds.length > 0 && !content.targetDeviceIds.includes(device.id)) return false;
      if (content.targetGroups.length > 0 && !content.targetGroups.includes(device.type)) return false;

      // 2. Logic for Classrooms (Only Urgent or Explicitly Targeted)
      if (device.type === DeviceType.CLASSROOM) {
        if (content.priority === Priority.URGENT) return true;
        // If it's targeted specifically to this classroom, show it
        if (content.targetDeviceIds.includes(device.id)) return true;
        return false;
      }
      
      return true;
    });
  }, [device, contentPlaylist]);

  const currentContent = relevantContent.length > 0 ? relevantContent[contentIndex % relevantContent.length] : null;

  // Report Playback Status
  useEffect(() => {
    if (device && currentContent) {
      updateDevicePlayback(device.id, currentContent.id);
    } else if (device) {
      updateDevicePlayback(device.id, null);
    }
  }, [device?.id, currentContent?.id]);

  // Content Rotation
  useEffect(() => {
    if (relevantContent.length === 0) return;
    
    // Ensure index is valid
    const safeIndex = contentIndex % relevantContent.length;
    const currentItem = relevantContent[safeIndex];
    const duration = (currentItem?.durationSeconds || 10) * 1000;
    
    const timer = setTimeout(() => {
      setContentIndex(prev => (prev + 1) % relevantContent.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [contentIndex, relevantContent]);

  // Ticker Logic
  const activeNotices = notices.filter(n => n.isActive && (device?.type !== DeviceType.CLASSROOM || n.isUrgent));
  const urgentNotices = activeNotices.filter(n => n.isUrgent);
  const normalNotices = activeNotices.filter(n => !n.isUrgent);

  if (!device) {
    return (
      <div className="h-screen w-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Device Not Configured</h1>
          <p className="text-gray-400">ID: {deviceId}</p>
        </div>
      </div>
    );
  }

  // Render Logic for Main Area
  const renderMainContent = () => {
    if (!currentContent) {
      // Idle Screen
      return (
        <div className="flex-1 bg-gradient-to-br from-slate-900 to-blue-900 flex flex-col items-center justify-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="z-10 text-center">
            <img src="https://picsum.photos/id/4/200/200" alt="College Logo" className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white/20 shadow-2xl" />
            <h1 className="text-6xl font-bold tracking-tight mb-2">City College</h1>
            <p className="text-2xl text-blue-200 uppercase tracking-widest">{device.location}</p>
          </div>
          
          <div className="absolute top-10 right-10 flex flex-col items-end">
             <div className="text-6xl font-thin font-mono">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </div>
             <div className="text-xl text-blue-200">
                {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
             </div>
          </div>
        </div>
      );
    }

    // Media Content
    return (
      <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
        {currentContent.type === ContentType.IMAGE && (
          <img src={currentContent.data} alt={currentContent.title} className="w-full h-full object-cover" />
        )}
        
        {currentContent.type === ContentType.VIDEO && (
          // In real app, manage autoplay policies
          <video src={currentContent.data} autoPlay muted loop className="w-full h-full object-cover" />
        )}

        {currentContent.type === ContentType.TEXT && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-800 to-indigo-900 p-20">
            <div className="text-center">
               <h2 className="text-5xl font-bold text-blue-200 mb-8 uppercase tracking-widest">{currentContent.title}</h2>
               <p className="text-6xl font-medium text-white leading-tight">{currentContent.data}</p>
            </div>
          </div>
        )}

        {currentContent.type === ContentType.BIRTHDAY && (
           <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-600 p-20 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/confetti-doodles.png')]"></div>
              <div className="text-center z-10 animate-bounce">
                <span className="text-8xl">🎂</span>
                <h2 className="text-6xl font-bold text-white mt-8 mb-4">Happy Birthday!</h2>
                <p className="text-5xl text-white font-serif italic">{currentContent.data}</p>
              </div>
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden font-sans">
      
      {/* 1. Main Display Area */}
      {renderMainContent()}

      {/* 2. Urgent Overlay (If applicable) */}
      {urgentNotices.length > 0 && (
         <div className="bg-red-600 text-white flex items-center px-6 py-3 shadow-lg z-50">
            <div className="flex items-center gap-2 font-bold animate-pulse mr-6 whitespace-nowrap">
              <AlertTriangle size={24} fill="white" className="text-red-600"/> URGENT
            </div>
            <div className="overflow-hidden w-full relative">
                 <div className="whitespace-nowrap animate-marquee inline-block font-bold text-xl">
                   {urgentNotices.map((n, i) => (
                     <span key={i} className="mx-8">{n.text}</span>
                   ))}
                 </div>
            </div>
         </div>
      )}

      {/* 3. Standard Ticker (Only for Common Areas or Office, hidden for classrooms usually unless urgent was mixed in, but logic handled above) */}
      {device.type !== DeviceType.CLASSROOM && activeNotices.length > 0 && urgentNotices.length === 0 && (
        <div className="bg-slate-900 text-white h-16 flex items-center border-t-4 border-blue-500 z-40">
           <div className="bg-blue-600 h-full flex items-center justify-center px-6 font-bold text-sm tracking-wider uppercase z-10 shadow-xl">
              Latest Notices
           </div>
           <div className="flex-1 overflow-hidden relative h-full flex items-center">
              <div className="whitespace-nowrap animate-marquee text-lg">
                  {normalNotices.map((n, i) => (
                     <span key={i} className="inline-flex items-center mx-12">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                        {n.text}
                     </span>
                  ))}
              </div>
           </div>
           <div className="bg-slate-800 h-full flex items-center px-6 gap-4 text-slate-300 text-sm font-mono z-10 border-l border-slate-700">
               <span className="flex items-center gap-2"><Clock size={14}/> {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
               <span className="hidden md:flex items-center gap-2"><Calendar size={14}/> {currentTime.toLocaleDateString()}</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default TVPlayer;
import React, { useState } from 'react';
import { useSignage } from '../../context/SignageContext';
import { DeviceType, ContentType, Priority } from '../../types';
import { generateNoticeContent, refineContent } from '../../services/geminiService';
import { 
  LayoutDashboard, Tv, FileText, Plus, Trash2, LogOut, 
  MonitorPlay, Bell, Calendar, Sparkles, Check, X, Edit,
  Users, Building, School, PlayCircle, Menu
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { 
    user, logout, devices, contentPlaylist, notices, 
    addContent, removeContent, addNotice, toggleNotice, deleteNotice, updateDeviceGroup 
  } = useSignage();
  
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DEVICES' | 'CONTENT' | 'NOTICES'>('OVERVIEW');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Forms State
  const [newNoticeText, setNewNoticeText] = useState('');
  const [newNoticeUrgent, setNewNoticeUrgent] = useState(false);
  const [geminiPrompt, setGeminiPrompt] = useState('');

  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentData, setNewContentData] = useState('');
  const [newContentType, setNewContentType] = useState<ContentType>(ContentType.TEXT);
  const [newContentPriority, setNewContentPriority] = useState<Priority>(Priority.NORMAL);

  const handleAiGenerateNotice = async () => {
    if (!geminiPrompt) return;
    setIsGeminiLoading(true);
    const generated = await generateNoticeContent(geminiPrompt, newNoticeUrgent ? 'urgent' : 'formal');
    setNewNoticeText(generated);
    setIsGeminiLoading(false);
  };

  const handleAiRefineContent = async () => {
     if(!newContentData || newContentType !== ContentType.TEXT) return;
     setIsGeminiLoading(true);
     const refined = await refineContent(newContentData);
     setNewContentData(refined);
     setIsGeminiLoading(false);
  }

  const handleAddNotice = () => {
    if (!newNoticeText) return;
    addNotice({
      id: Date.now().toString(),
      text: newNoticeText,
      isActive: true,
      isUrgent: newNoticeUrgent
    });
    setNewNoticeText('');
    setGeminiPrompt('');
  };

  const handleAddContent = () => {
    if (!newContentTitle || !newContentData) return;
    addContent({
      id: Date.now().toString(),
      type: newContentType,
      title: newContentTitle,
      data: newContentData,
      priority: newContentPriority,
      durationSeconds: 10,
      targetDeviceIds: [],
      targetGroups: [],
      createdAt: Date.now()
    });
    setNewContentTitle('');
    setNewContentData('');
  };

  const getContentTitle = (id?: string | null) => {
    if (!id) return null;
    const item = contentPlaylist.find(c => c.id === id);
    return item ? item.title : 'Unknown Content';
  };

  const handleNavClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MonitorPlay className="text-blue-400" />
              CampusCast
            </h1>
            <p className="text-xs text-slate-400 mt-1">Admin Panel</p>
          </div>
          {/* Mobile Close Button */}
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => handleNavClick('OVERVIEW')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'OVERVIEW' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} /> Overview
          </button>
          <button 
            onClick={() => handleNavClick('DEVICES')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'DEVICES' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <Tv size={20} /> Devices
          </button>
          <button 
            onClick={() => handleNavClick('CONTENT')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'CONTENT' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <FileText size={20} /> Playlist Content
          </button>
          <button 
            onClick={() => handleNavClick('NOTICES')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'NOTICES' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <Bell size={20} /> Ticker Notices
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="text-sm">
              <p className="font-medium">{user?.name}</p>
              <p className="text-slate-400 text-xs">Administrator</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-300">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3 md:hidden shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg active:bg-gray-200"
            >
                <Menu size={24} />
            </button>
            <h1 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <MonitorPlay className="text-blue-600" size={20} /> CampusCast
            </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">System Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">Total Devices</p>
                      <h3 className="text-3xl font-bold text-gray-800 mt-1">{devices.length}</h3>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Tv size={24} /></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">Active Notices</p>
                      <h3 className="text-3xl font-bold text-gray-800 mt-1">{notices.filter(n => n.isActive).length}</h3>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><Bell size={24} /></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">Urgent Alerts</p>
                      <h3 className="text-3xl font-bold text-red-600 mt-1">{notices.filter(n => n.isActive && n.isUrgent).length}</h3>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg text-red-600"><Sparkles size={24} /></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">Active Content</p>
                      <h3 className="text-3xl font-bold text-green-600 mt-1">{contentPlaylist.length}</h3>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg text-green-600"><FileText size={24} /></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden">
                <h3 className="text-lg font-bold mb-4">Device Status</h3>
                <div className="overflow-x-auto -mx-6 px-6 pb-2">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-sm text-gray-500">
                        <th className="py-3 px-2">Device Name</th>
                        <th className="py-3 px-2">Location</th>
                        <th className="py-3 px-2">Group</th>
                        <th className="py-3 px-2">Now Playing</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-right">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devices.map(device => {
                        const playingTitle = getContentTitle(device.currentContentId);
                        return (
                          <tr key={device.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-3 px-2 font-medium">{device.name}</td>
                            <td className="py-3 px-2 text-gray-600">{device.location}</td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                ${device.type === DeviceType.CLASSROOM ? 'bg-indigo-100 text-indigo-700' : 
                                  device.type === DeviceType.COMMON_AREA ? 'bg-emerald-100 text-emerald-700' : 
                                  'bg-orange-100 text-orange-700'}`}>
                                {device.type.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                               {playingTitle ? (
                                 <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded max-w-[150px] truncate">
                                    <PlayCircle size={12} className="animate-pulse shrink-0" />
                                    <span className="truncate">{playingTitle}</span>
                                 </div>
                               ) : (
                                 <span className="text-xs text-gray-400 italic">Idle / Logo</span>
                               )}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${device.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm text-gray-600">{device.status}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <a href={`#/tv/${device.id}`} target="_blank" className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap">Open &rarr;</a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* DEVICES TAB */}
          {activeTab === 'DEVICES' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Device Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map(device => (
                  <div key={device.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                           {device.type === DeviceType.CLASSROOM ? <School size={20}/> : 
                            device.type === DeviceType.OFFICE ? <Building size={20}/> : 
                            <Users size={20}/>}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{device.name}</h3>
                          <p className="text-xs text-gray-500">{device.id}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${device.status === 'ONLINE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {device.status}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                        <p className="text-sm text-gray-800">{device.location}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Group Type</label>
                        <select 
                          value={device.type}
                          onChange={(e) => updateDeviceGroup(device.id, e.target.value as DeviceType)}
                          className="w-full text-sm border-gray-300 rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none border"
                        >
                          <option value={DeviceType.CLASSROOM}>Classroom</option>
                          <option value={DeviceType.COMMON_AREA}>Common Area</option>
                          <option value={DeviceType.OFFICE}>Office</option>
                        </select>
                      </div>
                      
                      {/* Live Playback Indicator in Card */}
                      <div className="bg-gray-50 rounded p-3 text-xs border border-gray-100">
                         <span className="block text-gray-400 mb-1 uppercase text-[10px] font-bold">Live Status</span>
                         {device.currentContentId ? (
                             <div className="flex items-center gap-2 text-blue-700 font-medium">
                                <PlayCircle size={14} className="animate-pulse" />
                                <span className="truncate">{getContentTitle(device.currentContentId)}</span>
                             </div>
                         ) : (
                             <span className="text-gray-500 italic">Displaying Default Logo</span>
                         )}
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex justify-end">
                         <a href={`#/tv/${device.id}`} target="_blank" className="text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100">
                           Monitor Output
                         </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONTENT TAB */}
          {activeTab === 'CONTENT' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800">Content Playlist</h2>
              
              {/* Content Creator */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Plus size={20} className="text-blue-600"/> Add New Content
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g., Welcome Week Video"
                      value={newContentTitle}
                      onChange={(e) => setNewContentTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newContentType}
                      onChange={(e) => setNewContentType(e.target.value as ContentType)}
                    >
                      <option value={ContentType.TEXT}>Text Announcement</option>
                      <option value={ContentType.IMAGE}>Image URL</option>
                      <option value={ContentType.VIDEO}>Video URL</option>
                      <option value={ContentType.BIRTHDAY}>Birthday Celebration</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {newContentType === ContentType.TEXT ? 'Message Text' : 'Media URL'}
                  </label>
                  <div className="flex flex-col md:flex-row gap-2">
                      <input 
                      type="text" 
                      className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder={newContentType === ContentType.TEXT ? "Enter message..." : "https://example.com/image.jpg"}
                      value={newContentData}
                      onChange={(e) => setNewContentData(e.target.value)}
                      />
                      {newContentType === ContentType.TEXT && (
                          <button 
                              onClick={handleAiRefineContent}
                              disabled={isGeminiLoading}
                              className="bg-purple-100 text-purple-700 px-4 py-2 md:py-0 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-200"
                          >
                              <Sparkles size={16} /> {isGeminiLoading ? 'Refining...' : 'AI Polish'}
                          </button>
                      )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 rounded"
                      checked={newContentPriority === Priority.URGENT}
                      onChange={(e) => setNewContentPriority(e.target.checked ? Priority.URGENT : Priority.NORMAL)}
                    />
                    <span className="text-sm font-medium text-gray-700">Mark as Urgent (Overrides Classrooms)</span>
                  </label>
                </div>

                <button 
                  onClick={handleAddContent}
                  className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Add to Playlist
                </button>
              </div>

              {/* Playlist */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                      <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                              <th className="p-4 text-sm font-medium text-gray-500">Priority</th>
                              <th className="p-4 text-sm font-medium text-gray-500">Type</th>
                              <th className="p-4 text-sm font-medium text-gray-500">Title</th>
                              <th className="p-4 text-sm font-medium text-gray-500">Content Preview</th>
                              <th className="p-4 text-sm font-medium text-gray-500 text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody>
                          {contentPlaylist.map(item => (
                              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded text-xs font-bold ${item.priority === Priority.URGENT ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                          {item.priority}
                                      </span>
                                  </td>
                                  <td className="p-4">
                                      <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">{item.type}</span>
                                  </td>
                                  <td className="p-4 font-medium">{item.title}</td>
                                  <td className="p-4 text-sm text-gray-600 max-w-xs truncate">
                                      {item.data}
                                  </td>
                                  <td className="p-4 text-right">
                                      <button onClick={() => removeContent(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                                          <Trash2 size={18} />
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* NOTICES TAB */}
          {activeTab === 'NOTICES' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800">Ticker Notices</h2>
              
              {/* Create Notice */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4 items-start mb-4">
                  <div className="flex-1 w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quick Add</label>
                      <input 
                          type="text" 
                          value={newNoticeText}
                          onChange={(e) => setNewNoticeText(e.target.value)}
                          placeholder="Type urgent notice here..."
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                  </div>
                  
                  <div className="w-full md:w-1/3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <label className="block text-xs font-bold text-purple-700 mb-2 flex items-center gap-1">
                          <Sparkles size={14}/> AI Generator
                      </label>
                      <div className="flex gap-2">
                          <input 
                              type="text" 
                              value={geminiPrompt}
                              onChange={(e) => setGeminiPrompt(e.target.value)}
                              placeholder="Topic"
                              className="flex-1 text-sm border-purple-200 rounded px-2 py-1 focus:outline-purple-500 min-w-0"
                          />
                          <button 
                              onClick={handleAiGenerateNotice} 
                              disabled={isGeminiLoading || !geminiPrompt}
                              className="bg-purple-600 text-white text-xs px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50 whitespace-nowrap"
                          >
                              {isGeminiLoading ? '...' : 'Generate'}
                          </button>
                      </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-red-600 rounded"
                      checked={newNoticeUrgent}
                      onChange={(e) => setNewNoticeUrgent(e.target.checked)}
                    />
                    <span className="text-sm font-medium text-gray-700">Urgent (Scrolls on ALL screens)</span>
                  </label>
                  <button 
                    onClick={handleAddNotice}
                    className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Add Notice
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="space-y-3">
                {notices.map(notice => (
                  <div key={notice.id} className={`flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border-l-4 ${notice.isUrgent ? 'border-l-red-500' : 'border-l-blue-500'}`}>
                     <div className="flex-1 min-w-0 mr-2">
                       <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {notice.isUrgent && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded">URGENT</span>}
                          <p className={`text-lg break-words ${notice.isActive ? 'text-gray-800' : 'text-gray-400 line-through'}`}>{notice.text}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-2 shrink-0">
                       <button 
                          onClick={() => toggleNotice(notice.id)}
                          className={`p-2 rounded-full ${notice.isActive ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}`}
                          title={notice.isActive ? "Deactivate" : "Activate"}
                       >
                         {notice.isActive ? <Check size={20} /> : <X size={20} />}
                       </button>
                       <button 
                          onClick={() => deleteNotice(notice.id)}
                          className="p-2 rounded-full text-red-500 bg-red-50 hover:bg-red-100"
                          title="Delete"
                       >
                         <Trash2 size={20} />
                       </button>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
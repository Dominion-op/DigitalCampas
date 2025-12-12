import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignageProvider, useSignage } from './context/SignageContext';
import AdminDashboard from './components/admin/AdminDashboard';
import TVPlayer from './components/player/TVPlayer';
import { Lock } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const { login, user } = useSignage();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (user?.isAuthenticated) {
    return <Navigate to="/admin" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(password)) {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-100 rounded-full text-blue-600">
            <Lock size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Admin Access</h2>
        <p className="text-center text-gray-500 mb-8">Enter your authorized credential key.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Enter Access Key"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">Invalid access key.</p>}
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Authenticate
          </button>
        </form>
        <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">Restricted System • Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
};

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSignage();
  if (!user?.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/admin" element={
        <ProtectedAdminRoute>
          <AdminDashboard />
        </ProtectedAdminRoute>
      } />
      <Route path="/tv/:id" element={<TVPlayer />} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <SignageProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </SignageProvider>
  );
};

export default App;

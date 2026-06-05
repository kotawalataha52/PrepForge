import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InterviewRoom from './pages/InterviewRoom';
import ResumeIntel from './pages/ResumeIntel';

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
        <Router>
          <Routes>
            {/* Public Routes with standard Navbar */}
            <Route path="/" element={<Navigate to="/register" replace />} />
            <Route path="/login" element={<div className="min-h-screen bg-[var(--color-background-dark)] text-white overflow-hidden flex flex-col"><Navbar /><main className="flex-grow"><Login /></main></div>} />
            <Route path="/register" element={<div className="min-h-screen bg-[var(--color-background-dark)] text-white overflow-hidden flex flex-col"><Navbar /><main className="flex-grow"><Register /></main></div>} />
            
            {/* Protected Application Routes with Sidebar/AppLayout */}
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/resume-intel" element={<ProtectedRoute><AppLayout><ResumeIntel /></AppLayout></ProtectedRoute>} />


            {/* Immersive Protected Route without standard layout */}
            <Route path="/interview/:id" element={
              <ProtectedRoute>
                <InterviewRoom />
              </ProtectedRoute>
            } />
            
          </Routes>
        </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

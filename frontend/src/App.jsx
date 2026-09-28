import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Navbar from './components/layout/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeTailor from './pages/ResumeTailor';
import ResumeIntel from './pages/ResumeIntel';
import InterviewRoom from './pages/InterviewRoom';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              {/* Default root starts at Login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Auth Routes */}
              <Route
                path="/login"
                element={
                  <div className="min-h-screen bg-[#F4F7FC] text-slate-800 flex flex-col">
                    <Navbar />
                    <main className="flex-grow flex items-center justify-center">
                      <Login />
                    </main>
                  </div>
                }
              />
              <Route
                path="/register"
                element={
                  <div className="min-h-screen bg-[#F4F7FC] text-slate-800 flex flex-col">
                    <Navbar />
                    <main className="flex-grow flex items-center justify-center">
                      <Register />
                    </main>
                  </div>
                }
              />

              {/* Protected Application Routes with Sidebar/AppLayout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resume-tailor"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ResumeTailor />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resume-intel"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ResumeIntel />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Immersive Protected Interview Room Route */}
              <Route
                path="/interview/:id"
                element={
                  <ProtectedRoute>
                    <InterviewRoom />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

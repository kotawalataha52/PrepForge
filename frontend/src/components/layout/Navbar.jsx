import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed w-full top-0 z-50 glass border-b border-white/10"
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 relative flex items-center justify-center bg-gray-900 rounded-xl overflow-hidden glass-card">
             <img src="/logo.png" alt="PrepForge Logo" className="w-8 h-8 group-hover:scale-110 transition-transform duration-300 rounded-md" />
          </div>
          <span className="text-2xl font-bold font-display tracking-tight text-white group-hover:text-cyan-400 transition-colors duration-300">
            Prep<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Forge</span>
          </span>
        </Link>
        
        {!isAuthPage && (
          <nav className="hidden md:flex items-center gap-8">
            <a href="/#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="/#how-it-works" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">How it works</a>
            <a href="/#philosophy" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Philosophy</a>
          </nav>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden sm:block text-sm font-medium text-gray-400">Hi, {user.name.split(' ')[0]}</span>
              <Link to="/dashboard" className="text-sm font-medium text-white hover:text-cyan-400 transition-colors">Dashboard</Link>
              <button 
                onClick={handleLogout}
                className="p-2.5 rounded-full bg-white/5 hover:bg-red-500/10 text-gray-300 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all duration-300 ml-2"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Log in</Link>
              <Link 
                to="/register" 
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium text-sm hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-shadow duration-300"
              >
                Start Foraging
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;

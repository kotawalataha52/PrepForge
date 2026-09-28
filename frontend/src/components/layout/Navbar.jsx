import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';
import Logo from '../common/Logo';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.header 
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="fixed w-full top-0 z-50 bg-white/90 border-b border-slate-200/90 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
    >
      <div className="container max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/login" className="flex items-center">
          <Logo size="md" showText={true} darkText={true} />
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:block text-xs font-semibold text-slate-700">Hi, {user.name?.split(' ')[0]}</span>
              <Link to="/dashboard" className="text-xs font-semibold px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition">Dashboard</Link>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {location.pathname !== '/login' && (
                <Link to="/login" className="text-xs font-semibold text-slate-600 hover:text-blue-600 px-3 py-1.5 transition">Log in</Link>
              )}
              {location.pathname !== '/register' && (
                <Link 
                  to="/register" 
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition"
                >
                  Create Account
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;

import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Bell, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-20 w-full glass border-b border-white/5 px-8 flex items-center justify-between z-30 sticky top-0 bg-black/20 backdrop-blur-xl">
      {/* Left spacer to push user actions to the right */}
      <div className="flex-1"></div>

      {/* User Actions */}
      <div className="flex items-center gap-6">


        <div className="flex items-center gap-5">
          <div className="hidden md:flex flex-col items-end justify-center">
            <span className="text-[15px] font-bold text-white leading-tight mb-1">{user?.name}</span>
            <span className="text-xs text-cyan-400 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-bold tracking-wider">Pro Forager</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 p-[2px] cursor-pointer group">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden">
               <span className="font-display font-bold text-white group-hover:scale-110 transition-transform">
                 {user?.name?.charAt(0).toUpperCase() || 'U'}
               </span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="ml-2 p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

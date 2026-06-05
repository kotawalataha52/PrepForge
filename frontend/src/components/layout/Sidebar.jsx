import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Bot, 
  FileText, 

  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Resume Intel', path: '/resume-intel', icon: <FileText size={20} /> },

  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      className="hidden md:flex flex-col h-screen glass border-r border-white/5 bg-black/40 relative z-40 transition-all duration-300"
    >
      {/* Brand */}
      <div className="h-20 flex items-center px-5 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 w-full overflow-hidden">
          <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-gray-900 rounded-xl glass-card">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded border border-white/10" />
          </div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xl font-bold font-display tracking-tight text-white whitespace-nowrap"
            >
              Prep<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Forge</span>
            </motion.span>
          )}
        </Link>
      </div>

      {/* Nav Links */}
      <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,240,255,0.1)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
              title={isCollapsed ? item.name : ''}
            >
              <div className={`${isActive ? 'text-cyan-400' : 'group-hover:text-purple-400'} transition-colors shrink-0`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap">{item.name}</span>
              )}
            </Link>
          );
        })}
      </div>



      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-24 w-7 h-7 bg-gray-900 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-cyan-500 hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all z-50 cursor-pointer"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

    </motion.div>
  );
};

export default Sidebar;

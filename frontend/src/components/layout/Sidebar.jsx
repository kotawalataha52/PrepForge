import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  FileText, 
  FileEdit,
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import Logo from '../common/Logo';

const Sidebar = ({ isCollapsed, setIsCollapsed, sessionCount = 0 }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const menuItems = [
    { 
      name: 'Overview', 
      path: '/dashboard', 
      icon: <Home size={17} />,
      badge: sessionCount > 0 ? `${sessionCount}` : undefined
    }
  ];

  const toolsItems = [
    { 
      name: 'Resume Builder', 
      path: '/resume-tailor', 
      icon: <FileEdit size={17} />
    },
    { 
      name: 'Resume Intel', 
      path: '/resume-intel', 
      icon: <FileText size={17} />
    },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? '76px' : '260px' }}
      className="hidden md:flex flex-col h-screen border-r border-slate-800/80 bg-[#0B1120] text-slate-300 relative z-40 transition-all duration-300 select-none shrink-0"
    >
      {/* Brand Header */}
      <div className="h-16 flex flex-col justify-center px-4 border-b border-slate-800/80">
        <Link to="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <Logo size="sm" showText={!isCollapsed} />
        </Link>
        {!isCollapsed && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400/90 pl-9 -mt-0.5">
            Interview Workspace
          </span>
        )}
      </div>

      {/* User Card */}
      {!isCollapsed && (
        <div className="px-4 py-3.5 mx-3 mt-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden min-w-0">
            <h4 className="text-xs font-semibold text-white truncate leading-tight">
              {user?.name || 'Candidate'}
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              {user?.email || 'candidate@prepforge.io'}
            </p>
          </div>
        </div>
      )}

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        
        {/* Menu Section */}
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu
            </div>
          )}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isSelected = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 group text-xs ${
                    isSelected 
                      ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title={isCollapsed ? item.name : ''}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition-colors shrink-0`}>
                      {item.icon}
                    </div>
                    {!isCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </div>

                  {!isCollapsed && item.badge !== undefined && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tools Section */}
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tools
            </div>
          )}
          <div className="space-y-1">
            {toolsItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 group text-xs ${
                    isActive 
                      ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title={isCollapsed ? item.name : ''}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition-colors shrink-0`}>
                      {item.icon}
                    </div>
                    {!isCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </div>

                  {!isCollapsed && item.tag && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.tagColor}`}>
                      {item.tag}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

      </div>

      {/* Collapse Toggle */}
      <button 
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-14 w-6 h-6 bg-[#0B1120] border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition-all z-50 cursor-pointer shadow-md"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

    </motion.aside>
  );
};

export default Sidebar;

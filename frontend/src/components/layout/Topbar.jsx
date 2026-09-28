import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ onNewInterview }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 w-full bg-white border-b border-slate-200/90 px-6 md:px-8 flex items-center justify-between z-30 sticky top-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Left empty/minimal spacer */}
      <div className="flex items-center gap-2">
      </div>

      {/* User Actions & New Interview CTA */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => {
            if (onNewInterview) {
              onNewInterview();
            } else {
              navigate('/dashboard?action=new');
            }
          }}
          className="px-3.5 py-1.5 md:px-4 md:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/20 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Interview</span>
        </button>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex flex-col items-end justify-center">
            <span className="text-xs font-bold text-slate-800 leading-tight">
              {user?.name || 'Candidate'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Candidate</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <button 
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
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

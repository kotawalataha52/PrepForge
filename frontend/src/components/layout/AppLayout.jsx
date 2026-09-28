import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = ({ children, onNewInterview, sessionCount = 0 }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#F4F7FC] text-slate-800 overflow-hidden">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        sessionCount={sessionCount} 
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Topbar onNewInterview={onNewInterview} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F4F7FC] p-5 md:p-8 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

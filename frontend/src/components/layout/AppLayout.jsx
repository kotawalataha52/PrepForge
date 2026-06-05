import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--color-background-dark)] text-white overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-black/50 p-6 md:p-10 relative">
          {/* Subtle Background Glow behind Dashboard content */}
          <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/5 blur-[150px] rounded-full pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

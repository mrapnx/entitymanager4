
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const menuItems = [
    { id: 'cards' as ViewType, label: 'Karten', icon: 'fa-th-large' },
    { id: 'table' as ViewType, label: 'Tabelle', icon: 'fa-table' },
    { id: 'mindmap' as ViewType, label: 'Mindmap', icon: 'fa-project-diagram' },
    { id: 'settings' as ViewType, label: 'Typen', icon: 'fa-cog' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            D
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Entity Manager</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Version 4.0</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-6 border-t border-slate-800 text-xs text-slate-500">
        &copy; 2024 Entity Manager v4
      </div>
    </aside>
  );
};

export default Sidebar;

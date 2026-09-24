import { useState } from 'react';
import { Bell, X } from 'lucide-react';

export const AlertConfigModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute bottom-6 left-6 p-4 glass-panel rounded-full hover:bg-white/10 transition-colors pointer-events-auto z-10"
      >
        <Bell size={24} />
      </button>
      
      {isOpen && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto">
          <div className="glass-panel w-[500px] p-6 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Bell size={20} /> Alert Configuration
              </h2>
              <button onClick={() => setIsOpen(false)} className="hover:text-gray-300"><X size={20}/></button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Alert Rule 1</label>
                <div className="flex items-center gap-3 bg-panel p-3 rounded-lg border border-white/10">
                  <span className="text-sm">Notify if</span>
                  <select className="bg-background px-2 py-1 rounded text-sm outline-none border border-white/10">
                    <option>Civic Health Score</option>
                    <option>AQI Level</option>
                  </select>
                  <select className="bg-background px-2 py-1 rounded text-sm outline-none border border-white/10">
                    <option>&lt;</option>
                    <option>&gt;</option>
                  </select>
                  <input type="number" defaultValue="60" className="bg-background px-2 py-1 rounded w-16 text-sm outline-none border border-white/10" />
                </div>
              </div>
              
              <button className="bg-accent-blue text-background font-semibold py-2 rounded-lg hover:bg-blue-400 transition-colors mt-2">
                Save Alert Rules
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

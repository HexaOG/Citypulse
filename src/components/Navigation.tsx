import { NavLink } from 'react-router-dom';
import { Home, CloudRain, Car, Wind, AlertTriangle, Sun, Moon } from 'lucide-react';
import { usePulseStore } from '../store/useStore';

export const Navigation = () => {
  const theme = usePulseStore(state => state.theme);
  const toggleTheme = usePulseStore(state => state.toggleTheme);

  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/weather', icon: CloudRain, label: 'Weather' },
    { to: '/traffic', icon: Car, label: 'Traffic' },
    { to: '/air-quality', icon: Wind, label: 'Air Quality' },
    { to: '/complaints', icon: AlertTriangle, label: '311 Complaints' }
  ];

  return (
    <nav className="absolute left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 pointer-events-auto">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 backdrop-blur-md border ${
                isActive
                  ? 'bg-white/20 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                  : 'bg-[#13131a]/70 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`
            }
          >
            <Icon size={24} className="text-white opacity-80 group-hover:opacity-100" />
            <span className="absolute left-full ml-4 px-3 py-1.5 bg-[#13131a]/90 backdrop-blur-md border border-white/10 rounded-lg text-sm whitespace-nowrap opacity-0 -translate-x-4 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
              {link.label}
            </span>
          </NavLink>
        );
      })}

      <div className="w-8 h-[1px] bg-white/10 my-1 mx-auto" />

      {/* Theme Quick Toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle Theme"
        className="group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 backdrop-blur-md border bg-[#13131a]/70 border-white/10 hover:bg-white/10 hover:border-cyan-500/50 cursor-pointer"
      >
        {theme === 'dark' ? (
          <Sun size={22} className="text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon size={22} className="text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
        )}
        <span className="absolute left-full ml-4 px-3 py-1.5 bg-[#13131a]/90 backdrop-blur-md border border-white/10 rounded-lg text-sm whitespace-nowrap opacity-0 -translate-x-4 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </span>
      </button>
    </nav>
  );
};

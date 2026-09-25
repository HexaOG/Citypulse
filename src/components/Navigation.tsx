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
    <nav className="fixed left-4 md:left-6 top-1/2 -tranzinc-y-1/2 z-[950] flex flex-col gap-3 pointer-events-auto">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }: { isActive: boolean }) =>
              `group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 backdrop-blur-xl border ${
                isActive
                  ? 'bg-violet-500/15 border-violet-500/50 text-violet-600 dark:text-violet-400 dark:bg-white/20 dark:border-white/40 shadow-md'
                  : 'bg-white/90 dark:bg-zinc-900/90 border-zinc-200/90 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm'
              }`
            }
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <Icon
                  size={22}
                  className={`transition-colors ${
                    isActive
                      ? 'text-violet-600 dark:text-white'
                      : 'text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white'
                  }`}
                />
                <span className="absolute left-full ml-3 px-3 py-1.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-xl text-xs font-semibold whitespace-nowrap opacity-0 -tranzinc-x-3 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:tranzinc-x-0 shadow-xl">
                  {link.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}

      <div className="w-8 h-[1px] bg-zinc-200 dark:bg-zinc-800 my-1 mx-auto" />

      {/* Theme Quick Toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle Theme"
        className="group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 backdrop-blur-xl border bg-white/90 dark:bg-zinc-900/90 border-zinc-200/90 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm cursor-pointer"
      >
        {theme === 'dark' ? (
          <Sun size={20} className="text-amber-500 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon size={20} className="text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
        )}
        <span className="absolute left-full ml-3 px-3 py-1.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-xl text-xs font-semibold whitespace-nowrap opacity-0 -tranzinc-x-3 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:tranzinc-x-0 shadow-xl">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </span>
      </button>
    </nav>
  );
};

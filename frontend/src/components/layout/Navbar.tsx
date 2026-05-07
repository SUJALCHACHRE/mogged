import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Plus, Clock, User, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/setup', label: 'New Interview', icon: Plus },
  { to: '/history', label: 'History', icon: Clock },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-[rgba(15,13,10,0.96)] border-r border-[var(--border-subtle)] fixed left-0 top-0 z-40 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-[var(--border-subtle)]">
          <div className="w-9 h-9 rounded-full border border-brand-purple/35 bg-[rgba(246,239,227,0.06)] flex items-center justify-center">
            <Zap size={16} className="text-brand-purple-light" />
          </div>
          <span className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--text-primary)]">Mirror Mode</span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[rgba(246,239,227,0.08)] text-[var(--text-primary)] border-l-2 border-brand-purple'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(246,239,227,0.05)]'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-[var(--border-subtle)] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-brand-purple/15 flex items-center justify-center">
              <User size={16} className="text-brand-purple-light" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-brand-coral hover:bg-brand-coral/5 transition-all"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[rgba(15,13,10,0.96)] border-t border-[var(--border-subtle)] px-6 py-2 backdrop-blur-xl">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 text-xs transition-colors ${
                  isActive ? 'text-brand-purple' : 'text-[var(--text-muted)]'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 py-1 text-xs text-[var(--text-muted)]"
          >
            <LogOut size={20} />
            <span>Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}

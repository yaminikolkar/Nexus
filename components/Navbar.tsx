import React from 'react';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNavigate, currentPage }) => {
  // Define role-specific navigation maps
  const getNavItems = () => {
    if (!user) return [];
    
    if (user.role === UserRole.ADMIN) {
      return [
        { id: 'dashboard', label: 'Admin Command' },
        { id: 'campaigns', label: 'Campaign Ops' },
        { id: 'volunteers', label: 'Volunteers' },
        { id: 'transparency', label: 'Impact Data' },
      ];
    }
    
    if (user.role === UserRole.DONOR) {
      return [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'campaigns', label: 'Support Missions' },
        { id: 'transparency', label: 'Live Map' },
      ];
    }
    
    if (user.role === UserRole.VOLUNTEER) {
      return [
        { id: 'dashboard', label: 'Volunteer Hub' },
        { id: 'volunteers', label: 'Discover Missions' },
        { id: 'transparency', label: 'Community Map' },
      ];
    }

    return [];
  };

  const items = getNavItems();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Branding Container */}
        <div 
          className="flex items-center gap-4 cursor-pointer group" 
          onClick={() => onNavigate('home')}
        >
          <div className="relative flex items-center">
            {/* 
              Refined SVG Recreation of the Heart-People logo.
              Increased visual weight to ensure it doesn't look "small".
            */}
            <svg 
              className="h-10 w-auto group-hover:scale-110 transition-transform duration-500 relative z-10"
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Figure 1 - Head (Cyan) */}
              <circle cx="34" cy="24" r="9" fill="#22D3EE"/>
              {/* Figure 2 - Head (Deep Blue) */}
              <circle cx="66" cy="24" r="9" fill="#2563EB"/>
              
              {/* Heart Shape with Gradient */}
              <path 
                d="M50 90C50 90 12 65 12 40C12 30 20 25 30 25C37 25 44 30 50 38C56 30 63 25 70 25C80 25 88 30 88 40C88 65 50 90 50 90Z" 
                fill="url(#logoGradient)"
              />
              
              {/* Overlapping Arm/Shoulder curves to create the "People" effect */}
              <path 
                d="M30 25C22 25 12 30 12 40C12 65 50 90 50 90C50 90 40 75 35 55C32 45 32 35 30 25Z" 
                fill="#06B6D4" 
                opacity="0.8"
              />
              
              <defs>
                <linearGradient id="logoGradient" x1="12" y1="25" x2="88" y2="90" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22D3EE"/>
                  <stop offset="0.6" stopColor="#3B82F6"/>
                  <stop offset="1" stopColor="#1E40AF"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          
          <span className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Nexus
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                currentPage === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-black text-slate-800 uppercase tracking-tighter leading-none">{user.name}</p>
                <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-1">{user.role}</p>
              </div>
              <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full ring-2 ring-indigo-50 shadow-sm" />
              <button 
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Secure Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onNavigate('login')}
              className="bg-indigo-600 text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-100 active:scale-95"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
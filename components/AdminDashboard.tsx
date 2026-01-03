
import React, { useMemo, useState, PropsWithChildren } from 'react';
import { User, UserRole, Campaign, Donation, Event } from '../types';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

const AdminStatCard = ({ title, value, subtext, color }: { title: string; value: string; subtext: string; color: string }) => {
  const colorMap: any = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100'
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{title}</p>
      <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">{value}</h2>
      <div className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${colorMap[color]}`}>
        {subtext}
      </div>
    </div>
  );
};

const AdminModal: React.FC<PropsWithChildren<{ title: string; onClose: () => void }>> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-y-auto">
    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl my-auto overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="p-10">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC<{
  user: User;
  donations: Donation[];
  campaigns: Campaign[];
  events: Event[];
  users: User[];
  onAddCampaign: (c: Campaign) => void;
  onAddEvent: (e: Event) => void;
}> = ({ user, donations, campaigns, events, users, onAddCampaign, onAddEvent }) => {
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  const stats = useMemo(() => ({
    totalDonated: donations.reduce((sum, d) => sum + d.amount, 0),
    donorCount: new Set(donations.map(d => d.donorId)).size,
    volunteerCount: users.filter(u => u.role === UserRole.VOLUNTEER).length,
    activeCampaigns: campaigns.length,
    upcomingEvents: events.length,
  }), [donations, campaigns, events, users]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      {/* Admin Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-950 p-10 rounded-[3rem] text-white shadow-2xl border border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black tracking-tight">NGO Command Center</h1>
            <span className="px-3 py-1 bg-white text-slate-950 text-[10px] font-black uppercase rounded-lg">Director Access</span>
          </div>
          <p className="text-slate-400 font-medium italic">Welcome back, {user.name}. System operational.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setShowCampaignModal(true)}
            className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            Create Campaign
          </button>
          <button 
            onClick={() => setShowEventModal(true)}
            className="px-6 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2"
          >
            Deploy Event
          </button>
        </div>
      </header>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard title="Total Donations" value={`$${stats.totalDonated.toLocaleString()}`} subtext={`${stats.donorCount} Active Donors`} color="indigo" />
        <AdminStatCard title="Active Campaigns" value={stats.activeCampaigns.toString()} subtext="Managed Across Hubs" color="emerald" />
        <AdminStatCard title="Total Personnel" value={stats.volunteerCount.toString()} subtext="Verified Volunteers" color="amber" />
        <AdminStatCard title="Operation Ops" value={stats.upcomingEvents.toString()} subtext="Logistics Confirmed" color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Roster */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900">Platform Personnel</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{users.length} Total Users</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                <tr>
                  <th className="px-8 py-4">User</th>
                  <th className="px-8 py-4">Role</th>
                  <th className="px-8 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.slice(0, 5).map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} className="w-8 h-8 rounded-full" alt="" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${u.role === UserRole.ADMIN ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-[10px] font-black text-emerald-600 uppercase">Online</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-slate-900 mb-6">Asset Allocation</h3>
          <div className="flex-grow min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={campaigns.map(c => ({ name: c.title, value: c.raised }))} innerRadius={60} outerRadius={80} dataKey="value">
                  {campaigns.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-6">
            {campaigns.slice(0, 3).map((c, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400 truncate w-32">{c.title}</span>
                <span className="text-slate-900">${c.raised.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCampaignModal && (
        <AdminModal title="New Campaign Launch" onClose={() => setShowCampaignModal(false)}>
           <div className="space-y-4">
             <input type="text" placeholder="Mission Name" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" />
             <textarea placeholder="Strategy Description" className="w-full p-4 bg-slate-50 border rounded-xl min-h-[100px]" />
             <div className="grid grid-cols-2 gap-4">
               <input type="number" placeholder="Funding Target ($)" className="w-full p-4 bg-slate-50 border rounded-xl" />
               <select className="w-full p-4 bg-slate-50 border rounded-xl">
                 <option>Education</option>
                 <option>Healthcare</option>
                 <option>Environment</option>
               </select>
             </div>
             <button className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest shadow-xl">Deploy Campaign</button>
           </div>
        </AdminModal>
      )}

      {showEventModal && (
        <AdminModal title="New Event Deployment" onClose={() => setShowEventModal(false)}>
           <div className="space-y-4">
             <input type="text" placeholder="Operation Title" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" />
             <div className="grid grid-cols-2 gap-4">
               <input type="date" className="w-full p-4 bg-slate-50 border rounded-xl" />
               <input type="text" placeholder="Location Code" className="w-full p-4 bg-slate-50 border rounded-xl" />
             </div>
             <button className="w-full py-4 bg-slate-950 text-white rounded-xl font-black uppercase tracking-widest shadow-xl">Confirm Deployment</button>
           </div>
        </AdminModal>
      )}
    </div>
  );
};

export default AdminDashboard;

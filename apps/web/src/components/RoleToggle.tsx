import React from 'react';
import { useAppStore } from '@/lib/store';
import { ShieldCheck, HardHat, Bolt } from 'lucide-react';

export const RoleToggle: React.FC = () => {
  const { currentRole, setCurrentRole } = useAppStore();

  const roles = [
    { id: 'revenue', label: 'Revenue Dept', icon: ShieldCheck, color: 'text-brand-primary' },
    { id: 'engineer', label: 'City Engineer', icon: HardHat, color: 'text-amber-400' },
    { id: 'utility', label: 'Utility Agency', icon: Bolt, color: 'text-blue-400' }
  ] as const;

  return (
    <div className="flex bg-surface-100 rounded-lg p-1 border border-white/10 mt-4 mb-2 shadow-lg">
      {roles.map(r => (
        <button
          key={r.id}
          onClick={() => setCurrentRole(r.id)}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-[10px] font-bold transition-all ${
            currentRole === r.id 
              ? 'bg-white/10 shadow-sm border border-white/5' 
              : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <r.icon className={`w-3 h-3 ${currentRole === r.id ? r.color : ''}`} />
          <span className={currentRole === r.id ? 'text-white' : ''}>{r.label}</span>
        </button>
      ))}
    </div>
  );
};

import React from 'react';
import { Shield } from 'lucide-react';

export const AdminHeader = ({ title, subtitle }) => {
  return (
    <header className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-full border border-emerald-200 text-xs font-bold">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>RBAC Enforced</span>
        </div>
      </div>
    </header>
  );
};

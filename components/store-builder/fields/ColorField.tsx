import React from 'react';

export default function ColorField({ label, value, onChange }: any) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-[13px] font-semibold text-gray-800">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 rounded-full border border-gray-200 shadow-inner overflow-hidden flex-shrink-0 cursor-pointer">
          <input 
            type="color" 
            value={value || '#000000'} 
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
          />
        </div>
        <input 
          type="text" 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
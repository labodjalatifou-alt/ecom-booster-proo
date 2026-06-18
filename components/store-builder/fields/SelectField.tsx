import React from 'react';

export default function SelectField({ label, value, onChange, options = [] }: any) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-[13px] font-semibold text-gray-800">{label}</label>
      <select 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow appearance-none cursor-pointer"
      >
        {options.map((opt: any, i: number) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
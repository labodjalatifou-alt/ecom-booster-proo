import React from 'react';

export default function TextareaField({ label, value, onChange, placeholder }: any) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-[13px] font-semibold text-gray-800">{label}</label>
      <textarea 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
      />
    </div>
  );
}
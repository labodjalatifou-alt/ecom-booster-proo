import React from 'react';

export default function ImageField({ label, value, onChange, ...props }: any) {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-xs font-semibold text-gray-700">{label}</label>
      <div className="text-sm text-gray-500">[Champ image en construction]</div>
    </div>
  );
}

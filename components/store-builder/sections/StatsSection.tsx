import React from 'react';

export default function StatsSection({ settings }: any) {
  return (
    <div className="w-full p-8 text-center bg-white border border-dashed border-gray-300">
      <h2 className="text-2xl font-bold text-gray-800">StatsSection</h2>
      <p className="text-gray-500">Composant en cours de construction avec les settings : {JSON.stringify(settings)}</p>
    </div>
  );
}

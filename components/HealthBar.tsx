import React from 'react';

interface HealthBarProps {
  label: string;
  current: number;
  max: number;
}

const HealthBar: React.FC<HealthBarProps> = ({ label, current, max }) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const getBarColor = () => {
    if (clampedPercentage > 50) return 'bg-green-500';
    if (clampedPercentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="relative w-full bg-slate-700 rounded-full h-6 overflow-hidden border-2 border-slate-600 shadow-inner">
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor()}`}
        style={{ width: `${clampedPercentage}%` }}
      ></div>
      <div className="absolute inset-0 flex items-center justify-between px-3 text-white font-bold text-sm">
        <span>{label}</span>
        <span>{Math.max(0, current)} / {max}</span>
      </div>
    </div>
  );
};

export default HealthBar;

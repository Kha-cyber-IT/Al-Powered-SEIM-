import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'red' | 'yellow' | 'green';
  trend?: string;
}

const colorClasses = {
  blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  red: 'bg-red-500/10 text-red-500 border-red-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  green: 'bg-green-500/10 text-green-500 border-green-500/20',
};

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className={`p-6 rounded-xl border backdrop-blur-sm ${colorClasses[color]} transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
          {trend && <p className="text-xs mt-2 opacity-70">{trend}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-opacity-20 bg-white`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

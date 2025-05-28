
import { TrendingUp, Clock, Shield, Zap } from 'lucide-react';

export const StatsOverview = () => {
  const stats = [
    {
      icon: TrendingUp,
      label: 'Success Rate',
      value: '99.2%',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Clock,
      label: 'Avg. Generation Time',
      value: '3.5min',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Shield,
      label: 'Compliance Ready',
      value: '100%',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Zap,
      label: 'Domains Supported',
      value: '12+',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <div className={`text-2xl font-bold ${stat.color} mb-1`}>
            {stat.value}
          </div>
          <div className="text-sm text-gray-600">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

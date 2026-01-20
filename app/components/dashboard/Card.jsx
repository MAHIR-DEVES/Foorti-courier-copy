'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Package,
  DollarSign,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// You can install lucide-react: npm install lucide-react
// Or use inline SVGs if you prefer

const performanceData = [
  {
    title: 'Delivery Processing',
    key: 'delivery_processing',
    icon: <Package className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    trendKey: 'delivery_trend', // assuming API returns trend data
  },
  {
    title: 'COD Processing',
    key: 'cod_processing',
    icon: <DollarSign className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    trendKey: 'cod_trend',
  },
  {
    title: 'Return Request',
    key: 'return_request',
    icon: <RefreshCw className="w-5 h-5" />,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    trendKey: 'return_trend',
  },
  {
    title: 'Latest Return',
    key: 'latest_return',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    trendKey: 'latest_return_trend',
  },
];

const Card = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const stored = localStorage.getItem('token');
        const token = stored ? JSON.parse(stored).token : null;
        const res = await fetch(
          'https://admin.merchantfcservice.com/api/dashboard-button-list',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        const data = await res.json();

        if (data?.success) {
          setDashboardData(data.data);

          // Simulate trend data - in real app this would come from API
          const mockTrends = {
            delivery_trend: Math.random() > 0.5 ? 'up' : 'down',
            cod_trend: Math.random() > 0.3 ? 'up' : 'down',
            return_trend: Math.random() > 0.5 ? 'up' : 'down',
            latest_return_trend: Math.random() > 0.7 ? 'up' : 'down',
          };
          setTrends(mockTrends);
        }
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-2 mt-8">
      {performanceData.map((item, index) => {
        const value = dashboardData[item.key] ?? 0;
        const trend = trends[item.trendKey];
        const trendValue = Math.floor(Math.random() * 20) + 5; // Mock trend percentage

        return (
          <div
            key={index}
            className={`
              group relative overflow-hidden
              bg-white rounded-md shadow-lg
              border border-gray-100
             
             
              transform-gpu
              ${item.bgColor}
              before:absolute before:inset-0 
              before:bg-gradient-to-br ${item.color}
              before:opacity-5 before:transition-opacity
              hover:before:opacity-10
            `}
          >
            {/* Decorative corner accent */}
            <div className={`absolute top-0 right-0 w-16 h-16 overflow-hidden`}>
              <div
                className={`absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-gradient-to-br ${item.color} opacity-10`}
              />
            </div>

            <div className="relative z-10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    p-3 rounded-xl
                    bg-gradient-to-br ${item.color}
                    shadow-md
                  `}
                  >
                    <div className="text-white">{item.icon}</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {trend && (
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            trend === 'up'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {trend === 'up' ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {trendValue}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                {loading ? (
                  <div className="flex items-center space-x-4 animate-pulse">
                    <div
                      className={`h-12 w-32 rounded-lg bg-gradient-to-r ${item.color} opacity-20`}
                    ></div>
                  </div>
                ) : (
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      {typeof value === 'number'
                        ? value.toLocaleString()
                        : value}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">orders</span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-8">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Progress</span>
                  <span>{Math.min(100, Math.floor((value / 100) * 100))}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700`}
                    style={{
                      width: `${Math.min(100, Math.floor((value / 100) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* View details button */}
              <div className="mt-8 pt-4 border-t border-gray-100">
                <button
                  className={`
                  flex items-center gap-2
                  text-sm font-medium
                  text-gray-600 hover:text-gray-900
                  transition-colors duration-200
                  group-hover:translate-x-1
                  transition-transform
                `}
                >
                  View details
                  <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                </button>
              </div>
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </div>
        );
      })}
    </div>
  );
};

export default Card;

'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Package,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useOrderContext } from '@/app/contexts/OrderContext';

const performanceData = [
  // {
  //   title: 'Delivery Processing',
  //   key: 'delivery_processing',
  //   icon: <Package className="w-5 h-5" />,
  //   color: 'bg-blue-100',
  //   textColor: 'text-blue-700',
  //   link: '/dashboard/consignments?status=Pending',
  // },
  {
    title: 'COD Processing',
    key: 'cod_processing',
    icon: <DollarSign className="w-5 h-5" />,
    color: 'bg-blue-100',
    textColor: 'text-blue-700',
    link: '/dashboard/consignments?status=Approval%20Pending',
  },
  {
    title: 'Return Request',
    key: 'return_request',
    icon: <RefreshCw className="w-5 h-5" />,
    color: 'bg-blue-100',
    textColor: 'text-blue-700',
    link: '/dashboard/dashboard-processing/return',
  },
  {
    title: 'Latest Return',
    key: 'latest_return',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'bg-blue-100',
    textColor: 'text-blue-700',
    link: '/dashboard/latest-return',
  },
];

const CompactDashboardCard = ({ item, value }) => {
  return (
    <Link href={item.link} className="block">
      <div 
        className={`
          ${item.color} 
          ${item.textColor}
          rounded-lg p-4 
          shadow-sm 
          hover:shadow-md 
          transition-shadow 
          cursor-pointer
          min-h-[100px]
        `}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`${item.textColor} bg-white/50 p-2 rounded-lg`}>
                {item.icon}
              </div>
            </div>
            <h3 className="text-sm font-medium mb-1">
              {item.title}
            </h3>
            <div className="text-xl font-bold">
              <span>{value.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const Card = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [apiLoading, setApiLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false); // নতুন state
  
  const { pendingCount, codPendingCount } = useOrderContext();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setApiLoading(true);
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
        }
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setApiLoading(false);
        setDataLoaded(true); 
      }
    };

    fetchDashboardData();
  }, []);


  if (!dataLoaded && apiLoading) {
    return (
      <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full my-8">
          {[1,2,3].map(i => (
            <div key={i} className="bg-blue-100 rounded-lg p-4 min-h-[100px] animate-pulse">
              <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-blue-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full my-8">
        {performanceData.map((item, index) => {
          let value = dashboardData[item.key] || 0;
          
          // if(item.key === 'delivery_processing') {
          //   value = pendingCount;
          // }
          
          // if(item.key === 'cod_processing') {
          //   value = codPendingCount;
          // }

          return (
            <CompactDashboardCard 
              key={index}
              item={item}
              value={value}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Card;
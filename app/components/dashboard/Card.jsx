'use client';

import { useEffect, useState } from 'react';

const performanceData = [
  {
    title: 'Delivery Processing',
    key: 'delivery_processing',
  },
  {
    title: 'COD Processing',
    key: 'cod_processing',
  },
  {
    title: 'Return Request',
    key: 'return_request',
  },
  {
    title: 'latest Return ',
    key: 'latest_return',
  },
];

const Card = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);

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
          }
        );

        const data = await res.json();

        if (data?.success) {
          setDashboardData(data.data);
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
    <div
      className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        md:grid-cols-3 
        lg:grid-cols-4 
        gap-3 
        pb-2 
        mt-5
      "
    >
      {performanceData.map((item, index) => (
        <div
          key={index}
          className="
            flex 
            justify-between 
            gap-3 
            px-2 
            py-3 
            md:py-4 
            bg-primary 
            border 
            border-gray 
            rounded-md
          "
        >
          <h2 className="text-[20px] text-primary font-semibold whitespace-nowrap">
            {item.title} {loading ? '...' : dashboardData[item.key] ?? 0}
          </h2>
        </div>
      ))}
    </div>
  );
};

export default Card;

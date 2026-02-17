'use client';

import { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [codPendingCount, setCodPendingCount] = useState(0);
  const [allOrders, setAllOrders] = useState([]);

  // Function to update pending count
  const updatePendingCount = (orders) => {
    if (!Array.isArray(orders)) {
      setPendingCount(0);
      return;
    }

    const pendingOrders = orders.filter(o =>
      String(o?.parcel_update_track_confirm) === "1" &&
      ![
        'Successfully Delivered',
        'Delivered Amount Collected from Branch',
      ].includes(o.status)
    );

    setPendingCount(pendingOrders.length);
  };

  // Function to update COD pending count
  const updateCodPendingCount = (orders) => {
    if (!Array.isArray(orders)) {
      setCodPendingCount(0);
      return;
    }

    const approvalPendingOrders = orders.filter(o => 
      o.status === 'Successfully Delivered' || 
      o.status === 'Delivered Amount Collected from Branch'
    );

    setCodPendingCount(approvalPendingOrders.length);
  };

  return (
    <OrderContext.Provider value={{ 
      pendingCount, 
      codPendingCount,
      allOrders, 
      setAllOrders,  
      updatePendingCount,
      updateCodPendingCount
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
};
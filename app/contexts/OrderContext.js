'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [allOrders, setAllOrders] = useState([]);

  // Function to update pending count based on orders
  const updatePendingCount = (orders) => {
    if (orders && Array.isArray(orders)) {
      const pendingOrders = orders.filter(item => 
        String(item?.parcel_update_track_confirm) === '1'
      );
      setPendingCount(pendingOrders.length);
    } else {
      setPendingCount(0);
    }
  };

  return (
    <OrderContext.Provider value={{ 
      pendingCount, 
      setPendingCount, 
      allOrders, 
      setAllOrders, 
      updatePendingCount 
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
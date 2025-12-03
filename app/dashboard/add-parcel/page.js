'use client';
import { useState } from 'react';
import Button from '../../components/add-parcel/Button';
import DeliveryForm from '../../components/add-parcel/DeliveryForm';
export default function AddParcelsPage() {
  const [active, setActive] = useState('Regular');
  console.log(active);

  return (
    <>
      <Button setActive={setActive} active={active} />
      <div className="min-h-screen bg-gray-50 p-4">
        <DeliveryForm active={active} />
      </div>
    </>
  );
}

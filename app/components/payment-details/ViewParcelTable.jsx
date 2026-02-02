'use client';
const consignments = [
  {
    id: 'C-1001',
    date: '2026-02-01',
    invoice: 'INV-4561',
    customer: 'Rahim Traders',
    cod: 12500,
    charge: 450,
    lot: 'L-21',
    status: 'Pending',
    notes: 'Urgent delivery',
  },
  {
    id: 'C-1002',
    date: '2026-02-01',
    invoice: 'INV-4562',
    customer: 'Karim Enterprise',
    cod: 9800,
    charge: 350,
    lot: 'L-22',
    status: 'Ready',
    notes: '-',
  },
  {
    id: 'C-1003',
    date: '2026-02-02',
    invoice: 'INV-4563',
    customer: 'Sadia Store',
    cod: 15200,
    charge: 500,
    lot: 'L-23',
    status: 'Hold',
    notes: 'Payment issue',
  },
];

const StatusBadge = ({ status }) => {
  const base =
    'px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center justify-center min-w-[80px]';

  const styles = {
    Pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    Ready: 'bg-green-50 text-green-700 border border-green-200',
    Hold: 'bg-red-50 text-red-700 border border-red-200',
  };

  return <span className={`${base} ${styles[status]}`}>{status}</span>;
};

export default function ViewParcelTable() {
  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-300 bg-gray-50/50">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Clearable Consignments
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Total {consignments.length} consignments
          </p>
        </div>
        <button className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm">
          Print Report
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-300">
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Creation Date
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Invoice
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Customer Name
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                COD Amount
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Charge
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Lot
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {consignments.map(item => (
              <tr
                key={item.id}
                className="hover:bg-gray-50/80 transition-colors"
              >
                <td className="p-4">
                  <div className="text-sm font-medium text-gray-900">
                    {item.date}
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {item.id}
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium text-gray-900 font-mono">
                    {item.invoice}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium text-gray-900">
                    {item.customer}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-bold text-gray-900">
                    ৳{item.cod.toLocaleString()}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium text-emerald-600">
                    ৳{item.charge}
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                    {item.lot}
                  </span>
                </td>
                <td className="p-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="p-4">
                  <div
                    className={`text-sm ${item.notes === '-' ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {item.notes}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-300 bg-gray-50/50 text-sm text-gray-500">
        Showing {consignments.length} of {consignments.length} consignments
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

interface Order {
  id: number;
  user_name: string;
  user_email: string;
  destination_title: string;
  destination_location: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  created_at: string;
}

const statusOptions = ['confirmed', 'completed', 'cancelled'];

interface OrdersProps {
  token: string | null;
}

export default function Orders({ token }: OrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    fetch('/api/admin/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchOrders();
  };

  const statusBadgeColor = (status: string) => {
    const map: Record<string, string> = {
      confirmed: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Orders</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Order #
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Customer
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Destination
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Check-in
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Check-out
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Guests
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.user_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.user_email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.destination_title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.check_in).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.check_out).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">
                    {order.guests}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${Number(order.total_price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusBadgeColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-400">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

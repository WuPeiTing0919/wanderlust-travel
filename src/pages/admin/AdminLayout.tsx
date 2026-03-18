import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  ShoppingBag,
  Users,
  Mail,
  ArrowLeft,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Destinations', path: '/admin/destinations', icon: MapPin },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Subscribers', path: '/admin/subscribers', icon: Mail },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
        {/* Back to Site */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-6 py-4 text-sm text-gray-400 hover:text-white transition-colors border-b border-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Site
        </button>

        {/* Brand */}
        <div className="px-6 py-6">
          <h1 className="text-xl font-bold font-serif">Wanderlust</h1>
          <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">&copy; 2026 Wanderlust</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        {children}
      </main>
    </div>
  );
}

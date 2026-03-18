import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import Cart from './pages/Cart';
import DestinationDetail from './pages/DestinationDetail';
import DestinationsPage from './pages/DestinationsPage';
import ToursPage from './pages/ToursPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import Profile from './pages/Profile';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Destinations from './pages/admin/Destinations';
import Orders from './pages/admin/Orders';
import Users from './pages/admin/Users';

interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function App() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  // Restore auth from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Load cart count when logged in
  useEffect(() => {
    if (token) {
      fetch('/api/cart', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : [])
        .then((items: any[]) => setCartCount(items.length))
        .catch(() => setCartCount(0));
    } else {
      setCartCount(0);
    }
  }, [token]);

  const handleAuthSuccess = (data: { token: string; user: any }) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setAuthModal(null);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setCartCount(0);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const sharedProps = {
    user,
    token,
    onAuthRequired: () => setAuthModal('login'),
    cartCount,
    setCartCount,
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {!isAdmin && (
        <Navbar
          user={user}
          cartCount={cartCount}
          onLogin={() => setAuthModal('login')}
          onSignup={() => setAuthModal('signup')}
          onLogout={handleLogout}
        />
      )}

      <AuthModal
        mode={authModal}
        onClose={() => setAuthModal(null)}
        onSuccess={handleAuthSuccess}
        onSwitch={() => setAuthModal(prev => prev === 'login' ? 'signup' : 'login')}
      />

      <Routes>
        <Route path="/" element={<Home {...sharedProps} />} />
        <Route path="/destinations" element={<DestinationsPage {...sharedProps} />} />
        <Route path="/destination/:id" element={<DestinationDetail {...sharedProps} />} />
        <Route path="/tours" element={<ToursPage {...sharedProps} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route
          path="/profile"
          element={token ? <Profile user={user} token={token} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/cart"
          element={token ? <Cart token={token} cartCount={cartCount} setCartCount={setCartCount} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/admin"
          element={user?.role === 'admin' ? <AdminLayout><Dashboard token={token} /></AdminLayout> : <Navigate to="/" replace />}
        />
        <Route
          path="/admin/destinations"
          element={user?.role === 'admin' ? <AdminLayout><Destinations token={token} /></AdminLayout> : <Navigate to="/" replace />}
        />
        <Route
          path="/admin/orders"
          element={user?.role === 'admin' ? <AdminLayout><Orders token={token} /></AdminLayout> : <Navigate to="/" replace />}
        />
        <Route
          path="/admin/users"
          element={user?.role === 'admin' ? <AdminLayout><Users token={token} /></AdminLayout> : <Navigate to="/" replace />}
        />
        <Route
          path="/admin/subscribers"
          element={user?.role === 'admin' ? <AdminLayout><Users token={token} /></AdminLayout> : <Navigate to="/" replace />}
        />
      </Routes>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Calendar, Users, Trash2, ShoppingCart, ArrowLeft, Check } from 'lucide-react';

interface CartItem {
  id: number;
  destination_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  title: string;
  location: string;
  price: string;
  image: string;
  rating: string;
}

interface Props {
  token: string | null;
  cartCount: number;
  setCartCount: (n: number) => void;
}

function calcNights(checkIn: string, checkOut: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = Math.round((end.getTime() - start.getTime()) / msPerDay);
  return diff > 0 ? diff : 1;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Cart({ token, cartCount, setCartCount }: Props) {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('/api/cart', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data: CartItem[]) => {
        setItems(data);
        setCartCount(data.length);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setCartCount(cartCount - 1);
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setConfirmed(true);
        setItems([]);
        setCartCount(0);
      }
    } catch {
      // silently fail
    } finally {
      setCheckingOut(false);
    }
  };

  const total = items.reduce((sum, item) => {
    const nights = calcNights(item.check_in, item.check_out);
    return sum + Number(item.price) * nights;
  }, 0);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // Checkout confirmed state
  if (confirmed) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your travel bookings have been confirmed. We've sent the details to your email.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-full font-medium transition-colors"
            >
              Browse More Destinations
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added any trips yet.</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-full font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse Destinations
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Cart with items
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-brand transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Continue browsing</span>
          </button>
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-brand" />
            <h1 className="text-3xl font-serif font-bold text-gray-900">Your Cart</h1>
            <span className="bg-brand/10 text-brand text-sm font-bold px-3 py-1 rounded-full">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </motion.div>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          <AnimatePresence mode="popLayout">
            {items.map((item, idx) => {
              const nights = calcNights(item.check_in, item.check_out);
              const subtotal = Number(item.price) * nights;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-grow p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-gray-900 font-serif">{item.title}</h3>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                          <MapPin className="w-4 h-4" />
                          <span>{item.location}</span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar className="w-4 h-4 text-brand" />
                            <span>{formatDate(item.check_in)} - {formatDate(item.check_out)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Users className="w-4 h-4 text-brand" />
                            <span>{item.guests} {item.guests === 1 ? 'guest' : 'guests'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                          ${Number(item.price).toFixed(2)} x {nights} {nights === 1 ? 'night' : 'nights'}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          ${subtotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Total & Checkout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600 font-medium">Total</span>
            <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="w-full bg-brand hover:bg-brand-hover text-white py-4 rounded-xl font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {checkingOut ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Checkout
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

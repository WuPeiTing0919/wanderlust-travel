import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Search,
  Star,
  Heart,
  X,
  ShoppingCart,
  Globe,
} from 'lucide-react';

interface Destination {
  id: number;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface Props {
  user: any;
  token: string | null;
  onAuthRequired: () => void;
  cartCount: number;
  setCartCount: (n: number) => void;
}

export default function DestinationsPage({ user, token, onAuthRequired, cartCount, setCartCount }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Favorites
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  // Add-to-cart modal
  const [cartDest, setCartDest] = useState<Destination | null>(null);
  const [cartForm, setCartForm] = useState({ check_in: '', check_out: '', guests: 1 });
  const [cartSubmitting, setCartSubmitting] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  // Load destinations
  const fetchDestinations = async (search?: string, category?: string) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    const url = `/api/destinations${params.toString() ? '?' + params : ''}`;
    const data = await fetch(url).then(r => r.json());
    setDestinations(data);
  };

  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) {
      setActiveCategory(urlCategory);
      fetchDestinations(undefined, urlCategory);
    } else {
      fetchDestinations();
    }
    fetch('/api/categories')
      .then(r => r.json())
      .then(setCategories)
      .catch(console.error);
  }, [searchParams]);

  // Load favorites when logged in
  useEffect(() => {
    if (token) {
      fetch('/api/favorites', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => (r.ok ? r.json() : []))
        .then(setFavoriteIds)
        .catch(() => setFavoriteIds([]));
    } else {
      setFavoriteIds([]);
    }
  }, [token]);

  // --- Handlers ---

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    fetchDestinations(value || undefined, activeCategory || undefined);
  };

  const handleCategoryClick = (catName: string) => {
    const next = activeCategory === catName ? null : catName;
    setActiveCategory(next);
    fetchDestinations(searchQuery || undefined, next || undefined);
  };

  const handleClearCategory = () => {
    setActiveCategory(null);
    fetchDestinations(searchQuery || undefined, undefined);
  };

  // Favorites
  const toggleFavorite = async (destId: number) => {
    if (!token) {
      onAuthRequired();
      return;
    }

    const isFav = favoriteIds.includes(destId);
    if (isFav) {
      await fetch(`/api/favorites/${destId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavoriteIds(prev => prev.filter(id => id !== destId));
    } else {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ destination_id: destId }),
      });
      setFavoriteIds(prev => [...prev, destId]);
    }
  };

  // Add to Cart
  const handleAddToCart = (dest: Destination) => {
    if (!token) {
      onAuthRequired();
      return;
    }
    setCartDest(dest);
    setCartForm({ check_in: '', check_out: '', guests: 1 });
    setCartSubmitting(false);
  };

  const handleCartSubmit = async () => {
    if (!cartDest || !cartForm.check_in || !cartForm.check_out) return;
    setCartSubmitting(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          destination_id: cartDest.id,
          check_in: cartForm.check_in,
          check_out: cartForm.check_out,
          guests: cartForm.guests,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCartCount(cartCount + 1);
        setCartDest(null);
        showToast(`"${cartDest.title}" added to cart!`);
      } else {
        showToast(data.error || 'Failed to add to cart');
      }
    } catch {
      showToast('Failed to add to cart');
    } finally {
      setCartSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"
          >
            <ShoppingCart className="w-5 h-5 text-brand" />
            <span className="font-medium text-sm">{toast}</span>
            <button onClick={() => setToast(null)} className="text-white/60 hover:text-white ml-2">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add to Cart Modal */}
      <AnimatePresence>
        {cartDest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
            onClick={() => setCartDest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-gray-900">Add to Cart</h2>
                <button
                  onClick={() => setCartDest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-2xl">
                <img
                  src={cartDest.image}
                  alt={cartDest.title}
                  className="w-20 h-20 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-bold text-gray-900">{cartDest.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {cartDest.location}
                  </p>
                  <p className="text-brand font-bold">${Number(cartDest.price)} / night</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1 block">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={cartForm.check_in}
                      onChange={e => setCartForm({ ...cartForm, check_in: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1 block">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={cartForm.check_out}
                      onChange={e => setCartForm({ ...cartForm, check_out: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1 block">
                    Guests
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={cartForm.guests}
                    onChange={e => setCartForm({ ...cartForm, guests: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand"
                  />
                </div>
                <button
                  onClick={handleCartSubmit}
                  disabled={cartSubmitting || !cartForm.check_in || !cartForm.check_out}
                  className="w-full bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartSubmitting ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Explore Destinations</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find your perfect getaway from our curated collection of world-class destinations.
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10"
        >
          {/* Search Input */}
          <div className="relative max-w-xl mx-auto mb-8">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand" />
            <input
              type="text"
              placeholder="Search by destination or location..."
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm focus:outline-none focus:border-brand focus:shadow-md transition-all text-gray-900 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleClearCategory}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border
                ${!activeCategory
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand/30 hover:text-gray-900'
                }`}
            >
              All
            </button>
            {categories.map(cat => {
              const isActive = activeCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border
                    ${isActive
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand/30 hover:text-gray-900'
                    }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-gray-500 text-sm">
            {destinations.length} destination{destinations.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Destination Grid */}
        {destinations.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No destinations found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest, idx) => {
              const isFav = favoriteIds.includes(dest.id);
              return (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                >
                  <div className="relative h-64 overflow-hidden cursor-pointer" onClick={() => navigate(`/destination/${dest.id}`)}>
                    <img
                      src={dest.image}
                      alt={dest.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={e => { e.stopPropagation(); toggleFavorite(dest.id); }}
                      className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-colors
                        ${isFav ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/70 text-gray-600 hover:bg-white hover:text-red-500'}`}
                    >
                      <Heart className={`w-5 h-5 ${isFav ? 'fill-white' : ''}`} />
                    </button>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3
                        className="text-xl font-bold text-gray-900 font-serif cursor-pointer hover:text-brand transition-colors"
                        onClick={() => navigate(`/destination/${dest.id}`)}
                      >
                        {dest.title}
                      </h3>
                      <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-gray-900">
                          {Number(dest.rating)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 mb-6">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{dest.location}</span>
                    </div>
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-sm text-gray-500">From</span>
                        <div className="text-lg font-bold text-gray-900">
                          ${Number(dest.price)}{' '}
                          <span className="text-sm font-normal text-gray-500">/ night</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddToCart(dest)}
                        className="bg-gray-900 hover:bg-brand text-white px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

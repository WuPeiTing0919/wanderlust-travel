import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Calendar,
  Users,
  Search,
  Star,
  Heart,
  ChevronRight,
  Plane,
  Map,
  Camera,
  Sun,
  Compass,
  Globe,
  X,
  ShoppingCart,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Sun,
  Map,
  Camera,
  Compass,
  Plane,
};

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

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function Home({ user, token, onAuthRequired, cartCount, setCartCount }: Props) {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeMsg, setSubscribeMsg] = useState('');

  // Search state
  const [searchLocation, setSearchLocation] = useState('');
  const [searchDates, setSearchDates] = useState('');
  const [searchGuests, setSearchGuests] = useState('');
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
    fetchDestinations();
    fetch('/api/categories')
      .then(r => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

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

  const handleSearch = () => {
    fetchDestinations(searchLocation || undefined, activeCategory || undefined);
    scrollTo('destinations');
  };

  const handleCategoryClick = (catName: string) => {
    const next = activeCategory === catName ? null : catName;
    setActiveCategory(next);
    fetchDestinations(searchLocation || undefined, next || undefined);
  };

  const handleSeeAll = () => {
    setActiveCategory(null);
    setSearchLocation('');
    fetchDestinations();
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

  const handleSubscribe = async () => {
    if (!subscribeEmail) return;
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscribeEmail }),
      });
      const data = await res.json();
      setSubscribeMsg(res.ok ? data.message : data.error);
      if (res.ok) setSubscribeEmail('');
    } catch {
      setSubscribeMsg('Failed to subscribe');
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

      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/travelhero/1920/1080"
            alt="Beautiful landscape"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 text-center px-4 w-full max-w-5xl mx-auto mt-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight"
          >
            Discover your next <br className="hidden md:block" />
            <span className="italic font-light">extraordinary</span> adventure
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto font-light"
          >
            Explore the world's most beautiful destinations with our curated travel experiences.
          </motion.p>
        </div>

        {/* Search Widget */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute -bottom-24 md:-bottom-12 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-max z-20"
        >
          <div className="bg-white rounded-3xl md:rounded-full shadow-xl p-4 md:p-3 flex flex-col md:flex-row items-center gap-4 md:gap-2 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 w-full md:w-auto px-4 py-2 md:border-r border-gray-200">
              <MapPin className="text-brand w-5 h-5 flex-shrink-0" />
              <div className="flex flex-col text-left flex-grow">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Location
                </span>
                <input
                  type="text"
                  placeholder="Where are you going?"
                  value={searchLocation}
                  onChange={e => setSearchLocation(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="text-sm text-gray-600 focus:outline-none w-full bg-transparent placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto px-4 py-2 md:border-r border-gray-200">
              <Calendar className="text-brand w-5 h-5 flex-shrink-0" />
              <div className="flex flex-col text-left flex-grow">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Dates
                </span>
                <input
                  type="text"
                  placeholder="Add dates"
                  value={searchDates}
                  onChange={e => setSearchDates(e.target.value)}
                  className="text-sm text-gray-600 focus:outline-none w-full bg-transparent placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto px-4 py-2">
              <Users className="text-brand w-5 h-5 flex-shrink-0" />
              <div className="flex flex-col text-left flex-grow">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Guests
                </span>
                <input
                  type="text"
                  placeholder="Add guests"
                  value={searchGuests}
                  onChange={e => setSearchGuests(e.target.value)}
                  className="text-sm text-gray-600 focus:outline-none w-full bg-transparent placeholder:text-gray-400"
                />
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="w-full md:w-auto bg-brand hover:bg-brand-hover text-white p-4 md:px-8 md:py-4 rounded-2xl md:rounded-full flex items-center justify-center gap-2 transition-colors mt-2 md:mt-0"
            >
              <Search className="w-5 h-5" />
              <span className="font-medium">Search</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 md:pt-32 pb-24">
        {/* Categories */}
        <section id="categories" className="mb-20">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {categories.map((cat, idx) => {
              const IconComp = ICON_MAP[cat.icon] || Globe;
              const isActive = activeCategory === cat.name;
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div
                    className={`w-16 h-16 rounded-full bg-white shadow-sm border flex items-center justify-center transition-all
                    ${isActive ? 'border-brand shadow-md bg-brand/5' : 'border-gray-100 group-hover:shadow-md group-hover:border-brand/30'}`}
                  >
                    <IconComp
                      className={`w-6 h-6 transition-colors ${isActive ? 'text-brand' : 'text-gray-600 group-hover:text-brand'}`}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors ${isActive ? 'text-brand' : 'text-gray-600 group-hover:text-gray-900'}`}
                  >
                    {cat.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Featured Destinations */}
        <section id="destinations" className="mb-24">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
                {activeCategory ? `${activeCategory} Destinations` : 'Trending Destinations'}
              </h2>
              <p className="text-gray-600 max-w-2xl">
                {activeCategory
                  ? `Explore our best ${activeCategory.toLowerCase()} destinations.`
                  : 'Most popular choices for travelers from around the world.'}
              </p>
            </div>
            {activeCategory && (
              <button
                onClick={handleSeeAll}
                className="hidden md:flex items-center gap-1 text-brand font-medium hover:text-brand-hover transition-colors"
              >
                See all <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {destinations.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No destinations found. Try a different search.</p>
              <button
                onClick={handleSeeAll}
                className="mt-4 text-brand font-medium hover:text-brand-hover"
              >
                Show all destinations
              </button>
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
                        onClick={() => toggleFavorite(dest.id)}
                        className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-colors
                          ${isFav ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/70 text-gray-600 hover:bg-white hover:text-red-500'}`}
                      >
                        <Heart className={`w-5 h-5 ${isFav ? 'fill-white' : ''}`} />
                      </button>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900 font-serif cursor-pointer hover:text-brand transition-colors" onClick={() => navigate(`/destination/${dest.id}`)}>
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
          {activeCategory && destinations.length > 0 && (
            <button
              onClick={handleSeeAll}
              className="md:hidden w-full mt-8 py-3 rounded-full border border-gray-200 font-medium text-gray-900 flex justify-center items-center gap-2"
            >
              See all destinations <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </section>

        {/* Banner / Newsletter Section */}
        <section id="about" className="relative rounded-3xl overflow-hidden h-[400px] flex items-center">
          <img
            src="https://picsum.photos/seed/banner/1200/400"
            alt="Special offer"
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
          <div className="relative z-10 p-8 md:p-16 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
              Get 20% off your first booking
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Join our newsletter and receive exclusive offers, travel inspiration, and more
              directly to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Your email address"
                value={subscribeEmail}
                onChange={e => setSubscribeEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:bg-white/20 w-full sm:w-auto flex-grow"
              />
              <button
                onClick={handleSubscribe}
                className="bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-full font-medium transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
            {subscribeMsg && <p className="text-white/80 text-sm mt-3">{subscribeMsg}</p>}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div
                className="flex items-center gap-2 mb-6 cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <Globe className="w-8 h-8 text-brand" />
                <span className="text-2xl font-serif font-bold">Wanderlust</span>
              </div>
              <p className="text-gray-400 mb-6">
                We make it easy to find and book the perfect travel experience anywhere in the
                world.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6 font-serif">Company</h4>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <button
                    onClick={() => scrollTo('about')}
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('destinations')}
                    className="hover:text-white transition-colors"
                  >
                    Destinations
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('categories')}
                    className="hover:text-white transition-colors"
                  >
                    Tours
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="hover:text-white transition-colors"
                  >
                    Home
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6 font-serif">Support</h4>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <button
                    onClick={() => scrollTo('contact')}
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('about')}
                    className="hover:text-white transition-colors"
                  >
                    Safety Information
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('about')}
                    className="hover:text-white transition-colors"
                  >
                    Cancellation Options
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('contact')}
                    className="hover:text-white transition-colors"
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6 font-serif">Contact</h4>
              <ul className="space-y-4 text-gray-400">
                <li>hello@wanderlust.com</li>
                <li>+1 (555) 123-4567</li>
                <li>123 Travel Street, NY 10001</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
            <p>&copy; 2026 Wanderlust Travel. All rights reserved.</p>
            <div className="flex gap-6">
              <button
                onClick={() => scrollTo('about')}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => scrollTo('about')}
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

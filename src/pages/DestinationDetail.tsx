import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  MapPin,
  Star,
  Calendar,
  Plane,
  Compass,
  Lightbulb,
  ShoppingCart,
  X,
  Users,
  Tag,
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
  description: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface Props {
  user: any;
  token: string | null;
  onAuthRequired: () => void;
  cartCount: number;
  setCartCount: (n: number) => void;
}

const travelInfo: Record<string, { bestTime: string; gettingThere: string; thingsToDo: string; localTips: string }> = {
  'Beach': {
    bestTime: 'May to September for warm weather and sunshine. Avoid peak July-August for fewer crowds.',
    gettingThere: 'Most beach destinations have nearby international airports. Consider ferry services for island locations.',
    thingsToDo: 'Snorkeling, surfing, sunset cruises, coastal hiking, and local seafood dining.',
    localTips: 'Book water activities in advance during peak season. Always apply reef-safe sunscreen.',
  },
  'Nature': {
    bestTime: 'June to September for hiking. December to March for winter sports and snow activities.',
    gettingThere: 'Fly to the nearest city, then rent a car or take regional trains to reach mountain areas.',
    thingsToDo: 'Hiking, wildlife watching, photography, mountain biking, and scenic cable car rides.',
    localTips: 'Pack layers for changeable mountain weather. Book mountain huts well in advance.',
  },
  'City': {
    bestTime: 'Spring (March-May) and Fall (September-November) offer pleasant weather and fewer tourists.',
    gettingThere: 'Major cities are well-connected by international flights. Use public transit within the city.',
    thingsToDo: 'Museum visits, food tours, architectural walks, shopping districts, and nightlife exploration.',
    localTips: 'Get a multi-day transit pass for savings. Explore neighborhoods beyond the tourist center.',
  },
  'Adventure': {
    bestTime: 'Varies by activity. Check specific season windows for the best conditions.',
    gettingThere: 'Adventure destinations may require connecting flights and ground transfers.',
    thingsToDo: 'Extreme sports, wilderness trekking, cultural immersion, and unique natural phenomena.',
    localTips: 'Book with certified guides for safety. Travel insurance is essential for adventure trips.',
  },
};

const defaultTravelInfo = {
  bestTime: 'Research the best season for your specific destination to enjoy optimal weather conditions.',
  gettingThere: 'Check for direct flights or convenient connections to your chosen destination.',
  thingsToDo: 'Explore local attractions, try regional cuisine, and immerse yourself in the culture.',
  localTips: 'Learn a few phrases in the local language and always respect local customs and traditions.',
};

export default function DestinationDetail({ user, token, onAuthRequired, cartCount, setCartCount }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [related, setRelated] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add-to-cart modal
  const [cartModalOpen, setCartModalOpen] = useState(false);
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

  // Fetch destination data
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    fetch(`/api/destinations/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Destination not found');
        return r.json();
      })
      .then((data: any) => {
        const dest: Destination = {
          ...data,
          price: Number(data.price),
          rating: Number(data.rating),
          reviews: Number(data.reviews),
          latitude: data.latitude != null ? Number(data.latitude) : null,
          longitude: data.longitude != null ? Number(data.longitude) : null,
        };
        setDestination(dest);

        // Fetch related destinations by category
        return fetch(`/api/destinations?category=${encodeURIComponent(dest.category)}`)
          .then(r => r.json())
          .then((all: any[]) => {
            const others = all
              .filter((d: any) => d.id !== dest.id)
              .slice(0, 3)
              .map((d: any) => ({
                ...d,
                price: Number(d.price),
                rating: Number(d.rating),
                reviews: Number(d.reviews),
              }));
            setRelated(others);
          });
      })
      .catch((err) => {
        setError(err.message || 'Failed to load destination');
      })
      .finally(() => {
        setLoading(false);
      });

    // Scroll to top on destination change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Add to Cart handler
  const handleOpenCartModal = () => {
    if (!token) {
      onAuthRequired();
      return;
    }
    setCartModalOpen(true);
    setCartForm({ check_in: '', check_out: '', guests: 1 });
    setCartSubmitting(false);
  };

  const handleCartSubmit = async () => {
    if (!destination || !cartForm.check_in || !cartForm.check_out) return;
    setCartSubmitting(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          destination_id: destination.id,
          check_in: cartForm.check_in,
          check_out: cartForm.check_out,
          guests: cartForm.guests,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCartCount(cartCount + 1);
        setCartModalOpen(false);
        showToast(`"${destination.title}" added to cart!`);
      } else {
        showToast(data.error || 'Failed to add to cart');
      }
    } catch {
      showToast('Failed to add to cart');
    } finally {
      setCartSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading destination...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !destination) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-xl text-gray-600 mb-4">{error || 'Destination not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  const info = travelInfo[destination.category] || defaultTravelInfo;
  const lat = destination.latitude;
  const lng = destination.longitude;
  const hasCoords = lat != null && lng != null;

  const travelCards = [
    { icon: Calendar, title: 'Best Time to Visit', content: info.bestTime },
    { icon: Plane, title: 'Getting There', content: info.gettingThere },
    { icon: Compass, title: 'Things to Do', content: info.thingsToDo },
    { icon: Lightbulb, title: 'Local Tips', content: info.localTips },
  ];

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
        {cartModalOpen && destination && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
            onClick={() => setCartModalOpen(false)}
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
                  onClick={() => setCartModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-2xl">
                <img
                  src={destination.image}
                  alt={destination.title}
                  className="w-20 h-20 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-bold text-gray-900">{destination.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {destination.location}
                  </p>
                  <p className="text-brand font-bold">${destination.price} / night</p>
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
      <section className="relative h-[60vh] min-h-[400px]">
        <img
          src={destination.image}
          alt={destination.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate(-1)}
          className="absolute top-24 left-6 md:left-10 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>

        {/* Hero Overlay Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="absolute bottom-0 left-0 right-0 p-6 md:p-10"
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-3 leading-tight">
              {destination.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <span className="flex items-center gap-1.5 text-lg">
                <MapPin className="w-5 h-5" />
                {destination.location}
              </span>
              <span className="flex items-center gap-1.5 text-lg">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                {destination.rating}
                <span className="text-white/60">({destination.reviews} reviews)</span>
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Info Bar */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="text-sm text-gray-500">From</span>
                <div className="text-2xl font-bold text-gray-900">
                  ${destination.price}{' '}
                  <span className="text-sm font-normal text-gray-500">/ night</span>
                </div>
              </div>
              <div className="h-10 w-px bg-gray-200 hidden md:block" />
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-gray-900">{destination.rating}</span>
                <span className="text-gray-500 text-sm">({destination.reviews} reviews)</span>
              </div>
              <div className="h-10 w-px bg-gray-200 hidden md:block" />
              <span className="inline-flex items-center gap-1.5 bg-brand/10 text-brand px-3 py-1.5 rounded-full text-sm font-medium">
                <Tag className="w-3.5 h-3.5" />
                {destination.category}
              </span>
            </div>
            <button
              onClick={handleOpenCartModal}
              className="bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-full font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Description Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
            About this destination
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-4xl">
            {destination.description ||
              `Discover the beauty of ${destination.title} in ${destination.location}. This stunning ${destination.category.toLowerCase()} destination offers unforgettable experiences for travelers seeking adventure, relaxation, and cultural immersion. Whether you're exploring the local sights, indulging in regional cuisine, or simply soaking in the atmosphere, ${destination.title} promises memories that will last a lifetime.`}
          </p>
        </motion.section>

        {/* Map Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
            Location
          </h2>
          <p className="text-gray-500 mb-6 flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {destination.location}
          </p>
          {hasCoords ? (
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <iframe
                title={`Map of ${destination.title}`}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng! - 0.05},${lat! - 0.03},${lng! + 0.05},${lat! + 0.03}&layer=mapnik&marker=${lat},${lng}`}
                className="w-full h-[400px] rounded-2xl"
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-full h-[400px] rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200">
              <div className="text-center text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Map not available</p>
                <p className="text-sm mt-1">{destination.location}</p>
              </div>
            </div>
          )}
        </motion.section>

        {/* Travel Planning Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">
            Travel Planning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {travelCards.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <IconComp className="w-6 h-6 text-brand" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{card.content}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Related Destinations */}
        {related.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((dest, idx) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  onClick={() => navigate(`/destination/${dest.id}`)}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 font-serif mb-1">
                      {dest.title}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      {dest.location}
                    </p>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <div className="text-lg font-bold text-gray-900">
                        ${dest.price}{' '}
                        <span className="text-sm font-normal text-gray-500">/ night</span>
                      </div>
                      <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-gray-900">{dest.rating}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}

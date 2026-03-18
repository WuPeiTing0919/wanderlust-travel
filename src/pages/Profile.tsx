import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Heart,
  MapPin,
  Star,
  Calendar,
  Users,
  ShoppingBag,
  User,
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
  favorited_at: string;
}

interface Booking {
  id: number;
  destination_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  created_at: string;
  title: string;
  location: string;
  image: string;
}

interface Props {
  user: any;
  token: string | null;
}

type Tab = 'favorites' | 'bookings';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusClasses(status: string): string {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'bg-blue-100 text-blue-700';
    case 'completed':
      return 'bg-green-100 text-green-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export default function Profile({ user, token }: Props) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('favorites');
  const [favorites, setFavorites] = useState<Destination[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const fetchFavorites = async () => {
    if (!token) {
      setLoadingFavorites(false);
      return;
    }
    try {
      const res = await fetch('/api/favorites/details', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingFavorites(false);
    }
  };

  const fetchBookings = async () => {
    if (!token) {
      setLoadingBookings(false);
      return;
    }
    try {
      const res = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
    fetchBookings();
  }, [token]);

  const removeFavorite = async (destinationId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/favorites/${destinationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchFavorites();
      }
    } catch {
      // silently fail
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const tabs: { key: Tab; label: string }[] = [
    { key: 'favorites', label: 'Favorites' },
    { key: 'bookings', label: 'Bookings' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 bg-brand rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl font-bold text-white font-serif">
              {userInitial}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
            {user?.name || 'Traveler'}
          </h1>
          <p className="text-gray-500 mb-1">{user?.email}</p>
          <p className="text-gray-400 text-sm">Member</p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-8 mb-10 border-b border-gray-200"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-brand'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="profile-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full"
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {loadingFavorites ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-24">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                  No favorites yet
                </h2>
                <p className="text-gray-500 mb-8">
                  Start exploring destinations and save your favorites here.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-full font-medium transition-colors"
                >
                  Browse Destinations
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((dest, idx) => (
                  <motion.div
                    key={dest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={dest.image}
                        alt={dest.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => removeFavorite(dest.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        <Heart className="w-5 h-5 fill-white" />
                      </button>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">
                        {dest.title}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{dest.location}</span>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">
                            ${Number(dest.price)}
                            <span className="text-sm font-normal text-gray-500">
                              {' '}
                              / night
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-bold text-gray-900">
                            {Number(dest.rating)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/destination/${dest.id}`)}
                        className="mt-4 w-full bg-gray-900 hover:bg-brand text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {loadingBookings ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-24">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                  No bookings yet
                </h2>
                <p className="text-gray-500 mb-8">
                  Once you book a trip, your bookings will appear here.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-full font-medium transition-colors"
                >
                  Browse Destinations
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking, idx) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0">
                        <img
                          src={booking.image}
                          alt={booking.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-grow p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-serif font-bold text-gray-900">
                                {booking.title}
                              </h3>
                              <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                                <MapPin className="w-4 h-4" />
                                <span>{booking.location}</span>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusClasses(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Calendar className="w-4 h-4 text-brand" />
                              <span>
                                {formatDate(booking.check_in)} -{' '}
                                {formatDate(booking.check_out)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Users className="w-4 h-4 text-brand" />
                              <span>
                                {booking.guests}{' '}
                                {booking.guests === 1 ? 'guest' : 'guests'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
                          <span className="text-sm text-gray-500">
                            Booked on{' '}
                            {new Date(booking.created_at).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )}
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            ${Number(booking.total_price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

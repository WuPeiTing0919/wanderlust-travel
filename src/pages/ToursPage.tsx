import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Sun,
  Map,
  Camera,
  Compass,
  Plane,
  Globe,
  MapPin,
  Star,
  ChevronRight,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Sun,
  Map,
  Camera,
  Compass,
  Plane,
};

interface Category {
  id: number;
  name: string;
  icon: string;
}

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

interface Props {
  user: any;
  token: string | null;
  onAuthRequired: () => void;
  cartCount: number;
  setCartCount: (n: number) => void;
}

export default function ToursPage({ user, token, onAuthRequired, cartCount, setCartCount }: Props) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredByCategory, setFeaturedByCategory] = useState<Record<string, Destination[]>>({});
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    setLoading(true);
    fetch('/api/categories')
      .then(r => r.json())
      .then((cats: Category[]) => {
        setCategories(cats);
        // For each category, fetch top 2 destinations
        const fetches = cats.map(cat =>
          fetch(`/api/destinations?category=${encodeURIComponent(cat.name)}`)
            .then(r => r.json())
            .then((dests: any[]) =>
              dests.slice(0, 2).map((d: any) => ({
                ...d,
                price: Number(d.price),
                rating: Number(d.rating),
                reviews: Number(d.reviews),
              }))
            )
            .then(topDests => ({ name: cat.name, dests: topDests }))
        );
        return Promise.all(fetches);
      })
      .then(results => {
        const map: Record<string, Destination[]> = {};
        results.forEach(r => {
          map[r.name] = r.dests;
        });
        setFeaturedByCategory(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading tours...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Page Header */}
      <header className="pt-28 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-serif font-bold text-gray-900 mb-4"
          >
            Tour Categories
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-gray-600 text-lg max-w-2xl mx-auto"
          >
            Explore our curated travel experiences organized by theme.
          </motion.p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Category Cards */}
        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, idx) => {
              const IconComp = ICON_MAP[cat.icon] || Globe;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  onClick={() => navigate(`/destinations?category=${encodeURIComponent(cat.name)}`)}
                  className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-80"
                >
                  <img
                    src={`https://picsum.photos/seed/${cat.name.toLowerCase()}/800/500`}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <IconComp className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-serif font-bold text-white">
                        {cat.name}
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-1 text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                      Explore {cat.name}
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Featured Tours Section */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Popular Tours
            </h2>
            <p className="text-gray-600 max-w-2xl">
              Handpicked destinations from each category to inspire your next journey.
            </p>
          </motion.div>

          <div className="space-y-16">
            {categories.map((cat, catIdx) => {
              const dests = featuredByCategory[cat.name] || [];
              if (dests.length === 0) return null;
              const IconComp = ICON_MAP[cat.icon] || Globe;

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: catIdx * 0.05, duration: 0.5 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center">
                        <IconComp className="w-4.5 h-4.5 text-brand" />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-gray-900">
                        {cat.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => navigate(`/destinations?category=${encodeURIComponent(cat.name)}`)}
                      className="flex items-center gap-1 text-brand font-medium text-sm hover:text-brand-hover transition-colors"
                    >
                      View all <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dests.map((dest, idx) => (
                      <motion.div
                        key={dest.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.4 }}
                        onClick={() => navigate(`/destination/${dest.id}`)}
                        className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col sm:flex-row cursor-pointer"
                      >
                        <div className="relative w-full sm:w-56 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
                          <img
                            src={dest.image}
                            alt={dest.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-5 flex flex-col justify-between flex-grow">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 font-serif mb-1 group-hover:text-brand transition-colors">
                              {dest.title}
                            </h4>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                              <MapPin className="w-3.5 h-3.5" />
                              {dest.location}
                            </p>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <div className="text-lg font-bold text-gray-900">
                              ${dest.price}{' '}
                              <span className="text-sm font-normal text-gray-500">/ night</span>
                            </div>
                            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-bold text-gray-900">
                                {dest.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

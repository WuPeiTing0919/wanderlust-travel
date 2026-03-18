import { motion } from 'motion/react';
import { Globe, Heart, Shield } from 'lucide-react';

const stats = [
  { value: '500+', label: 'Destinations' },
  { value: '10K+', label: 'Happy Travelers' },
  { value: '50+', label: 'Countries' },
  { value: '24/7', label: 'Support' },
];

const values = [
  {
    icon: Globe,
    title: 'Global Exploration',
    description:
      'We curate extraordinary experiences across every continent, connecting you with hidden gems and iconic landmarks that define the spirit of each destination.',
  },
  {
    icon: Heart,
    title: 'Passion for Travel',
    description:
      'Our love for discovering new places drives everything we do. We believe that travel has the power to transform perspectives and create lifelong memories.',
  },
  {
    icon: Shield,
    title: 'Trust & Safety',
    description:
      'Your safety and peace of mind are our top priorities. Every partner, accommodation, and experience is thoroughly vetted to ensure reliability and quality.',
  },
];

const team = [
  {
    name: 'Sarah Mitchell',
    title: 'Founder & CEO',
    bio: 'A lifelong traveler who visited 60+ countries before founding Wanderlust to share her passion with the world.',
    image: 'https://picsum.photos/seed/sarah/400/400',
  },
  {
    name: 'James Chen',
    title: 'Head of Experiences',
    bio: 'Former travel journalist turned experience curator, James handpicks every destination in our collection.',
    image: 'https://picsum.photos/seed/james/400/400',
  },
  {
    name: 'Amara Osei',
    title: 'Customer Success Lead',
    bio: 'Dedicated to making every trip seamless, Amara ensures our travelers receive world-class support at every step.',
    image: 'https://picsum.photos/seed/amara/400/400',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            About Wanderlust
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We are on a mission to make extraordinary travel accessible to everyone.
            From breathtaking landscapes to vibrant cityscapes, we connect curious
            souls with the world's most remarkable destinations.
          </p>
        </motion.div>

        {/* Our Story Section */}
        <motion.section {...fadeUp} className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://picsum.photos/seed/team/800/600"
                alt="Our team exploring the world"
                className="w-full h-auto rounded-3xl object-cover shadow-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Wanderlust was born in 2018 from a simple belief: that the best travel
                  experiences shouldn't be reserved for the few. Our founders, a group
                  of passionate travelers, set out to build a platform that combines
                  local expertise with modern convenience.
                </p>
                <p>
                  What started as a small curated collection of handpicked destinations
                  has grown into a global community of explorers. We partner with local
                  hosts, guides, and hospitality experts in over 50 countries to bring
                  you authentic, unforgettable experiences.
                </p>
                <p>
                  Today, we continue to push boundaries — using technology to make
                  travel planning effortless while preserving the human connections that
                  make every journey meaningful. Whether you're seeking a quiet retreat
                  or an adrenaline-fueled adventure, Wanderlust is your gateway to the
                  world.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section {...fadeUp} className="mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm"
              >
                <div className="text-3xl md:text-4xl font-bold text-brand mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section {...fadeUp} className="mb-24">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 text-center mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15, duration: 0.5 }}
                  className="bg-white rounded-2xl p-8 border border-gray-100"
                >
                  <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-brand" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section {...fadeUp}>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 text-center mb-12">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.5 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-brand font-medium text-sm mb-3">
                    {member.title}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

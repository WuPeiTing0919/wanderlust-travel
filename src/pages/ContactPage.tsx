import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, ChevronDown, Send, CheckCircle } from 'lucide-react';

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'hello@wanderlust.com' },
  { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
  { icon: MapPin, label: 'Address', value: '123 Travel Street, New York, NY 10001' },
  { icon: Clock, label: 'Hours', value: 'Mon-Fri 9:00 AM - 6:00 PM EST' },
];

const faqs = [
  {
    question: 'How do I book a trip?',
    answer:
      'Browse our destinations, select the one you love, choose your dates and number of guests, then add it to your cart. Once you are ready, proceed to checkout to confirm your booking. You will receive a confirmation email with all the details.',
  },
  {
    question: 'What is your cancellation policy?',
    answer:
      'We offer free cancellation up to 48 hours before your check-in date for most bookings. Cancellations made within 48 hours may be subject to a partial charge. Please check the specific cancellation terms on each listing for details.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards including Visa, Mastercard, and American Express. We also support payments via PayPal and Apple Pay for your convenience.',
  },
  {
    question: 'Can I modify my booking after confirmation?',
    answer:
      'Yes, you can modify your booking dates, number of guests, or other details up to 72 hours before check-in through your profile page. Changes are subject to availability and any price differences will be adjusted accordingly.',
  },
  {
    question: 'Do you offer travel insurance?',
    answer:
      'We partner with leading travel insurance providers to offer comprehensive coverage options during checkout. We strongly recommend purchasing travel insurance for international trips to protect against unexpected changes.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Have questions? We'd love to hear from you.
          </p>
        </motion.div>

        {/* Two-column: Form + Contact Info */}
        <motion.section {...fadeUp} className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left Column - Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-green-50 text-green-700 px-5 py-4 rounded-xl mb-6 border border-green-100"
                  >
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">
                      Thank you! Your message has been sent. We'll get back to you soon.
                    </span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="subject"
                      placeholder="Subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                  <div>
                    <textarea
                      name="message"
                      placeholder="Your message"
                      rows={6}
                      value={form.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-brand" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-0.5">{item.label}</p>
                          <p className="text-gray-900 font-medium">{item.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Map Section */}
        <motion.section {...fadeUp} className="mb-20">
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <iframe
              title="Wanderlust Office Location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-74.02,40.70,-73.95,40.76&layer=mapnik&marker=40.7128,-74.0060"
              className="w-full h-[400px]"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section {...fadeUp}>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === idx ? 'max-h-60' : 'max-h-0'
                  }`}
                >
                  <p className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {faq.answer}
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

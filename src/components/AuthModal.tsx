import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface Props {
  mode: 'login' | 'signup' | null;
  onClose: () => void;
  onSuccess: (data: { token: string; user: any }) => void;
  onSwitch: () => void;
}

export default function AuthModal({ mode, onClose, onSuccess, onSwitch }: Props) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    const body = mode === 'signup'
      ? { name: form.name, email: form.email, password: form.password }
      : { email: form.email, password: form.password };

    try {
      const res = await fetch(`/api/auth/${mode === 'signup' ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onSuccess(data);
      setForm({ name: '', email: '', password: '' });
    } catch {
      setError('Connection failed');
    }
  };

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              {mode === 'signup' && (
                <input type="text" placeholder="Full name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand" />
              )}
              <input type="email" placeholder="Email address" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand" />
              <input type="password" placeholder="Password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand" />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={handleSubmit}
                className="w-full bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-medium transition-colors">
                {mode === 'login' ? 'Log in' : 'Sign up'}
              </button>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={onSwitch} className="text-brand font-medium hover:text-brand-hover">
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

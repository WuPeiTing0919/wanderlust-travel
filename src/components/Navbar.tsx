import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, Menu, X, User, LogOut, ShoppingCart, Shield } from 'lucide-react';

interface Props {
  user: any;
  cartCount: number;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
}

export default function Navbar({ user, cartCount, onLogin, onSignup, onLogout }: Props) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goTo = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const forceWhite = !isHome || isScrolled;

  const navLinks = [
    { label: 'Destinations', path: '/destinations' },
    { label: 'Tours', path: '/tours' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${forceWhite ? 'bg-white shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <Globe className={`w-8 h-8 ${forceWhite ? 'text-brand' : 'text-white'}`} />
            <span className={`text-2xl font-serif font-bold ${forceWhite ? 'text-gray-900' : 'text-white'}`}>Wanderlust</span>
          </div>

          <div className={`hidden md:flex items-center gap-8 font-medium ${forceWhite ? 'text-gray-600' : 'text-white/90'}`}>
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => goTo(link.path)}
                className={`hover:text-brand transition-colors ${location.pathname === link.path ? 'text-brand' : ''}`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user && (
              <button onClick={() => navigate('/cart')} className={`relative font-medium flex items-center gap-1 ${forceWhite ? 'text-gray-600' : 'text-white/80'} hover:text-brand transition-colors`}>
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
                )}
              </button>
            )}
            {user ? (
              <>
                <button onClick={() => navigate('/profile')} className={`font-medium flex items-center gap-1 ${forceWhite ? 'text-gray-900' : 'text-white'} hover:text-brand transition-colors`}>
                  <User className="w-4 h-4" /> {user.name}
                </button>
                {user.role === 'admin' && (
                  <button onClick={() => navigate('/admin')} className={`font-medium flex items-center gap-1 ${forceWhite ? 'text-brand' : 'text-brand'} hover:text-brand-hover transition-colors`}>
                    <Shield className="w-4 h-4" /> Admin
                  </button>
                )}
                <button onClick={onLogout} className={`font-medium flex items-center gap-1 ${forceWhite ? 'text-gray-600' : 'text-white/80'} hover:text-brand transition-colors`}>
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={onLogin} className={`font-medium ${forceWhite ? 'text-gray-900' : 'text-white'} hover:text-brand transition-colors`}>Log in</button>
                <button onClick={onSignup} className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-full font-medium transition-colors">Sign up</button>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className={forceWhite ? 'text-gray-900' : 'text-white'} /> : <Menu className={forceWhite ? 'text-gray-900' : 'text-white'} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-4 flex flex-col gap-6 md:hidden">
          {navLinks.map(link => (
            <button
              key={link.path}
              onClick={() => goTo(link.path)}
              className={`text-2xl font-serif text-left ${location.pathname === link.path ? 'text-brand' : 'text-gray-900'}`}
            >
              {link.label}
            </button>
          ))}
          <hr className="my-4" />
          {user ? (
            <>
              <button onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }} className="text-xl font-medium text-gray-900 text-left flex items-center gap-2"><User className="w-5 h-5" /> My Profile</button>
              {user.role === 'admin' && <button onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }} className="text-xl font-medium text-brand text-left flex items-center gap-2"><Shield className="w-5 h-5" /> Admin</button>}
              <button onClick={() => { navigate('/cart'); setMobileMenuOpen(false); }} className="text-xl font-medium text-gray-900 text-left flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Cart {cartCount > 0 && `(${cartCount})`}</button>
              <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="text-xl font-medium text-gray-600 text-left flex items-center gap-2"><LogOut className="w-5 h-5" /> Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => { onLogin(); setMobileMenuOpen(false); }} className="text-xl font-medium text-gray-900 text-left">Log in</button>
              <button onClick={() => { onSignup(); setMobileMenuOpen(false); }} className="bg-brand text-white px-6 py-3 rounded-full text-xl font-medium w-full">Sign up</button>
            </>
          )}
        </div>
      )}
    </>
  );
}

import { useEffect, useState, useRef } from 'react';
import StarCanvas from './components/StarCanvas';
import Navbar     from './components/Navbar';
import Hero       from './components/Hero';
import About      from './components/About';
import Stats      from './components/Stats';
import Prediction from './components/Prediction';
import Services   from './components/Services';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Panchang   from './components/Panchang';
import Booking    from './components/Booking';
import Footer     from './components/Footer';
import Admin      from './components/Admin';

export default function App() {
  // Show admin panel only when ?admin=true is in the URL
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

  // Mobile sticky bar: hide when booking section is visible
  const bookingRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(true);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    const el = document.getElementById('booking');
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (isAdmin) {
    return (
      <>
        <StarCanvas />
        <Navbar />
        <main id="main-content">
          <Admin />
        </main>
      </>
    );
  }

  return (
    <>
      <StarCanvas />
      <Navbar />

      <main id="main-content">
        <Hero />
        <Stats />
        <About />
        <Prediction />
        <Services />
        <HowItWorks />
        <Testimonials />
        <Panchang />
        <Booking />
      </main>

      <Footer />

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/919876543210?text=Namaste%20Ayush%20Ji%2C%20I%20would%20like%20to%20book%20a%20consultation"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Astrologer on WhatsApp"
      >
        {/* Official WhatsApp icon path — fill set explicitly */}
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
          style={{ width:28, height:28, flexShrink:0, fill:'#ffffff' }}>
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.13 6.746 3.054 9.374L1.054 31.08l5.876-1.878A15.93 15.93 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.28 22.598c-.384 1.08-1.906 1.978-3.12 2.238-.832.178-1.918.32-5.57-1.198-4.676-1.952-7.69-6.704-7.926-7.012-.226-.308-1.9-2.528-1.9-4.824s1.17-3.412 1.626-3.882a1.73 1.73 0 011.252-.524c.312 0 .624.006.898.016.288.014.674-.11.526.844L9.754 11.35c-.142.494-.474 1.174-.682 1.382-.228.23-.258.384-.086.616.172.23 1.226 1.838 2.636 2.978 1.812 1.482 3.34 1.942 3.82 2.164.482.222.762.186 1.044-.112.288-.3.806-.954 1.02-1.282.214-.33.43-.276.724-.166l3.008 1.42c.294.13.49.192.562.302.072.108.072.622-.312 1.946z"/>
        </svg>
        <span className="whatsapp-float__label">Chat with Astrologer</span>
      </a>

      {/* Mobile sticky bottom bar */}
      {showStickyBar && (
        <div className="mobile-sticky-bar" aria-hidden="true">
          <a href="#booking" className="btn-gold btn-gold-filled">
            Book Now — ₹500 / 30 min
          </a>
        </div>
      )}
    </>
  );
}

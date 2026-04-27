import './Footer.css';

export default function Footer() {
  return (
    <>
      {/* Pre-footer CTA band */}
      <div className="prefooter">
        <div className="container prefooter__inner">
          <h2 className="prefooter__title">Ready to Unlock Your Destiny?</h2>
          <a href="#prediction" className="btn-gold btn-gold-filled">Book Free Reading</a>
        </div>
      </div>

      <footer id="contact" className="footer" role="contentinfo">
        <div className="container footer__grid">
          {/* Col 1 */}
          <div className="footer__col">
            <div className="footer__logo">🌙 Shree Ayush Saxena</div>
            <p className="footer__tagline">Vedic Astrologer guiding souls through the cosmic map of their destiny since 2020.</p>
          </div>

          {/* Col 2 */}
          <div className="footer__col">
            <h4 className="footer__col-title">Quick Links</h4>
            <nav aria-label="Footer navigation">
              {['#home','#about','#prediction','#services','#contact'].map((h, i) => (
                <a key={h} href={h} className="footer__link">
                  {['Home','About','Prediction','Services','Contact'][i]}
                </a>
              ))}
            </nav>
          </div>

          {/* Col 3 */}
          <div className="footer__col">
            <h4 className="footer__col-title">Contact</h4>
            <a href="mailto:ayush@cosmicguidance.in" className="footer__link">
              ✉ ayush@cosmicguidance.in
            </a>
            <a
              href="https://wa.me/919876543210?text=Namaste%20Ayush%20Ji%2C%20I%20would%20like%20to%20book%20a%20consultation"
              className="footer__link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
            >
              📱 WhatsApp Us
            </a>
            <a href="https://instagram.com" className="footer__link" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              📸 Instagram
            </a>
            <a href="https://facebook.com" className="footer__link" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              📘 Facebook
            </a>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="container footer__bottom-inner">
            <p>© 2025 Shree Ayush Saxena. All Rights Reserved.</p>
            <div className="footer__bottom-links">
              <button className="footer__policy-btn" onClick={() => document.getElementById('privacy-modal').showModal()}>Privacy Policy</button>
              <span>·</span>
              <button className="footer__policy-btn" onClick={() => document.getElementById('terms-modal').showModal()}>Terms</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <dialog id="privacy-modal" className="policy-dialog">
        <button className="policy-dialog__close" onClick={() => document.getElementById('privacy-modal').close()} aria-label="Close">✕</button>
        <h2>Privacy Policy</h2>
        <p>Your personal details (name, date of birth, place of birth) are used solely to generate your astrology reading. We do not sell or share your data with any third party. Payment information is handled securely by Razorpay and is never stored on our servers. By using this service you consent to this use.</p>
        <p style={{marginTop:'1rem'}}>Last updated: January 2025.</p>
      </dialog>

      {/* Terms Modal */}
      <dialog id="terms-modal" className="policy-dialog">
        <button className="policy-dialog__close" onClick={() => document.getElementById('terms-modal').close()} aria-label="Close">✕</button>
        <h2>Terms of Service</h2>
        <p>Consultations provided are for entertainment and guidance purposes only. Predictions are based on traditional Vedic astrology and do not constitute medical, legal, or financial advice. Results may vary. All sessions are non-refundable once confirmed. By booking a session you agree to these terms.</p>
        <p style={{marginTop:'1rem'}}>Last updated: January 2025.</p>
      </dialog>
    </>
  );
}

import './Hero.css';

const ZODIAC_DATA = [
  { name: 'Aries',       path: 'M5 11C5 5 12 4 12 10L12 22M19 11C19 5 12 4 12 10' },
  { name: 'Taurus',      path: 'M6 8A6 6 0 0 1 18 8M12 20a5 5 0 1 0 0-10 5 5 0 0 0 0 10z' },
  { name: 'Gemini',      path: 'M6 6c3 1 9 1 12 0M6 18c3-1 9-1 12 0M9 7v10M15 7v10' },
  { name: 'Cancer',      path: 'M16 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM15 13c-4 0-8 3-8 8M8 17a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM9 11c4 0 8-3 8-8' },
  { name: 'Leo',         path: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM10 10c7 0 11 5 7 9-3 3-5-2-1-4 3-2 7 2 3 6a3 3 0 1 1 0-6' },
  { name: 'Virgo',       path: 'M5 9v10M10 9v10M15 9v6M5 9c0-3 5-3 5 0M10 9c0-3 5-3 5 0M15 9c0-3 6-3 6 3c0 4-3 7-7 6M13 19l6-6' },
  { name: 'Libra',       path: 'M4 16h16M5 12h3c1-4 8-4 9 0h3' },
  { name: 'Scorpio',     path: 'M5 8v10M10 8v10M15 8v10M5 8c0-3 5-3 5 0M10 8c0-3 5-3 5 0M15 8c0-3 6-3 6 3v5M17 19l4 4M21 23v-5M21 23h-5' },
  { name: 'Sagittarius', path: 'M18 6L6 18M18 6h-6M18 6v6M10 10l4 4' },
  { name: 'Capricorn',   path: 'M4 8l5 7 5-7M9 15a4 4 0 1 1 8 0c0 4-4 8-8 6' },
  { name: 'Aquarius',    path: 'M3 10l3-3 3 3 3-3 3 3 3-3 3 3M3 16l3-3 3 3 3-3 3 3 3-3 3 3' },
  { name: 'Pisces',      path: 'M8 4c-3 4-3 12 0 16M16 4c3 4 3 12 0 16M5 12h14' },
];

// Duplicate for seamless infinite scroll
const TICKER_ITEMS = [...ZODIAC_DATA, ...ZODIAC_DATA];

// The large mandala SVG — concentric rings + petal pattern
function Mandala() {
  const rings = [
    { r: 220, dash: '6 10', w: 0.8, op: 0.30 },
    { r: 190, dash: '4 8',  w: 0.6, op: 0.25 },
    { r: 160, dash: '3 6',  w: 0.5, op: 0.22 },
    { r: 130, dash: '2 4',  w: 0.5, op: 0.20 },
    { r: 100, dash: '2 3',  w: 0.4, op: 0.18 },
    { r:  70, dash: '1 3',  w: 0.4, op: 0.15 },
    { r:  40, dash: '1 2',  w: 0.4, op: 0.12 },
  ];

  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="hero__mandala-svg" aria-hidden="true">
      <defs>
        <radialGradient id="mandalaGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#c9a84c" stopOpacity="0.18" />
          <stop offset="60%"  stopColor="#7c5cbf" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0a0a1a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Glow backdrop */}
      <circle cx="250" cy="250" r="240" fill="url(#mandalaGlow)" />

      {/* Concentric dashed rings */}
      {rings.map((ring, i) => (
        <circle key={i} cx="250" cy="250" r={ring.r}
          fill="none" stroke="#c9a84c"
          strokeWidth={ring.w} strokeDasharray={ring.dash}
          opacity={ring.op} />
      ))}

      {/* 12 radial spoke lines */}
      {Array.from({ length: 12 }, (_, i) => {
        const a  = (i / 12) * Math.PI * 2;
        const x1 = 250 + 55  * Math.cos(a);
        const y1 = 250 + 55  * Math.sin(a);
        const x2 = 250 + 220 * Math.cos(a);
        const y2 = 250 + 220 * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#c9a84c" strokeWidth="0.5" opacity="0.18" />;
      })}

      {/* Outer petal ring — 12 petals */}
      {Array.from({ length: 12 }, (_, i) => {
        const a  = (i / 12) * Math.PI * 2;
        const cx = 250 + 175 * Math.cos(a);
        const cy = 250 + 175 * Math.sin(a);
        return <ellipse key={i} cx={cx} cy={cy} rx="14" ry="22"
          transform={`rotate(${i * 30 + 90}, ${cx}, ${cy})`}
          fill="none" stroke="#c9a84c" strokeWidth="0.7" opacity="0.22" />;
      })}

      {/* Inner star — 8-pointed */}
      {Array.from({ length: 8 }, (_, i) => {
        const a  = (i / 8) * Math.PI * 2;
        const a2 = ((i + 0.5) / 8) * Math.PI * 2;
        const ox = 250 + 55 * Math.cos(a);
        const oy = 250 + 55 * Math.sin(a);
        const ix = 250 + 28 * Math.cos(a2);
        const iy = 250 + 28 * Math.sin(a2);
        return <line key={i} x1={ox} y1={oy} x2={ix} y2={iy}
          stroke="#c9a84c" strokeWidth="0.6" opacity="0.28" />;
      })}

      {/* Center lotus */}
      {Array.from({ length: 8 }, (_, i) => {
        const a  = (i / 8) * Math.PI * 2;
        const cx = 250 + 18 * Math.cos(a);
        const cy = 250 + 18 * Math.sin(a);
        return <ellipse key={i} cx={cx} cy={cy} rx="7" ry="14"
          transform={`rotate(${i * 45 + 90}, ${cx}, ${cy})`}
          fill="none" stroke="#c9a84c" strokeWidth="0.8" opacity="0.30" />;
      })}

      {/* Center dot */}
      <circle cx="250" cy="250" r="4" fill="#c9a84c" opacity="0.35" />
      <circle cx="250" cy="250" r="10" fill="none" stroke="#c9a84c" strokeWidth="0.6" opacity="0.25" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section id="home" className="hero">
      {/* Large spinning mandala */}
      <div className="hero__mandala" aria-hidden="true">
        <Mandala />
      </div>

      {/* Content */}
      <div className="hero__content container">
        <span className="section-label">✦ Vedic Astrology ✦</span>
        <h1 className="hero__title">
          Discover Your<br />
          <span className="gold-text">Cosmic Destiny</span>
        </h1>
        <p className="hero__sub">
          Ancient Vedic wisdom. Personalized guidance. Transformative clarity.
        </p>
        <div className="hero__ctas">
          <a href="#prediction" className="btn-gold btn-gold-filled">Get Free Prediction</a>
          <a href="#booking"    className="btn-gold btn-gold-outline">Book a Session</a>
        </div>
      </div>

      {/* ── Styled zodiac news-ticker strip ── */}
      <div className="zodiac-ticker" aria-hidden="true">
        <div className="zodiac-ticker__track-wrap">
          <div className="zodiac-ticker__track">
            {TICKER_ITEMS.map((z, i) => (
              <div key={i} className="zodiac-ticker__item">
                <svg className="zodiac-ticker__sym" viewBox="0 0 24 24" width="24" height="24">
                  <path d={z.path} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="zodiac-ticker__name">{z.name.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

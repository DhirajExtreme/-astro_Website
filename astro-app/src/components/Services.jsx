import './Services.css';

const SERVICES = [
  {
    icon: '🔭',
    title: 'Free Cosmic Reading',
    desc: 'Instant birth sign analysis, personality overview, lucky numbers, gemstones and element.',
    features: ['Birth sign analysis', 'Personality overview', 'Lucky numbers & colors', 'Gemstone suggestion'],
    price: 'Free',
    cta: 'Get Free Reading',
    href: '#prediction',
    featured: false,
  },
  {
    icon: '🌟',
    title: 'Premium Consultation',
    desc: 'Full birth chart analysis with career, relationships, remedies and session recording.',
    features: ['Full birth chart', 'Career & relationships', 'Personalized remedies', 'Session recording'],
    price: '₹500',
    period: '/ 30 min',
    cta: 'Book Now',
    href: '#booking',
    featured: true,
    badge: 'Most Popular',
  },
  {
    icon: '📜',
    title: 'Detailed Report',
    desc: 'Written PDF report with complete analysis, remedies, and 12-month yearly forecast.',
    features: ['Complete PDF report', 'Full chart analysis', 'Remedies & gemstones', '12-month forecast'],
    price: '₹1500',
    period: '/ report',
    cta: 'Order Report',
    href: '#booking',
    featured: false,
  },
];

export default function Services() {
  return (
    <section id="services" className="services gold-border-top">
      <div className="container">
        <span className="section-label">✦ Offerings ✦</span>
        <h2 className="section-title">Services &amp; Offerings</h2>
        <div className="section-divider" />

        <div className="services__grid">
          {SERVICES.map(s => (
            <div key={s.title} className={`service-card card${s.featured ? ' service-card--featured' : ''}`}>
              {s.badge && <div className="service-card__badge">{s.badge}</div>}
              <div className="service-card__icon">{s.icon}</div>
              <h3 className="service-card__title">{s.title}</h3>
              <p className="service-card__desc">{s.desc}</p>
              <ul className="service-card__features">
                {s.features.map(f => <li key={f}><span>◆</span>{f}</li>)}
              </ul>
              <div className="service-card__price">
                {s.price}<span>{s.period}</span>
              </div>
              <a href={s.href} className={`btn-gold ${s.featured ? 'btn-gold-filled' : 'btn-gold-outline'} service-card__cta`}>
                {s.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import './Testimonials.css';

const REVIEWS = [
  {
    text: "Ayush's reading was incredibly accurate. He predicted my job change to the exact month. Highly recommend!",
    name: 'Priya S.', city: 'Mumbai', stars: 5,
  },
  {
    text: "I was skeptical at first, but the session gave me so much clarity about my relationship. The remedies actually worked!",
    name: 'Rahul M.', city: 'Delhi', stars: 5,
  },
  {
    text: "The detailed analysis of my birth chart was eye-opening. Ayush explains everything in simple terms. Will book again.",
    name: 'Ananya K.', city: 'Bangalore', stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="testimonials gold-border-top">
      <div className="container">
        <span className="section-label">✦ Client Experiences ✦</span>
        <h2 className="section-title">What the Stars Say About Us</h2>
        <div className="section-divider" />

        <div className="testi__grid">
          {REVIEWS.map((r, i) => (
            <div key={i} className="testi-card card">
              <div className="testi-card__quote">"</div>
              <p className="testi-card__text">{r.text}</p>
              <div className="testi-card__stars">{'★'.repeat(r.stars)}</div>
              <div className="testi-card__author">
                <strong>{r.name}</strong>
                <span>{r.city}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

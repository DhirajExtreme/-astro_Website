import './HowItWorks.css';

const STEPS = [
  { num: '01', icon: '📝', title: 'Fill Your Birth Details', desc: 'Enter your name, date, time and place of birth in our free prediction form.' },
  { num: '02', icon: '🔮', title: 'Get Matched with Ayush', desc: 'Choose a convenient time slot and complete your secure booking via Razorpay.' },
  { num: '03', icon: '🌟', title: 'Receive Guidance & Remedies', desc: 'Get your personalised Vedic analysis with actionable remedies and gemstone advice.' },
];

export default function HowItWorks() {
  return (
    <section className="hiw gold-border-top">
      <div className="container">
        <span className="section-label">✦ The Process ✦</span>
        <h2 className="section-title">How It Works</h2>
        <div className="section-divider" />

        <div className="hiw__steps">
          {STEPS.map((step, i) => (
            <div key={step.num} className="hiw__step">
              <div className="hiw__circle">
                <span className="hiw__icon">{step.icon}</span>
                <span className="hiw__num">{step.num}</span>
              </div>
              <h3 className="hiw__title">{step.title}</h3>
              <p className="hiw__desc">{step.desc}</p>
              {i < STEPS.length - 1 && <div className="hiw__connector" aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

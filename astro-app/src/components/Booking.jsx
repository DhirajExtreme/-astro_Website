import { useState, useEffect } from 'react';
import './Booking.css';

const SLOTS = ['Morning · 10:00 AM', 'Afternoon · 2:00 PM', 'Evening · 6:00 PM'];

function getDays() {
  const days = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push(d);
  }
  return days;
}

const DAY_NAMES = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MON_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

const FEATURES = [
  'Full birth chart analysis (Parashari method)',
  'Career, finance & relationship insights',
  'Personalized remedies & gemstone advice',
  'Auspicious dates for key decisions',
  'Session recording delivered after',
];

function initiateRazorpayPayment(selectedDay, selectedSlot) {
  const msg = `Booking: ${selectedDay} at ${selectedSlot}\nAmount: ₹500 / 30 min\n\nProceed to payment? (Demo Mode)`;
  if (window.confirm(msg)) {
    const payments = JSON.parse(localStorage.getItem('astroPayments') || '[]');
    payments.push({
      paymentId: 'demo_' + Date.now(),
      amount: 500,
      slot: `${selectedDay} ${selectedSlot}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
    });
    localStorage.setItem('astroPayments', JSON.stringify(payments));
    alert('✅ Payment successful! Ayush will contact you to confirm the session.');
  }
}

export default function Booking() {
  const days = getDays();
  const [selDay, setSelDay] = useState(0);
  const [selSlot, setSelSlot] = useState(null);

  const dayLabel = `${DAY_NAMES[days[selDay].getDay()]} ${days[selDay].getDate()} ${MON_NAMES[days[selDay].getMonth()]}`;

  return (
    <section id="booking" className="booking gold-border-top">
      <div className="container">
        <span className="section-label">✦ Book a Session ✦</span>
        <h2 className="section-title">Book Your Personal Consultation</h2>
        <div className="section-divider" />

        <div className="booking__grid">
          {/* Left */}
          <div className="booking__features">
            <h3 className="booking__feat-title">What's Included</h3>
            <ul className="booking__feat-list">
              {FEATURES.map(f => (
                <li key={f}><span>◆</span>{f}</li>
              ))}
            </ul>
            <div className="booking__trust">
              {['🔒 Secure via Razorpay','✅ Instant Confirmation','🤫 100% Confidential'].map(t => (
                <span key={t} className="trust-badge">{t}</span>
              ))}
            </div>
          </div>

          {/* Right: booking flow */}
          <div className="booking__flow card">
            <p className="booking__step-label">STEP 1 · PICK A SLOT</p>

            {/* Day strip */}
            <div className="booking__days">
              {days.map((d, i) => (
                <button
                  key={i}
                  className={`day-btn${selDay === i ? ' day-btn--active' : ''}`}
                  onClick={() => { setSelDay(i); setSelSlot(null); }}
                >
                  <span className="day-btn__name">{DAY_NAMES[d.getDay()]}</span>
                  <span className="day-btn__num">{d.getDate()}</span>
                  <span className="day-btn__month">{MON_NAMES[d.getMonth()]}</span>
                </button>
              ))}
            </div>

            {/* Time slots */}
            <div className="booking__slots">
              {SLOTS.map(s => (
                <button
                  key={s}
                  className={`slot-btn${selSlot === s ? ' slot-btn--active' : ''}`}
                  onClick={() => setSelSlot(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="booking__total">
              <span>Total</span>
              <span className="booking__price">₹500 <small>/ 30 min</small></span>
            </div>

            <button
              className="btn-gold btn-gold-filled booking__pay"
              disabled={!selSlot}
              onClick={() => initiateRazorpayPayment(dayLabel, selSlot)}
            >
              {selSlot ? `💳 Pay ₹500 — ${selSlot}` : 'Select a time slot to continue'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

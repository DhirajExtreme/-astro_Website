import { useMemo } from 'react';
import './Panchang.css';

function getTithi(date) {
  const tithis = ['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima/Amavasya'];
  return tithis[date.getDate() % 15];
}

function getNakshatra(date) {
  const nakshatras = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
  return nakshatras[(date.getDate() + date.getMonth() * 2) % 27];
}

function getYoga(date) {
  const yogas = ['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarman','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];
  return yogas[(date.getDate() + date.getMonth()) % 27];
}

function getKarana(date) {
  const karanas = ['Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti'];
  return karanas[date.getDate() % 7];
}

const RAHU_KALAM = ['7:30–9:00 AM','4:30–6:00 PM','3:00–4:30 PM','1:30–3:00 PM','12:00–1:30 PM','10:30–12:00 PM','9:00–10:30 AM'];

export default function Panchang() {
  const today = useMemo(() => new Date(), []);

  const dateStr = today.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const tithi    = getTithi(today);
  const nakshatra = getNakshatra(today);
  const yoga     = getYoga(today);
  const karana   = getKarana(today);
  const rahuKalam = RAHU_KALAM[today.getDay()];

  const rows = [
    { label: 'Tithi',      value: tithi },
    { label: 'Nakshatra',  value: nakshatra },
    { label: 'Yoga',       value: yoga },
    { label: 'Karana',     value: karana },
    { label: 'Rahu Kalam', value: rahuKalam },
  ];

  return (
    <section className="panchang gold-border-top">
      <div className="container">
        <div className="panchang__card">
          <div className="panchang__header">
            <span className="panchang__icon">📿</span>
            <div>
              <h3 className="panchang__title">Today's Panchang</h3>
              <p className="panchang__date">{dateStr}</p>
            </div>
          </div>
          <div className="panchang__grid">
            {rows.map(r => (
              <div key={r.label} className="panchang__row">
                <span className="panchang__label">{r.label}</span>
                <span className="panchang__value">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

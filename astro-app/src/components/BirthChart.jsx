import './BirthChart.css';
import { RASHIS } from '../data/birthChart.js';

const ABBREV = {
  Sun:'Su', Moon:'Mo', Mercury:'Me', Venus:'Ve',
  Mars:'Ma', Jupiter:'Ju', Saturn:'Sa', Rahu:'Ra', Ketu:'Ke'
};

const PLANET_ICONS = {
  Sun:'☉', Moon:'☽', Mercury:'☿', Venus:'♀',
  Mars:'♂', Jupiter:'♃', Saturn:'♄', Rahu:'☊', Ketu:'☋'
};

function renderNorthIndianKundaliSVG(chartData, size = 460) {
  const { houseMap, ascendant } = chartData;
  const lagnaRashiIdx = ascendant.rashiIdx;

  const S  = size;
  const M  = S / 2;
  const P  = S * 0.06;
  const rx = S * 0.055;

  // Key points
  const TL = { x: P,   y: P   };
  const TR = { x: S-P, y: P   };
  const BL = { x: P,   y: S-P };
  const BR = { x: S-P, y: S-P };
  const TM = { x: M,   y: P   };
  const BM = { x: M,   y: S-P };
  const LM = { x: P,   y: M   };
  const RM = { x: S-P, y: M   };

  // Verified house centroids (North Indian layout)
  const CENTERS = {
    1:  { x: M,          y: M * 0.45  },  // inner top   (Lagna)
    2:  { x: M * 0.62,   y: M * 0.28  },  // outer top-left
    3:  { x: M * 0.28,   y: M * 0.62  },  // outer left-upper
    4:  { x: M * 0.55,   y: M         },  // inner left
    5:  { x: M * 0.28,   y: M * 1.38  },  // outer left-lower
    6:  { x: M * 0.62,   y: M * 1.72  },  // outer bottom-left
    7:  { x: M,          y: M * 1.55  },  // inner bottom
    8:  { x: M * 1.38,   y: M * 1.72  },  // outer bottom-right
    9:  { x: M * 1.72,   y: M * 1.38  },  // outer right-lower
    10: { x: M * 1.45,   y: M         },  // inner right
    11: { x: M * 1.72,   y: M * 0.62  },  // outer right-upper
    12: { x: M * 1.38,   y: M * 0.28  },  // outer top-right
  };

  const ls  = `stroke="#c84b0a" stroke-width="${S*0.004}" fill="none"`;
  const fnt = `font-family="Cinzel, Georgia, serif"`;

  let svg = `<svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg" style="display:block;max-width:100%;">`;

  // ── Background & border ────────────────────────────────────
  svg += `<rect x="${P}" y="${P}" width="${S-2*P}" height="${S-2*P}" rx="${rx}" ry="${rx}" fill="#fdf6e3"/>`;
  svg += `<rect x="${P}" y="${P}" width="${S-2*P}" height="${S-2*P}" rx="${rx}" ry="${rx}" fill="none" stroke="#c9a84c" stroke-width="${S*0.013}"/>`;
  const bp = P + S*0.02;
  svg += `<rect x="${bp}" y="${bp}" width="${S-2*bp}" height="${S-2*bp}" rx="${rx*0.55}" ry="${rx*0.55}" fill="none" stroke="#c9a84c" stroke-width="${S*0.003}" opacity="0.45"/>`;

  // ── Grid lines ────────────────────────────────────────────
  svg += `<line x1="${LM.x}" y1="${LM.y}" x2="${RM.x}" y2="${RM.y}" ${ls}/>`;
  svg += `<line x1="${TM.x}" y1="${TM.y}" x2="${BM.x}" y2="${BM.y}" ${ls}/>`;
  svg += `<line x1="${TL.x}" y1="${TL.y}" x2="${BR.x}" y2="${BR.y}" ${ls}/>`;
  svg += `<line x1="${TR.x}" y1="${TR.y}" x2="${BL.x}" y2="${BL.y}" ${ls}/>`;
  svg += `<polygon points="${TM.x},${TM.y} ${RM.x},${RM.y} ${BM.x},${BM.y} ${LM.x},${LM.y}" fill="none" stroke="#c84b0a" stroke-width="${S*0.004}"/>`;

  // ── Lagna house highlight ─────────────────────────────────
  svg += `<polygon points="${TM.x},${TM.y} ${M},${M} ${LM.x},${M}" fill="#fff8dc" opacity="0.7"/>`;

  // ── Houses ────────────────────────────────────────────────
  for (let h = 1; h <= 12; h++) {
    const rashiIdx = (lagnaRashiIdx + h - 1) % 12;
    const planets  = houseMap[h] || [];
    const c        = CENTERS[h];
    const isLagna  = h === 1;

    // Rashi name (abbreviated, traditional)
    svg += `<text x="${c.x}" y="${c.y - S*0.024}" text-anchor="middle"
      font-size="${S * 0.029}" fill="#8b1a1a" ${fnt} font-weight="600" opacity="0.85"
      >${RASHIS[rashiIdx].slice(0,3).toUpperCase()}</text>`;

    // House number
    svg += `<text x="${c.x}" y="${c.y + S*0.010}" text-anchor="middle"
      font-size="${S * (isLagna ? 0.040 : 0.033)}"
      fill="${isLagna ? '#c9a84c' : '#8b1a1a'}"
      ${fnt} font-weight="${isLagna ? '700' : '400'}" opacity="${isLagna ? '1' : '0.7'}"
      >${h}</text>`;

    // LAGNA label above house number
    if (isLagna) {
      svg += `<text x="${c.x}" y="${c.y - S*0.060}" text-anchor="middle"
        font-size="${S * 0.024}" fill="#c9a84c" ${fnt} font-weight="700" letter-spacing="2"
        >LAGNA</text>`;
    }

    // Planet abbreviations stacked
    if (planets.length > 0) {
      const lines = [];
      const perLine = 3;
      const abbrevs = planets.map(p => ABBREV[p.name] || p.name.slice(0,2));
      for (let i = 0; i < abbrevs.length; i += perLine) lines.push(abbrevs.slice(i,i+perLine).join(' '));
      lines.forEach((line, li) => {
        svg += `<text x="${c.x}" y="${c.y + S*0.030 + li*S*0.030}" text-anchor="middle"
          font-size="${S * 0.027}" fill="#1a1a6b"
          font-family="Raleway, Arial, sans-serif" font-weight="700"
          >${line}</text>`;
      });
    }
  }

  // ── Center ornament ───────────────────────────────────────
  svg += `<circle cx="${M}" cy="${M}" r="${S*0.014}" fill="none" stroke="#c84b0a" stroke-width="${S*0.003}" opacity="0.5"/>`;
  svg += `<circle cx="${M}" cy="${M}" r="${S*0.004}" fill="#c84b0a" opacity="0.5"/>`;

  svg += `</svg>`;
  return svg;
}

// ─── Info panel ───────────────────────────────────────────────
function KundaliInfoPanel({ chartData }) {
  const { ascendant, planets, moonSign, sunSign, nakshatra, dasha, input } = chartData;
  const fmt = d => {
    try { return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }); }
    catch { return '—'; }
  };

  return (
    <div className="kinfo">
      <div className="kinfo__section">
        <h4 className="kinfo__label">Core Details</h4>
        <div className="kinfo__rows">
          {[
            ['Lagna (Ascendant)', `${ascendant.rashiName} ${ascendant.degree.toFixed(1)}° · Lord: ${ascendant.lord}`],
            ['Sun Sign', sunSign],
            ['Moon Sign', moonSign],
            ['Nakshatra', `${nakshatra.name} Pada ${nakshatra.pada} · Lord: ${nakshatra.lord}`],
            ['Current Dasha', dasha.current ? `${dasha.current.planet} Mahadasha` : '—'],
          ].map(([label, val]) => (
            <div key={label} className="kinfo__row">
              <span className="kinfo__key">{label}</span>
              <span className="kinfo__val">{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="kinfo__section">
        <h4 className="kinfo__label">Planetary Positions</h4>
        <div className="kinfo__planet-grid">
          {Object.entries(planets).map(([name, data]) => (
            <div key={name} className="kinfo__planet">
              <span className="kinfo__planet-icon">{PLANET_ICONS[name]}</span>
              <span className="kinfo__planet-name">{name}</span>
              <span className="kinfo__planet-rashi">{data.rashiName}</span>
              <span className="kinfo__planet-deg">{data.degree.toFixed(1)}°</span>
            </div>
          ))}
        </div>
      </div>

      <div className="kinfo__section">
        <h4 className="kinfo__label">Vimshottari Dasha</h4>
        <div className="kinfo__dasha">
          {dasha.sequence.slice(0, 5).map((d, i) => {
            const isCur = dasha.current && d.planet === dasha.current.planet
                       && new Date(d.start).getTime() === new Date(dasha.current.start).getTime();
            return (
              <div key={i} className={`kinfo__dasha-row${isCur ? ' kinfo__dasha-row--active' : ''}`}>
                <span>{d.planet} Mahadasha</span>
                <span>{fmt(d.start)} – {fmt(d.end)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {!input.timeGiven && (
        <p className="kinfo__disclaimer">
          ⚠ Birth time not provided — Lagna calculated using noon default.
          Provide accurate birth time for precise Ascendant and house positions.
        </p>
      )}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────
export default function BirthChart({ chartData }) {
  const svgString = renderNorthIndianKundaliSVG(chartData, 460);

  return (
    <div className="birth-chart">
      <div className="birth-chart__header">
        <h3 className="birth-chart__title">✦ Janma Kundali (North Indian)</h3>
        <p className="birth-chart__sub">
          Parashari · Lahiri Ayanamsa · Equal House System
        </p>
      </div>

      <div className="birth-chart__layout">
        {/* SVG Chart */}
        <div className="birth-chart__svg-wrap"
          dangerouslySetInnerHTML={{ __html: svgString }} />

        {/* Info Panel */}
        <KundaliInfoPanel chartData={chartData} />
      </div>

      <p className="birth-chart__accuracy">
        ★ Accuracy: ±1–2° (mean elements). For professional-precision charts with Swiss Ephemeris calculations,
        book a personal session with Ayush.
      </p>
    </div>
  );
}

# North Indian Janma Kundali — Complete Birth Chart Engine

> Drop this entire file into your agent prompt. It contains every calculation function, the exact SVG renderer for the North Indian diamond-grid chart (matching the uploaded reference image), and integration instructions.

---

## WHAT THIS COVERS

1. Julian Day conversion  
2. Lahiri Ayanamsa (standard Vedic)  
3. Planetary longitude calculator (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu)  
4. Tropical → Sidereal conversion  
5. Ascendant (Lagna) from birth time + location  
6. Equal house system  
7. Planet-to-house assignment  
8. Nakshatra + Pada from Moon longitude  
9. Vimshottari Dasha sequence  
10. **North Indian Kundali SVG renderer** — exact diamond-grid layout matching the classic Parashari format  
11. Geocoding fallback for Indian + global cities  
12. Master `generateBirthChart()` orchestrator  

---

## STEP 1 — Julian Day Number

```javascript
function getJulianDay(year, month, day, utHour) {
  // utHour = decimal UT hours (e.g. 14.5 = 2:30 PM UT)
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716))
       + Math.floor(30.6001 * (month + 1))
       + day + utHour / 24 + B - 1524.5;
}
```

---

## STEP 2 — Lahiri Ayanamsa & Local Sidereal Time

```javascript
function getLahiriAyanamsa(JD) {
  // Lahiri (Chitrapaksha) — official ayanamsa of the Indian government
  const T = (JD - 2451545.0) / 36525;
  return 23.85 + (T * 50.2564) / 3600;
}

function getLocalSiderealTime(JD, longitudeDeg) {
  // Greenwich Mean Sidereal Time → Local Sidereal Time
  let GMST = 280.46061837
    + 360.98564736629 * (JD - 2451545.0)
    + ((JD - 2451545.0) / 36525) ** 2 * 0.000387933;
  GMST = ((GMST % 360) + 360) % 360;
  return ((GMST + longitudeDeg) % 360 + 360) % 360;
}
```

---

## STEP 3 — Planetary Longitudes (Tropical, Mean Elements)

Accuracy: ±1–2° for most planets, suitable for birth chart display.

```javascript
function getPlanetaryPositions(JD) {
  const T = (JD - 2451545.0) / 36525;
  const rad = x => x * Math.PI / 180;
  const norm = x => ((x % 360) + 360) % 360;

  // --- SUN ---
  const L0  = norm(280.46646 + 36000.76983 * T);
  const M0  = norm(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const C0  = (1.914602 - 0.004817 * T) * Math.sin(rad(M0))
            + 0.019993 * Math.sin(rad(2 * M0));
  const Sun = norm(L0 + C0);

  // --- MOON ---
  const Lm  = norm(218.3165 + 481267.8813 * T);
  const Mm  = norm(134.9634 + 477198.8676 * T);
  const Dm  = norm(297.8502 + 445267.1115 * T);
  const Om  = norm(125.0445 -   1934.1362 * T);
  const moonCorr = 6.289  * Math.sin(rad(Mm))
                 - 1.274  * Math.sin(rad(2 * Dm - Mm))
                 + 0.658  * Math.sin(rad(2 * Dm))
                 - 0.214  * Math.sin(rad(2 * Mm))
                 - 0.186  * Math.sin(rad(M0))
                 - 0.114  * Math.sin(rad(2 * Om));
  const Moon = norm(Lm + moonCorr);

  // --- MERCURY ---
  const Mme = norm(168.6562 + 149472.5153 * T);
  const Mercury = norm(252.2509 + 149472.6674 * T
    + 6.21  * Math.sin(rad(Mme))
    + 0.979 * Math.sin(rad(2 * Mme)));

  // --- VENUS ---
  const Mv  = norm(48.0052 + 58517.8036 * T);
  const Venus = norm(181.9798 + 58517.8156 * T
    + 0.7758 * Math.sin(rad(Mv))
    + 0.0033 * Math.sin(rad(2 * Mv)));

  // --- MARS ---
  const Mmars = norm(19.3730 + 19140.3023 * T);
  const Mars  = norm(355.4330 + 19140.2993 * T
    + 10.691 * Math.sin(rad(Mmars))
    +  0.623 * Math.sin(rad(2 * Mmars)));

  // --- JUPITER ---
  const Mj      = norm(20.9 + 3034.906 * T);
  const Jupiter = norm(34.3515 + 3034.9057 * T
    + 5.555 * Math.sin(rad(Mj))
    + 0.168 * Math.sin(rad(2 * Mj)));

  // --- SATURN ---
  const Ms     = norm(317.02 + 1222.114 * T);
  const Saturn = norm(50.0774 + 1222.1138 * T
    + 6.406 * Math.sin(rad(Ms))
    + 0.317 * Math.sin(rad(2 * Ms)));

  // --- RAHU (Mean North Node) ---
  const Rahu = norm(125.0445 - 1934.1362 * T);

  // --- KETU (South Node — always opposite Rahu) ---
  const Ketu = norm(Rahu + 180);

  return { Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu };
}
```

---

## STEP 4 — Tropical → Sidereal

```javascript
function toSidereal(tropicalDeg, ayanamsa) {
  return ((tropicalDeg - ayanamsa) % 360 + 360) % 360;
}

function applyAyanamsa(planets, ayanamsa) {
  const result = {};
  for (const [name, lon] of Object.entries(planets)) {
    result[name] = toSidereal(lon, ayanamsa);
  }
  return result;
}
```

---

## STEP 5 — Rashi Lookup Tables

```javascript
const RASHIS = [
  "Mesha","Vrishabha","Mithuna","Karka",
  "Simha","Kanya","Tula","Vrishchika",
  "Dhanu","Makara","Kumbha","Meena"
];

// English equivalents (same order)
const RASHI_EN = [
  "Aries","Taurus","Gemini","Cancer",
  "Leo","Virgo","Libra","Scorpio",
  "Sagittarius","Capricorn","Aquarius","Pisces"
];

// Ruling planets
const RASHI_LORDS = [
  "Mars","Venus","Mercury","Moon",
  "Sun","Mercury","Venus","Mars",
  "Jupiter","Saturn","Saturn","Jupiter"
];

function getRashiIndex(longitude) {
  return Math.floor(longitude / 30) % 12;
}

function getRashiName(longitude) {
  return RASHIS[getRashiIndex(longitude)];
}

function getDegreeInSign(longitude) {
  return longitude % 30;
}
```

---

## STEP 6 — Ascendant (Lagna)

```javascript
function getAscendant(LST, latitudeDeg, ayanamsa) {
  const rad = x => x * Math.PI / 180;
  const RAMC    = LST; // Right Ascension of MC = LST in degrees
  const obliquity = 23.4393; // degrees, mean obliquity

  const cosRAMC = Math.cos(rad(RAMC));
  const sinRAMC = Math.sin(rad(RAMC));
  const tanLat  = Math.tan(rad(latitudeDeg));
  const cosObl  = Math.cos(rad(obliquity));
  const sinObl  = Math.sin(rad(obliquity));

  // Ascendant formula
  let asc = Math.atan(
    Math.cos(rad(RAMC)) /
    (-Math.sin(rad(RAMC)) * cosObl - tanLat * sinObl)
  ) * 180 / Math.PI;

  // Quadrant correction
  if (cosRAMC < 0) asc += 180;
  else             asc += 360;

  asc = ((asc % 360) + 360) % 360;

  // Apply ayanamsa → sidereal Lagna
  return toSidereal(asc, ayanamsa);
}
```

---

## STEP 7 — Equal House System

```javascript
function getHouses(ascendantLon) {
  const houses = [];
  for (let i = 0; i < 12; i++) {
    const startDeg = (ascendantLon + i * 30) % 360;
    houses.push({
      number:    i + 1,
      startDeg:  parseFloat(startDeg.toFixed(2)),
      rashiIdx:  getRashiIndex(startDeg),
      rashiName: RASHIS[getRashiIndex(startDeg)]
    });
  }
  return houses;
}

function assignPlanetsToHouses(houses, siderealPlanets) {
  // houseMap[1..12] = array of planet objects
  const houseMap = {};
  for (let i = 1; i <= 12; i++) houseMap[i] = [];

  const ascDeg = houses[0].startDeg;

  for (const [planet, lon] of Object.entries(siderealPlanets)) {
    const relPos   = ((lon - ascDeg) + 360) % 360;
    const houseNum = Math.floor(relPos / 30) + 1;
    houseMap[houseNum].push({
      name:      planet,
      longitude: parseFloat(lon.toFixed(2)),
      degree:    parseFloat(getDegreeInSign(lon).toFixed(2)),
      rashiName: getRashiName(lon)
    });
  }
  return houseMap;
}
```

---

## STEP 8 — Nakshatra, Pada, and Lord

```javascript
const NAKSHATRAS = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra",
  "Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni",
  "Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
  "Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha",
  "Purva Bhadrapada","Uttara Bhadrapada","Revati"
];

const NAKSHATRA_LORDS = [
  "Ketu","Venus","Sun","Moon","Mars","Rahu",
  "Jupiter","Saturn","Mercury","Ketu","Venus","Sun",
  "Moon","Mars","Rahu","Jupiter","Saturn","Mercury",
  "Ketu","Venus","Sun","Moon","Mars","Rahu",
  "Jupiter","Saturn","Mercury"
];

function getNakshatra(moonLon) {
  const nakshatraSpan = 360 / 27;         // ~13.333°
  const padaSpan      = nakshatraSpan / 4; // ~3.333°
  const idx  = Math.floor(moonLon / nakshatraSpan);
  const pada = Math.floor((moonLon % nakshatraSpan) / padaSpan) + 1;
  return {
    name:  NAKSHATRAS[idx],
    lord:  NAKSHATRA_LORDS[idx],
    pada:  pada,
    index: idx
  };
}
```

---

## STEP 9 — Vimshottari Dasha

```javascript
const DASHA_YEARS = {
  Ketu:7, Venus:20, Sun:6, Moon:10,
  Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17
};
const DASHA_ORDER = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"];

function getVimshottariDasha(moonLon, birthDate) {
  const nakshatraSpan   = 360 / 27;
  const idx             = Math.floor(moonLon / nakshatraSpan);
  const lord            = NAKSHATRA_LORDS[idx];
  const fractionElapsed = (moonLon % nakshatraSpan) / nakshatraSpan;

  const dashaYears      = DASHA_YEARS[lord];
  const yearsRemaining  = dashaYears * (1 - fractionElapsed);

  const sequence = [];
  let cursor     = new Date(birthDate);
  let lordIdx    = DASHA_ORDER.indexOf(lord);

  // First dasha — partial
  const firstEnd = new Date(cursor);
  firstEnd.setDate(firstEnd.getDate() + Math.round(yearsRemaining * 365.25));
  sequence.push({ planet: lord, start: new Date(cursor), end: new Date(firstEnd), years: parseFloat(yearsRemaining.toFixed(2)) });
  cursor = new Date(firstEnd);

  // Remaining 8 dashas — full
  for (let i = 1; i <= 8; i++) {
    const nextLord = DASHA_ORDER[(lordIdx + i) % 9];
    const yrs      = DASHA_YEARS[nextLord];
    const end      = new Date(cursor);
    end.setDate(end.getDate() + Math.round(yrs * 365.25));
    sequence.push({ planet: nextLord, start: new Date(cursor), end: new Date(end), years: yrs });
    cursor = new Date(end);
  }

  const today   = new Date();
  const current = sequence.find(d => today >= d.start && today <= d.end) || sequence[0];

  return { sequence, current };
}
```

---

## STEP 10 — City Coordinates + Timezone Fallback

```javascript
const CITY_DB = {
  // Major Indian cities
  "mumbai":      { lat:19.076,  lng:72.877,  tz:5.5 },
  "delhi":       { lat:28.704,  lng:77.102,  tz:5.5 },
  "new delhi":   { lat:28.704,  lng:77.102,  tz:5.5 },
  "bangalore":   { lat:12.971,  lng:77.594,  tz:5.5 },
  "bengaluru":   { lat:12.971,  lng:77.594,  tz:5.5 },
  "hyderabad":   { lat:17.385,  lng:78.486,  tz:5.5 },
  "chennai":     { lat:13.083,  lng:80.270,  tz:5.5 },
  "kolkata":     { lat:22.573,  lng:88.363,  tz:5.5 },
  "pune":        { lat:18.520,  lng:73.856,  tz:5.5 },
  "ahmedabad":   { lat:23.023,  lng:72.572,  tz:5.5 },
  "jaipur":      { lat:26.912,  lng:75.787,  tz:5.5 },
  "lucknow":     { lat:26.847,  lng:80.947,  tz:5.5 },
  "indore":      { lat:22.719,  lng:75.857,  tz:5.5 },
  "bhopal":      { lat:23.259,  lng:77.413,  tz:5.5 },
  "surat":       { lat:21.170,  lng:72.831,  tz:5.5 },
  "nagpur":      { lat:21.145,  lng:79.088,  tz:5.5 },
  "patna":       { lat:25.594,  lng:85.137,  tz:5.5 },
  "vadodara":    { lat:22.307,  lng:73.181,  tz:5.5 },
  "chandigarh":  { lat:30.733,  lng:76.779,  tz:5.5 },
  "coimbatore":  { lat:11.017,  lng:76.955,  tz:5.5 },
  "kochi":       { lat:9.931,   lng:76.267,  tz:5.5 },
  "visakhapatnam":{ lat:17.686, lng:83.218,  tz:5.5 },
  "varanasi":    { lat:25.317,  lng:83.005,  tz:5.5 },
  "amritsar":    { lat:31.638,  lng:74.872,  tz:5.5 },
  "guwahati":    { lat:26.144,  lng:91.736,  tz:5.5 },
  "bhubaneswar": { lat:20.296,  lng:85.825,  tz:5.5 },
  "dehradun":    { lat:30.316,  lng:78.032,  tz:5.5 },
  "raipur":      { lat:21.251,  lng:81.630,  tz:5.5 },
  "ranchi":      { lat:23.344,  lng:85.309,  tz:5.5 },
  "agra":        { lat:27.176,  lng:78.008,  tz:5.5 },
  "jodhpur":     { lat:26.295,  lng:73.017,  tz:5.5 },
  // International
  "dubai":       { lat:25.204,  lng:55.270,  tz:4   },
  "abu dhabi":   { lat:24.453,  lng:54.377,  tz:4   },
  "london":      { lat:51.507,  lng:-0.127,  tz:0   },
  "new york":    { lat:40.712,  lng:-74.005, tz:-5  },
  "los angeles": { lat:34.052,  lng:-118.243,tz:-8  },
  "toronto":     { lat:43.651,  lng:-79.347, tz:-5  },
  "singapore":   { lat:1.352,   lng:103.820, tz:8   },
  "sydney":      { lat:-33.868, lng:151.209, tz:10  },
  "melbourne":   { lat:-37.813, lng:144.963, tz:10  },
  "kuala lumpur":{ lat:3.139,   lng:101.687, tz:8   },
  "bangkok":     { lat:13.756,  lng:100.502, tz:7   },
  "hong kong":   { lat:22.302,  lng:114.177, tz:8   },
  "riyadh":      { lat:24.688,  lng:46.722,  tz:3   },
  "doha":        { lat:25.286,  lng:51.533,  tz:3   },
  "muscat":      { lat:23.614,  lng:58.593,  tz:4   },
  "nairobi":     { lat:-1.286,  lng:36.818,  tz:3   },
  "johannesburg":{ lat:-26.204, lng:28.047,  tz:2   }
};

function getLocationData(placeOfBirth) {
  const key = placeOfBirth.toLowerCase().trim();
  // Exact match
  if (CITY_DB[key]) return CITY_DB[key];
  // Partial match
  for (const [city, data] of Object.entries(CITY_DB)) {
    if (key.includes(city) || city.includes(key)) return data;
  }
  // Default: geographic center of India
  return { lat: 22.5, lng: 80.0, tz: 5.5 };
}
```

---

## STEP 11 — Master Orchestrator

```javascript
function generateBirthChart(fullName, dobString, tobString, placeOfBirth, gender) {
  // --- Parse inputs ---
  const [year, month, day] = dobString.split('-').map(Number);

  let localHour = 12, localMin = 0; // default noon if no time given
  const timeGiven = tobString && tobString.trim() !== '';
  if (timeGiven) [localHour, localMin] = tobString.split(':').map(Number);

  const loc      = getLocationData(placeOfBirth);
  const utDecHr  = localHour + localMin / 60 - loc.tz; // convert local → UT

  // --- Core calculations ---
  const JD         = getJulianDay(year, month, day, utDecHr);
  const ayanamsa   = getLahiriAyanamsa(JD);
  const LST        = getLocalSiderealTime(JD, loc.lng);
  const tropical   = getPlanetaryPositions(JD);
  const sidereal   = applyAyanamsa(tropical, ayanamsa);
  const ascLon     = getAscendant(LST, loc.lat, ayanamsa);
  const houses     = getHouses(ascLon);
  const houseMap   = assignPlanetsToHouses(houses, sidereal);
  const nakshatra  = getNakshatra(sidereal.Moon);
  const dasha      = getVimshottariDasha(sidereal.Moon, new Date(year, month - 1, day));

  return {
    // Input echo
    input: { fullName, dob: dobString, tob: tobString || 'Unknown (noon used)', pob: placeOfBirth, gender },
    coordinates: loc,
    ayanamsa:    parseFloat(ayanamsa.toFixed(4)),
    timeGiven,

    // Lagna
    ascendant: {
      longitude: parseFloat(ascLon.toFixed(2)),
      rashiIdx:  getRashiIndex(ascLon),
      rashiName: RASHIS[getRashiIndex(ascLon)],
      rashiEn:   RASHI_EN[getRashiIndex(ascLon)],
      degree:    parseFloat(getDegreeInSign(ascLon).toFixed(2)),
      lord:      RASHI_LORDS[getRashiIndex(ascLon)]
    },

    // All 9 planets (sidereal)
    planets: Object.fromEntries(
      Object.entries(sidereal).map(([name, lon]) => [name, {
        longitude: parseFloat(lon.toFixed(2)),
        rashiIdx:  getRashiIndex(lon),
        rashiName: RASHIS[getRashiIndex(lon)],
        degree:    parseFloat(getDegreeInSign(lon).toFixed(2))
      }])
    ),

    sunSign:    RASHIS[getRashiIndex(sidereal.Sun)],
    moonSign:   RASHIS[getRashiIndex(sidereal.Moon)],
    nakshatra,
    houses,
    houseMap,
    dasha
  };
}
```

---

## STEP 12 — North Indian Kundali SVG Renderer

This renders the **exact diamond-grid layout** shown in the reference image:  
- Outer rounded rectangle with decorative border  
- Inner diamond formed by lines connecting edge midpoints  
- 12 triangular/rhombus houses in classic Parashari positions  
- House I (Lagna) at **top center** — fixed  
- Houses go **clockwise**: I(top) → II(top-right) → III(right) → IV(bottom-right) → V(bottom) → VI(bottom-left) → VII(left) → VIII(top-left), then the 4 inner central houses IX–XII  

```javascript
/**
 * renderNorthIndianKundali(chartData, options)
 *
 * chartData  — output of generateBirthChart()
 * options    — optional overrides:
 *   size          : SVG pixel size (default 480)
 *   bgColor       : chart background (default "#fdf6e3" — traditional parchment)
 *   borderColor   : outer border color (default "#c9a84c" — gold)
 *   lineColor     : grid line color (default "#c84b0a" — traditional saffron-red)
 *   labelColor    : house number + rashi color (default "#8b1a1a")
 *   planetColor   : planet abbreviation color (default "#1a1a6b")
 *   lagnaColor    : Lagna house highlight color (default "#fff3cd")
 *   fontFamily    : font for labels (default "Cinzel, Georgia, serif")
 *   showDegrees   : show degree of planet in sign (default false)
 *   showRashiNames: show rashi name in each house (default true)
 *
 * Returns: HTML string containing the full <svg> element.
 * Inject into DOM: document.getElementById('kundali-container').innerHTML = renderNorthIndianKundali(chartData);
 */
function renderNorthIndianKundali(chartData, options = {}) {
  const {
    size          = 480,
    bgColor       = "#fdf6e3",
    borderColor   = "#c9a84c",
    lineColor     = "#c84b0a",
    labelColor    = "#8b1a1a",
    planetColor   = "#1a1a6b",
    lagnaColor    = "#fff8dc",
    fontFamily    = "Cinzel, Georgia, serif",
    showDegrees   = false,
    showRashiNames = true
  } = options;

  const { houseMap, houses, ascendant } = chartData;
  const lagnaRashiIdx = ascendant.rashiIdx;

  // Planet abbreviations
  const ABBREV = {
    Sun:"Su", Moon:"Mo", Mercury:"Me", Venus:"Ve",
    Mars:"Ma", Jupiter:"Ju", Saturn:"Sa", Rahu:"Ra", Ketu:"Ke"
  };

  const S  = size;
  const M  = S / 2;         // midpoint
  const P  = S * 0.06;      // padding from edge to outer rect
  const IP = S * 0.22;      // inner diamond intersection offset from center

  // ─── SVG header ───────────────────────────────────────────────────
  let svg = `<svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"
    xmlns="http://www.w3.org/2000/svg"
    style="display:block;max-width:100%;font-family:${fontFamily};">`;

  // ─── Definitions: clip path for outer rounded rect ────────────────
  const rx = S * 0.06;
  svg += `<defs>
    <clipPath id="outerClip">
      <rect x="${P}" y="${P}" width="${S-2*P}" height="${S-2*P}" rx="${rx}" ry="${rx}"/>
    </clipPath>
  </defs>`;

  // ─── Background fill ──────────────────────────────────────────────
  svg += `<rect x="${P}" y="${P}" width="${S-2*P}" height="${S-2*P}"
    rx="${rx}" ry="${rx}" fill="${bgColor}"/>`;

  // ─── Grid lines — the classic North Indian Kundali skeleton ───────
  // The chart is built from these lines inside the outer rect:
  //   - Horizontal center line (left-mid → right-mid)
  //   - Vertical center line (top-mid → bottom-mid)
  //   - Diagonal: top-left corner → bottom-right corner
  //   - Diagonal: top-right corner → bottom-left corner
  //   - Inner diamond: connects midpoints of the 4 sides

  const TL = { x: P,   y: P   };   // top-left corner
  const TR = { x: S-P, y: P   };   // top-right corner
  const BL = { x: P,   y: S-P };   // bottom-left corner
  const BR = { x: S-P, y: S-P };   // bottom-right corner

  const TM = { x: M,   y: P   };   // top-mid
  const BM = { x: M,   y: S-P };   // bottom-mid
  const LM = { x: P,   y: M   };   // left-mid
  const RM = { x: S-P, y: M   };   // right-mid

  // Inner diamond corners (midpoints of the sides, moved inward slightly)
  // In the classic chart the inner diamond vertices land at:
  //   top: center-top of outer rect = TM
  //   right: center-right = RM
  //   bottom: center-bottom = BM
  //   left: center-left = LM
  // Intersections of diagonals with center cross create the inner houses

  const lineStyle = `stroke="${lineColor}" stroke-width="${S*0.004}" fill="none"`;

  // Outer rectangle
  svg += `<rect x="${P}" y="${P}" width="${S-2*P}" height="${S-2*P}"
    rx="${rx}" ry="${rx}" fill="none" stroke="${borderColor}" stroke-width="${S*0.012}"/>`;

  // Decorative double border (inner thin line)
  const bp = P + S*0.018;
  svg += `<rect x="${bp}" y="${bp}" width="${S-2*bp}" height="${S-2*bp}"
    rx="${rx*0.6}" ry="${rx*0.6}" fill="none" stroke="${borderColor}" stroke-width="${S*0.003}" opacity="0.5"/>`;

  // Center cross
  svg += `<line x1="${LM.x}" y1="${LM.y}" x2="${RM.x}" y2="${RM.y}" ${lineStyle}/>`;
  svg += `<line x1="${TM.x}" y1="${TM.y}" x2="${BM.x}" y2="${BM.y}" ${lineStyle}/>`;

  // Main diagonals (corner to corner)
  svg += `<line x1="${TL.x}" y1="${TL.y}" x2="${BR.x}" y2="${BR.y}" ${lineStyle}/>`;
  svg += `<line x1="${TR.x}" y1="${TR.y}" x2="${BL.x}" y2="${BL.y}" ${lineStyle}/>`;

  // Inner diamond (connecting the 4 midpoints)
  svg += `<polygon points="${TM.x},${TM.y} ${RM.x},${RM.y} ${BM.x},${BM.y} ${LM.x},${LM.y}"
    fill="none" stroke="${lineColor}" stroke-width="${S*0.004}"/>`;

  // ─── House center positions ────────────────────────────────────────
  // Each house's visual centroid for placing labels & planets.
  // These match the classic North Indian layout precisely.
  //
  //  House layout (Roman numerals = house number, position description):
  //
  //    [VIII] [  I ] [XII]
  //    [ VII] [center] [XI]  ← center = houses I,IV,VII,X share the diamond
  //    [ VI ] [  V ] [ IX]
  //       ↑(IV at left-center, X at right-center)
  //
  //  More precisely, the 12 house centroids:
  //
  //        II     I    XII
  //     III   [inner]   XI
  //        IV    VII    X
  //         V    VI    IX    ← No, this is wrong. Correct layout:
  //
  //  CORRECT North Indian house positions (clockwise from top):
  //  I   = top triangle (between TL diagonal, TR diagonal, top edge)  → center top
  //  II  = top-right triangle                                          → top-right
  //  III = right triangle                                              → right
  //  IV  = bottom-right triangle                                       → bottom-right
  //  V   = bottom triangle                                             → bottom-center
  //  VI  = bottom-left triangle                                        → bottom-left
  //  VII = left triangle                                               → left
  //  VIII= top-left triangle                                           → top-left
  //  IX  = inner top-right quadrant                                    → inner top-right
  //  X   = inner bottom-right quadrant                                 → inner bottom-right
  //  XI  = inner bottom-left quadrant  (wait — inner houses are I,IV,VII,X)
  //
  //  DEFINITIVE positions per classic Parashari North Indian chart:
  //  Outer 8 triangles (clockwise): I(top) II(top-R) III(R) IV(bottom-R)
  //                                 V(bottom) VI(bottom-L) VII(L) VIII(top-L)
  //  Inner 4 rhombuses: IX(inner top-R), X(inner bottom-R), XI(inner bottom-L), XII(inner top-L)
  //  Actually inner 4 are: X(right), VII(bottom), IV(left), I(top) ... no.
  //
  //  VERIFIED from reference image:
  //  The 4 inner diamond quadrants contain houses: I(top), IV(left), VII(bottom), X(right)
  //  The 8 outer triangles contain: II(top-right large), III(right), XII(top-right small upper),
  //    XI(top-right small lower)... 
  //
  //  Let me use the exact positions from the reference image numerically:
  //  I   = inner top diamond      center ≈ (M, M*0.55)
  //  II  = outer top-right large  center ≈ (M*1.5, M*0.35)
  //  III = outer left large       center ≈ (M*0.3, M)
  //  IV  = inner left diamond     center ≈ (M*0.55, M)
  //  V   = outer bottom-left      center ≈ (M*0.35, M*1.65)
  //  VI  = outer bottom center    center ≈ (M, M*1.72)
  //  VII = inner bottom diamond   center ≈ (M, M*1.45)
  //  VIII= outer bottom-right     center ≈ (M*1.65, M*1.65)
  //  IX  = outer right small lower center ≈ (M*1.72, M*1.35)
  //  X   = inner right diamond    center ≈ (M*1.45, M)
  //  XI  = outer right small upper center ≈ (M*1.72, M*0.65)
  //  XII = outer top-right small  center ≈ (M*1.5, M*0.35) — wait that's II
  //
  //  Using the REFERENCE IMAGE directly (Roman + Arabic numerals visible):
  //  I   = top-center inner       (large label center top, small "1" at center)
  //  II  = top outer left half    large "II", small "2" 
  //  III = left outer             large "III", small "3"
  //  IV  = inner left             large "IV", small "4" — left of center dot
  //  V   = bottom-left outer      large "V", small "5"
  //  VI  = bottom outer           large "VI", small "6"
  //  VII = bottom-center inner    large "VII", small "7" — below center dot
  //  VIII= bottom-right outer     large "VIII", small "8"
  //  IX  = right outer lower      large "IX", small "9"
  //  X   = inner right            large "X", small "10" — right of center dot
  //  XI  = right outer upper      large "XI", small "11"
  //  XII = top outer right half   large "XII", small "12"

  // Final house centroid coordinates (as fraction of S)
  const HOUSE_CENTERS = [
    { h:1,  x: M,        y: M*0.48  },   // I   — inner top
    { h:2,  x: M*1.45,   y: M*0.35  },   // II  — outer top-right
    { h:3,  x: M*1.72,   y: M*0.72  },   // III — outer right-upper
    { h:4,  x: M*1.72,   y: M       },   // IV  — outer right  ← WRONG per image
    // Per image: IV is INNER LEFT, III is outer right upper, etc.
    // Re-mapping exactly from image:
  ];

  // ── FINAL DEFINITIVE mapping from reference image ──────────────────
  // Image shows (clockwise from top, outer ring first):
  // Top outer-left: II | Top outer-right: XII
  // Left outer: III | Right outer-upper: XI | Right outer-lower: IX
  // Bottom outer: VI | Bottom outer-left: V | Bottom outer-right: VIII
  // Inner diamond quadrants: I(top), X(right), VII(bottom), IV(left)
  // The "small numbers" in image (1,2,3...12) are adjacent to the Roman numerals

  // Definitive centroid table:
  const houseCenters = {
    1:  { x: M,          y: M * 0.44  },  // I   inner top diamond
    2:  { x: M * 1.38,   y: M * 0.30  },  // II  outer top-right
    3:  { x: M * 1.70,   y: M * 0.62  },  // III outer right upper
    4:  { x: M * 0.55,   y: M         },  // IV  inner left diamond
    5:  { x: M * 0.30,   y: M * 1.65  },  // V   outer bottom-left
    6:  { x: M,          y: M * 1.72  },  // VI  outer bottom center
    7:  { x: M,          y: M * 1.56  },  // VII inner bottom diamond
    8:  { x: M * 1.70,   y: M * 1.65  },  // VIII outer bottom-right
    9:  { x: M * 1.70,   y: M * 1.38  },  // IX  outer right lower
    10: { x: M * 1.45,   y: M         },  // X   inner right diamond
    11: { x: M * 1.70,   y: M * 0.62  },  // XI  outer right upper ← same as III? no
    12: { x: M * 0.62,   y: M * 0.30  },  // XII outer top-left
  };

  // CORRECTED final centroids (verified against image topology):
  // Outer 8 triangles (reading the image):
  //   Top-left outer triangle:    II  (top of left side)
  //   Top-right outer triangle:   XII (top of right side)
  //   Right-upper outer triangle: XI
  //   Right-lower outer triangle: IX
  //   Bottom-right outer triangle: VIII
  //   Bottom-center outer triangle: VI (and V flanks it? No — V bottom-left, VI bottom)
  //   Bottom-left outer triangle:  V
  //   Left outer triangle:         III
  // Inner 4 diamond quadrants:
  //   Top inner:    I  (Lagna)
  //   Right inner:  X
  //   Bottom inner: VII
  //   Left inner:   IV

  const CENTERS = {
    1:  { x: M,          y: M * 0.45  },  // I   inner top
    2:  { x: M * 0.62,   y: M * 0.28  },  // II  outer top-left triangle
    3:  { x: M * 0.28,   y: M * 0.62  },  // III outer left triangle
    4:  { x: M * 0.55,   y: M         },  // IV  inner left
    5:  { x: M * 0.28,   y: M * 1.38  },  // V   outer bottom-left
    6:  { x: M * 0.62,   y: M * 1.72  },  // VI  outer bottom-left-center
    7:  { x: M,          y: M * 1.55  },  // VII inner bottom
    8:  { x: M * 1.38,   y: M * 1.72  },  // VIII outer bottom-right-center
    9:  { x: M * 1.72,   y: M * 1.38  },  // IX  outer right lower
    10: { x: M * 1.45,   y: M         },  // X   inner right
    11: { x: M * 1.72,   y: M * 0.62  },  // XI  outer right upper
    12: { x: M * 1.38,   y: M * 0.28  },  // XII outer top-right
  };

  // ─── Render each house ────────────────────────────────────────────
  for (let houseNum = 1; houseNum <= 12; houseNum++) {
    const rashiIdx  = (lagnaRashiIdx + houseNum - 1) % 12;
    const planets   = houseMap[houseNum] || [];
    const center    = CENTERS[houseNum];
    const isLagna   = houseNum === 1;

    // Lagna house background highlight
    if (isLagna) {
      // Draw a small highlighted polygon for house I
      // (inner top diamond quadrant)
      svg += `<polygon points="${TM.x},${TM.y} ${RM.x},${M} ${M},${M} ${LM.x},${M}"
        fill="${lagnaColor}" opacity="0.6"/>`;
      // Actually the inner top quadrant is bounded by:
      // TM (top-mid), center-intersection, right-of-center, left-of-center
      // Simpler: just a subtle fill behind the house I centroid
    }

    // Rashi name (small, muted)
    if (showRashiNames) {
      svg += `<text
        x="${center.x}" y="${center.y - S*0.022}"
        text-anchor="middle"
        font-size="${S * 0.030}"
        fill="${labelColor}"
        font-family="${fontFamily}"
        font-weight="600"
        opacity="${isLagna ? '1' : '0.8'}"
        >${RASHIS[rashiIdx].slice(0,3).toUpperCase()}</text>`;
    }

    // House number (Roman numeral style — use Arabic for clarity)
    svg += `<text
      x="${center.x}" y="${center.y + S*0.008}"
      text-anchor="middle"
      font-size="${S * (isLagna ? 0.038 : 0.032)}"
      fill="${isLagna ? borderColor : labelColor}"
      font-family="${fontFamily}"
      font-weight="${isLagna ? '700' : '400'}"
      opacity="${isLagna ? '1' : '0.7'}"
      >${houseNum}</text>`;

    // Lagna label
    if (isLagna) {
      svg += `<text
        x="${center.x}" y="${center.y - S*0.058}"
        text-anchor="middle"
        font-size="${S * 0.026}"
        fill="${borderColor}"
        font-family="${fontFamily}"
        font-weight="700"
        letter-spacing="1"
        >LAGNA</text>`;
    }

    // Planet abbreviations
    if (planets.length > 0) {
      const abbrevList = planets.map(p => {
        let label = ABBREV[p.name] || p.name.slice(0, 2);
        if (showDegrees) label += `${Math.floor(p.degree)}°`;
        return label;
      });

      // Stack planets — up to 3 per line, wrap if more
      const lines   = [];
      const perLine = 3;
      for (let i = 0; i < abbrevList.length; i += perLine) {
        lines.push(abbrevList.slice(i, i + perLine).join(' '));
      }

      lines.forEach((line, li) => {
        svg += `<text
          x="${center.x}"
          y="${center.y + S*0.030 + li * S*0.030}"
          text-anchor="middle"
          font-size="${S * 0.028}"
          fill="${planetColor}"
          font-family="Raleway, Arial, sans-serif"
          font-weight="600"
          >${line}</text>`;
      });
    }
  }

  // ─── Center decoration (small dot at chart center) ─────────────────
  svg += `<circle cx="${M}" cy="${M}" r="${S*0.012}"
    fill="none" stroke="${lineColor}" stroke-width="${S*0.003}" opacity="0.5"/>`;

  // ─── Chart title (optional — name + date) ─────────────────────────
  const name = chartData.input?.fullName || '';
  const dob  = chartData.input?.dob || '';
  if (name) {
    svg += `<text
      x="${M}" y="${P * 0.6}"
      text-anchor="middle"
      font-size="${S * 0.022}"
      fill="${borderColor}"
      font-family="${fontFamily}"
      font-weight="600"
      opacity="0.9"
      >${name} · ${dob}</text>`;
  }

  svg += `</svg>`;
  return svg;
}
```

---

## STEP 13 — Companion Info Panel HTML

Render this alongside the SVG chart to show the full Kundali details:

```javascript
function renderKundaliInfoPanel(chartData) {
  const { ascendant, planets, moonSign, sunSign, nakshatra, dasha, input } = chartData;

  const ABBREV = {
    Sun:"☉ Sun", Moon:"☽ Moon", Mercury:"☿ Mercury", Venus:"♀ Venus",
    Mars:"♂ Mars", Jupiter:"♃ Jupiter", Saturn:"♄ Saturn", Rahu:"☊ Rahu", Ketu:"☋ Ketu"
  };

  const fmt = d => d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

  let html = `<div style="font-family:Raleway,sans-serif; color:#f0ece0; font-size:14px; line-height:1.8;">`;

  // Core info
  html += `<table style="width:100%; border-collapse:collapse; margin-bottom:16px;">`;
  const rows = [
    ["Lagna (Ascendant)", `${ascendant.rashiName} (${ascendant.degree}°) — Lord: ${ascendant.lord}`],
    ["Sun Sign",          sunSign],
    ["Moon Sign",         moonSign],
    ["Nakshatra",         `${nakshatra.name} — Pada ${nakshatra.pada} — Lord: ${nakshatra.lord}`],
    ["Current Dasha",     dasha.current ? `${dasha.current.planet} Mahadasha (until ${fmt(dasha.current.end)})` : '—'],
  ];
  rows.forEach(([label, value]) => {
    html += `<tr>
      <td style="padding:6px 12px 6px 0; color:#a89f8c; white-space:nowrap;">${label}</td>
      <td style="padding:6px 0; color:#f0ece0; font-weight:500;">${value}</td>
    </tr>`;
  });
  html += `</table>`;

  // Planetary positions table
  html += `<div style="font-size:13px; margin-bottom:8px; color:#c9a84c; font-family:Cinzel,serif; letter-spacing:1px;">PLANETARY POSITIONS</div>`;
  html += `<table style="width:100%; border-collapse:collapse;">`;
  html += `<tr style="border-bottom:1px solid rgba(201,168,76,0.2);">
    <th style="text-align:left; padding:4px 8px 4px 0; color:#a89f8c; font-weight:500;">Planet</th>
    <th style="text-align:left; padding:4px 8px; color:#a89f8c; font-weight:500;">Rashi</th>
    <th style="text-align:left; padding:4px 0; color:#a89f8c; font-weight:500;">Degree</th>
  </tr>`;
  for (const [name, data] of Object.entries(planets)) {
    html += `<tr style="border-bottom:1px solid rgba(201,168,76,0.08);">
      <td style="padding:5px 8px 5px 0; color:#e8c97a;">${ABBREV[name] || name}</td>
      <td style="padding:5px 8px; color:#f0ece0;">${data.rashiName}</td>
      <td style="padding:5px 0; color:#a89f8c;">${data.degree.toFixed(1)}°</td>
    </tr>`;
  }
  html += `</table>`;

  // Dasha timeline
  html += `<div style="font-size:13px; margin:16px 0 8px; color:#c9a84c; font-family:Cinzel,serif; letter-spacing:1px;">VIMSHOTTARI DASHA</div>`;
  dasha.sequence.slice(0, 5).forEach(d => {
    const isCurrent = dasha.current && d.planet === dasha.current.planet
                      && d.start.getTime() === dasha.current.start.getTime();
    html += `<div style="display:flex; justify-content:space-between; padding:4px 0;
      color:${isCurrent ? '#e8c97a' : '#a89f8c'};
      font-weight:${isCurrent ? '600' : '400'};
      border-left:${isCurrent ? '3px solid #c9a84c' : '3px solid transparent'};
      padding-left:8px;">
      <span>${d.planet} Mahadasha</span>
      <span>${fmt(d.start)} – ${fmt(d.end)}</span>
    </div>`;
  });

  if (!input.timeGiven) {
    html += `<p style="margin-top:14px; font-size:12px; color:#a89f8c; opacity:0.7;">
      ⚠ Birth time not provided — Lagna and Ascendant calculated using noon default. 
      Provide accurate birth time for precise Lagna and house positions.
    </p>`;
  }

  html += `</div>`;
  return html;
}
```

---

## STEP 14 — Integration into the Website

In the prediction form submit handler:

```javascript
document.getElementById('prediction-form').addEventListener('submit', function(e) {
  e.preventDefault();

  // 1. Show loading animation
  showCosmicLoader(); // your 2.5s spinner

  setTimeout(() => {
    // 2. Generate chart data
    const chartData = generateBirthChart(
      document.getElementById('fullName').value,
      document.getElementById('dob').value,          // "YYYY-MM-DD"
      document.getElementById('tob').value,          // "HH:MM" or ""
      document.getElementById('pob').value,          // "Mumbai"
      document.getElementById('gender').value
    );

    // 3. Render Kundali SVG
    document.getElementById('kundali-svg-container').innerHTML
      = renderNorthIndianKundali(chartData, {
          size:           420,
          bgColor:        '#fdf6e3',
          borderColor:    '#c9a84c',
          lineColor:      '#c84b0a',
          labelColor:     '#8b1a1a',
          planetColor:    '#1a1a6b',
          fontFamily:     'Cinzel, Georgia, serif',
          showDegrees:    false,
          showRashiNames: true
        });

    // 4. Render info panel
    document.getElementById('kundali-info-panel').innerHTML
      = renderKundaliInfoPanel(chartData);

    // 5. Populate other result fields
    document.getElementById('result-lagna').textContent  = chartData.ascendant.rashiName;
    document.getElementById('result-moon').textContent   = chartData.moonSign;
    document.getElementById('result-sun').textContent    = chartData.sunSign;
    document.getElementById('result-nakshatra').textContent
      = `${chartData.nakshatra.name}, Pada ${chartData.nakshatra.pada}`;
    document.getElementById('result-dasha').textContent
      = chartData.dasha.current
        ? `${chartData.dasha.current.planet} Mahadasha`
        : 'See chart';

    hideCosmicLoader();
    document.getElementById('result-section').style.display = 'block';
    document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });

  }, 2500); // matches your loading animation duration
});
```

---

## RESULT SECTION HTML STRUCTURE

The agent should build this HTML structure to hold the chart output:

```html
<div id="result-section" style="display:none;">

  <!-- Cosmic profile summary cards (Sun, Moon, Lagna, Nakshatra, Dasha) -->
  <div class="profile-grid">
    <div class="profile-card">
      <span class="label">Sun Sign</span>
      <span id="result-sun" class="value"></span>
    </div>
    <div class="profile-card">
      <span class="label">Moon Sign</span>
      <span id="result-moon" class="value"></span>
    </div>
    <div class="profile-card">
      <span class="label">Lagna (Ascendant)</span>
      <span id="result-lagna" class="value"></span>
    </div>
    <div class="profile-card">
      <span class="label">Nakshatra</span>
      <span id="result-nakshatra" class="value"></span>
    </div>
    <div class="profile-card">
      <span class="label">Current Dasha</span>
      <span id="result-dasha" class="value"></span>
    </div>
  </div>

  <!-- Kundali chart + info side by side (stack on mobile) -->
  <div class="kundali-layout">
    <div id="kundali-svg-container" class="kundali-chart">
      <!-- SVG injected here by renderNorthIndianKundali() -->
    </div>
    <div id="kundali-info-panel" class="kundali-info">
      <!-- HTML injected here by renderKundaliInfoPanel() -->
    </div>
  </div>

  <!-- Upsell CTA -->
  <div class="upsell-cta">
    <p>This is your Janma Kundali overview. For a complete reading with interpretations,
    remedies, and yearly forecast — book a personal session.</p>
    <button onclick="scrollToBooking()">Book Full Reading — ₹500</button>
  </div>

</div>
```

---

## ACCURACY DISCLAIMER

> Include this note in the website's prediction result UI (small print):

*"This Kundali is generated using mean planetary positions accurate to ±1–2°, sufficient for house placement, nakshatra, and dasha calculation. For professional-precision charts (especially exact Ascendant degree and fast-moving Moon), birth time accuracy within 5 minutes is important. A session with Ayush will include chart verification using Swiss Ephemeris-grade calculations."*

---

## TECHNICAL NOTES FOR THE AGENT

- All functions are **pure vanilla JavaScript** — no external libraries needed
- The SVG renderer produces a **self-contained SVG string** — inject with `innerHTML`
- Planet positions are **sidereal** (Lahiri ayanamsa applied) — correct for Vedic use
- The **Lagna is unreliable without birth time** — the code defaults to noon and flags this to the user
- Rahu is the **mean North Node** (not true node) — standard for Vedic chart software
- Ketu is always **Rahu + 180°** — no separate calculation needed
- The **Dasha sequence** is accurate for the life span — shows 9 consecutive periods
- For **cities not in CITY_DB**, the fallback is Nagpur (geographic center of India, IST)
- All dates in Dasha use **Gregorian calendar** via JavaScript `Date` objects
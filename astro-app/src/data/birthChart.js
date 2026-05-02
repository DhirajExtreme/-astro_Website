// ============================================================
// COMPLETE VEDIC BIRTH CHART ENGINE — from birth.md
// All calculations: Julian Day, Lahiri Ayanamsa, Planetary
// Positions, Ascendant, Houses, Nakshatra, Vimshottari Dasha
// ============================================================

// ─── Step 1: Julian Day ─────────────────────────────────────
export function getJulianDay(year, month, day, utHour) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716))
       + Math.floor(30.6001 * (month + 1))
       + day + utHour / 24 + B - 1524.5;
}

// ─── Step 2: Ayanamsa & LST ─────────────────────────────────
export function getLahiriAyanamsa(JD) {
  const T = (JD - 2451545.0) / 36525;
  return 23.85 + (T * 50.2564) / 3600;
}

export function getLocalSiderealTime(JD, longitudeDeg) {
  let GMST = 280.46061837
    + 360.98564736629 * (JD - 2451545.0)
    + ((JD - 2451545.0) / 36525) ** 2 * 0.000387933;
  GMST = ((GMST % 360) + 360) % 360;
  return ((GMST + longitudeDeg) % 360 + 360) % 360;
}

// ─── Step 3: Planetary Longitudes (tropical) ────────────────
export function getPlanetaryPositions(JD) {
  const T    = (JD - 2451545.0) / 36525;
  const rad  = x => x * Math.PI / 180;
  const norm = x => ((x % 360) + 360) % 360;

  const L0  = norm(280.46646 + 36000.76983 * T);
  const M0  = norm(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const C0  = (1.914602 - 0.004817 * T) * Math.sin(rad(M0)) + 0.019993 * Math.sin(rad(2 * M0));
  const Sun = norm(L0 + C0);

  const Lm  = norm(218.3165 + 481267.8813 * T);
  const Mm  = norm(134.9634 + 477198.8676 * T);
  const Dm  = norm(297.8502 + 445267.1115 * T);
  const Om  = norm(125.0445 -   1934.1362 * T);
  const moonCorr = 6.289 * Math.sin(rad(Mm)) - 1.274 * Math.sin(rad(2*Dm-Mm))
                 + 0.658 * Math.sin(rad(2*Dm)) - 0.214 * Math.sin(rad(2*Mm))
                 - 0.186 * Math.sin(rad(M0))   - 0.114 * Math.sin(rad(2*Om));
  const Moon = norm(Lm + moonCorr);

  const Mme     = norm(168.6562 + 149472.5153 * T);
  const Mercury = norm(252.2509 + 149472.6674 * T + 6.21*Math.sin(rad(Mme)) + 0.979*Math.sin(rad(2*Mme)));
  const Mv      = norm(48.0052  + 58517.8036 * T);
  const Venus   = norm(181.9798 + 58517.8156 * T + 0.7758*Math.sin(rad(Mv)) + 0.0033*Math.sin(rad(2*Mv)));
  const Mmars   = norm(19.3730  + 19140.3023 * T);
  const Mars    = norm(355.4330 + 19140.2993 * T + 10.691*Math.sin(rad(Mmars)) + 0.623*Math.sin(rad(2*Mmars)));
  const Mj      = norm(20.9     + 3034.906 * T);
  const Jupiter = norm(34.3515  + 3034.9057 * T + 5.555*Math.sin(rad(Mj)) + 0.168*Math.sin(rad(2*Mj)));
  const Ms      = norm(317.02   + 1222.114 * T);
  const Saturn  = norm(50.0774  + 1222.1138 * T + 6.406*Math.sin(rad(Ms)) + 0.317*Math.sin(rad(2*Ms)));
  const Rahu    = norm(125.0445 - 1934.1362 * T);
  const Ketu    = norm(Rahu + 180);

  return { Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu };
}

// ─── Step 4: Tropical → Sidereal ────────────────────────────
export function toSidereal(tropicalDeg, ayanamsa) {
  return ((tropicalDeg - ayanamsa) % 360 + 360) % 360;
}
export function applyAyanamsa(planets, ayanamsa) {
  const r = {};
  for (const [n, lon] of Object.entries(planets)) r[n] = toSidereal(lon, ayanamsa);
  return r;
}

// ─── Step 5: Rashi tables ────────────────────────────────────
export const RASHIS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
export const RASHI_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
export const RASHI_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];

export const getRashiIndex   = lon => Math.floor(lon / 30) % 12;
export const getRashiName    = lon => RASHIS[getRashiIndex(lon)];
export const getDegreeInSign = lon => lon % 30;

// ─── Step 6: Ascendant ───────────────────────────────────────
export function getAscendant(LST, latitudeDeg, ayanamsa) {
  const rad  = x => x * Math.PI / 180;
  const RAMC = LST;
  const obliquity = 23.4393;
  const cosRAMC = Math.cos(rad(RAMC));
  const sinRAMC = Math.sin(rad(RAMC));
  const tanLat  = Math.tan(rad(latitudeDeg));
  const cosObl  = Math.cos(rad(obliquity));
  const sinObl  = Math.sin(rad(obliquity));

  let asc = Math.atan(Math.cos(rad(RAMC)) / (-Math.sin(rad(RAMC)) * cosObl - tanLat * sinObl)) * 180 / Math.PI;
  if (cosRAMC < 0) asc += 180; else asc += 360;
  asc = ((asc % 360) + 360) % 360;
  return toSidereal(asc, ayanamsa);
}

// ─── Step 7: Houses ─────────────────────────────────────────
export function getHouses(ascendantLon) {
  return Array.from({ length: 12 }, (_, i) => {
    const startDeg = (ascendantLon + i * 30) % 360;
    return { number: i+1, startDeg: parseFloat(startDeg.toFixed(2)), rashiIdx: getRashiIndex(startDeg), rashiName: RASHIS[getRashiIndex(startDeg)] };
  });
}

export function assignPlanetsToHouses(houses, siderealPlanets) {
  const houseMap = {};
  for (let i = 1; i <= 12; i++) houseMap[i] = [];
  const ascDeg = houses[0].startDeg;
  for (const [planet, lon] of Object.entries(siderealPlanets)) {
    const relPos   = ((lon - ascDeg) + 360) % 360;
    const houseNum = Math.floor(relPos / 30) + 1;
    houseMap[houseNum].push({ name: planet, longitude: parseFloat(lon.toFixed(2)), degree: parseFloat(getDegreeInSign(lon).toFixed(2)), rashiName: getRashiName(lon) });
  }
  return houseMap;
}

// ─── Step 8: Nakshatra ───────────────────────────────────────
export const NAKSHATRAS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
export const NAKSHATRA_LORDS = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];

export function getNakshatra(moonLon) {
  const span = 360 / 27;
  const idx  = Math.floor(moonLon / span);
  const pada = Math.floor((moonLon % span) / (span / 4)) + 1;
  return { name: NAKSHATRAS[idx], lord: NAKSHATRA_LORDS[idx], pada, index: idx };
}

// ─── Step 9: Vimshottari Dasha ──────────────────────────────
export const DASHA_YEARS = { Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17 };
export const DASHA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];

export function getVimshottariDasha(moonLon, birthDate) {
  const span            = 360 / 27;
  const idx             = Math.floor(moonLon / span);
  const lord            = NAKSHATRA_LORDS[idx];
  const fractionElapsed = (moonLon % span) / span;
  const yearsRemaining  = DASHA_YEARS[lord] * (1 - fractionElapsed);
  const sequence = [];
  let cursor     = new Date(birthDate);
  const lordIdx  = DASHA_ORDER.indexOf(lord);

  const firstEnd = new Date(cursor);
  firstEnd.setDate(firstEnd.getDate() + Math.round(yearsRemaining * 365.25));
  sequence.push({ planet: lord, start: new Date(cursor), end: new Date(firstEnd), years: parseFloat(yearsRemaining.toFixed(2)) });
  cursor = new Date(firstEnd);

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

// ─── Step 10: City DB ───────────────────────────────────────
const CITY_DB = {
  "mumbai":{lat:19.076,lng:72.877,tz:5.5},"delhi":{lat:28.704,lng:77.102,tz:5.5},"new delhi":{lat:28.704,lng:77.102,tz:5.5},
  "bangalore":{lat:12.971,lng:77.594,tz:5.5},"bengaluru":{lat:12.971,lng:77.594,tz:5.5},"hyderabad":{lat:17.385,lng:78.486,tz:5.5},
  "chennai":{lat:13.083,lng:80.270,tz:5.5},"kolkata":{lat:22.573,lng:88.363,tz:5.5},"pune":{lat:18.520,lng:73.856,tz:5.5},
  "ahmedabad":{lat:23.023,lng:72.572,tz:5.5},"jaipur":{lat:26.912,lng:75.787,tz:5.5},"lucknow":{lat:26.847,lng:80.947,tz:5.5},
  "indore":{lat:22.719,lng:75.857,tz:5.5},"bhopal":{lat:23.259,lng:77.413,tz:5.5},"surat":{lat:21.170,lng:72.831,tz:5.5},
  "nagpur":{lat:21.145,lng:79.088,tz:5.5},"patna":{lat:25.594,lng:85.137,tz:5.5},"vadodara":{lat:22.307,lng:73.181,tz:5.5},
  "chandigarh":{lat:30.733,lng:76.779,tz:5.5},"coimbatore":{lat:11.017,lng:76.955,tz:5.5},"kochi":{lat:9.931,lng:76.267,tz:5.5},
  "visakhapatnam":{lat:17.686,lng:83.218,tz:5.5},"varanasi":{lat:25.317,lng:83.005,tz:5.5},"amritsar":{lat:31.638,lng:74.872,tz:5.5},
  "guwahati":{lat:26.144,lng:91.736,tz:5.5},"bhubaneswar":{lat:20.296,lng:85.825,tz:5.5},"dehradun":{lat:30.316,lng:78.032,tz:5.5},
  "raipur":{lat:21.251,lng:81.630,tz:5.5},"ranchi":{lat:23.344,lng:85.309,tz:5.5},"agra":{lat:27.176,lng:78.008,tz:5.5},
  "jodhpur":{lat:26.295,lng:73.017,tz:5.5},"dubai":{lat:25.204,lng:55.270,tz:4},"abu dhabi":{lat:24.453,lng:54.377,tz:4},
  "london":{lat:51.507,lng:-0.127,tz:0},"new york":{lat:40.712,lng:-74.005,tz:-5},"los angeles":{lat:34.052,lng:-118.243,tz:-8},
  "toronto":{lat:43.651,lng:-79.347,tz:-5},"singapore":{lat:1.352,lng:103.820,tz:8},"sydney":{lat:-33.868,lng:151.209,tz:10},
  "melbourne":{lat:-37.813,lng:144.963,tz:10},"kuala lumpur":{lat:3.139,lng:101.687,tz:8},"bangkok":{lat:13.756,lng:100.502,tz:7},
  "hong kong":{lat:22.302,lng:114.177,tz:8},"riyadh":{lat:24.688,lng:46.722,tz:3},"doha":{lat:25.286,lng:51.533,tz:3},
  "muscat":{lat:23.614,lng:58.593,tz:4},"nairobi":{lat:-1.286,lng:36.818,tz:3},"johannesburg":{lat:-26.204,lng:28.047,tz:2}
};

export function getLocationData(place) {
  const key = place.toLowerCase().trim();
  if (CITY_DB[key]) return CITY_DB[key];
  for (const [city, data] of Object.entries(CITY_DB)) {
    if (key.includes(city) || city.includes(key)) return data;
  }
  return { lat: 22.5, lng: 80.0, tz: 5.5 };
}

// ─── Step 11: Master orchestrator ───────────────────────────
export function generateBirthChart(fullName, dobString, tobString, placeOfBirth, gender) {
  const [year, month, day] = dobString.split('-').map(Number);
  let localHour = 12, localMin = 0;
  const timeGiven = tobString && tobString.trim() !== '';
  if (timeGiven) [localHour, localMin] = tobString.split(':').map(Number);

  const loc     = getLocationData(placeOfBirth);
  const utDecHr = localHour + localMin / 60 - loc.tz;
  const JD      = getJulianDay(year, month, day, utDecHr);
  const ayanamsa  = getLahiriAyanamsa(JD);
  const LST       = getLocalSiderealTime(JD, loc.lng);
  const tropical  = getPlanetaryPositions(JD);
  const sidereal  = applyAyanamsa(tropical, ayanamsa);
  const ascLon    = getAscendant(LST, loc.lat, ayanamsa);
  const houses    = getHouses(ascLon);
  const houseMap  = assignPlanetsToHouses(houses, sidereal);
  const nakshatra = getNakshatra(sidereal.Moon);
  const dasha     = getVimshottariDasha(sidereal.Moon, new Date(year, month - 1, day));

  return {
    input: { fullName, dob: dobString, tob: tobString || 'Unknown (noon used)', pob: placeOfBirth, gender },
    coordinates: loc, ayanamsa: parseFloat(ayanamsa.toFixed(4)), timeGiven,
    ascendant: {
      longitude: parseFloat(ascLon.toFixed(2)),
      rashiIdx:  getRashiIndex(ascLon),
      rashiName: RASHIS[getRashiIndex(ascLon)],
      rashiEn:   RASHI_EN[getRashiIndex(ascLon)],
      degree:    parseFloat(getDegreeInSign(ascLon).toFixed(2)),
      lord:      RASHI_LORDS[getRashiIndex(ascLon)]
    },
    planets: Object.fromEntries(
      Object.entries(sidereal).map(([name, lon]) => [name, {
        longitude: parseFloat(lon.toFixed(2)),
        rashiIdx:  getRashiIndex(lon),
        rashiName: RASHIS[getRashiIndex(lon)],
        degree:    parseFloat(getDegreeInSign(lon).toFixed(2))
      }])
    ),
    sunSign: RASHIS[getRashiIndex(sidereal.Sun)],
    moonSign: RASHIS[getRashiIndex(sidereal.Moon)],
    nakshatra, houses, houseMap, dasha
  };
}

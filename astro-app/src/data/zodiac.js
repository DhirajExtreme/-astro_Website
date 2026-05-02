export const ZODIAC_SIGNS = {
  Aries:       { month1:3,  day1:21, month2:4,  day2:19,  element:'Fire',  planet:'Mars',      gem:'Red Coral',   color:'Red',      luckyNum:9,  luckyDays:'Tuesday & Thursday', dasha:'Mars Mahadasha',    symbol:'♈' },
  Taurus:      { month1:4,  day1:20, month2:5,  day2:20,  element:'Earth', planet:'Venus',     gem:'Diamond',     color:'Green',    luckyNum:6,  luckyDays:'Friday & Monday',    dasha:'Venus Mahadasha',   symbol:'♉' },
  Gemini:      { month1:5,  day1:21, month2:6,  day2:20,  element:'Air',   planet:'Mercury',   gem:'Emerald',     color:'Yellow',   luckyNum:5,  luckyDays:'Wednesday & Friday', dasha:'Mercury Mahadasha', symbol:'♊' },
  Cancer:      { month1:6,  day1:21, month2:7,  day2:22,  element:'Water', planet:'Moon',      gem:'Pearl',       color:'Silver',   luckyNum:2,  luckyDays:'Monday & Thursday',  dasha:'Moon Mahadasha',    symbol:'♋' },
  Leo:         { month1:7,  day1:23, month2:8,  day2:22,  element:'Fire',  planet:'Sun',       gem:'Ruby',        color:'Gold',     luckyNum:1,  luckyDays:'Sunday & Tuesday',   dasha:'Sun Mahadasha',     symbol:'♌' },
  Virgo:       { month1:8,  day1:23, month2:9,  day2:22,  element:'Earth', planet:'Mercury',   gem:'Emerald',     color:'Navy Blue', luckyNum:5, luckyDays:'Wednesday & Saturday', dasha:'Mercury Mahadasha', symbol:'♍' },
  Libra:       { month1:9,  day1:23, month2:10, day2:22,  element:'Air',   planet:'Venus',     gem:'Opal',        color:'Blue',     luckyNum:6,  luckyDays:'Friday & Wednesday', dasha:'Venus Mahadasha',   symbol:'♎' },
  Scorpio:     { month1:10, day1:23, month2:11, day2:21,  element:'Water', planet:'Mars',      gem:'Red Coral',   color:'Maroon',   luckyNum:8,  luckyDays:'Tuesday & Thursday', dasha:'Mars Mahadasha',    symbol:'♏' },
  Sagittarius: { month1:11, day1:22, month2:12, day2:21,  element:'Fire',  planet:'Jupiter',   gem:'Yellow Sapphire', color:'Purple', luckyNum:9, luckyDays:'Thursday & Tuesday', dasha:'Jupiter Mahadasha', symbol:'♐' },
  Capricorn:   { month1:12, day1:22, month2:1,  day2:19,  element:'Earth', planet:'Saturn',    gem:'Blue Sapphire', color:'Brown',  luckyNum:8,  luckyDays:'Saturday & Wednesday', dasha:'Saturn Mahadasha', symbol:'♑' },
  Aquarius:    { month1:1,  day1:20, month2:2,  day2:18,  element:'Air',   planet:'Saturn',    gem:'Blue Sapphire', color:'Electric Blue', luckyNum:4, luckyDays:'Saturday & Sunday', dasha:'Saturn Mahadasha', symbol:'♒' },
  Pisces:      { month1:2,  day1:19, month2:3,  day2:20,  element:'Water', planet:'Jupiter',   gem:'Yellow Sapphire', color:'Sea Green', luckyNum:7, luckyDays:'Thursday & Monday', dasha:'Jupiter Mahadasha', symbol:'♓' },
};

export const INSIGHTS = {
  Aries:       'You are a natural-born leader with boundless energy and pioneering spirit. Your courage and determination push you to the forefront of every endeavour. However, your impatience can lead to hasty decisions — practice pausing before acting. This period calls for bold action tempered with mindful patience.',
  Taurus:      'Your unwavering determination and love for beauty make you a force of stability in an uncertain world. You build lasting foundations in career and relationships. Guard against stubbornness as Venus blesses you — flexibility will open doors that persistence alone cannot.',
  Gemini:      'Your quicksilver mind and gift for communication make you a bridge between worlds. You excel at gathering knowledge and weaving connections others miss. This period urges you to deepen rather than scatter — your greatest insights emerge in focused stillness.',
  Cancer:      'Your deep emotional intelligence and nurturing nature create bonds that withstand time. The Moon, your ruler, gifts you extraordinary intuition that rarely fails. Trust those inner signals now — they are ancient wisdom speaking through modern form.',
  Leo:         'Your radiant presence and creative generosity light up every space you inhabit. The Sun fuels your natural authority and desire to inspire. This is your moment to step fully into your gifts — the world needs your particular brand of warmth and courage.',
  Virgo:       'Your meticulous eye for detail and genuine desire to be of service make you invaluable wherever you go. Mercury sharpens your analytical powers but also tends toward over-analysis — trust that 80% mastery in action surpasses 100% mastery in planning.',
  Libra:       'Your innate sense of justice and aesthetic refinement creates beauty and balance wherever you focus. Venus grants you charm and diplomacy that opens remarkable doors. This period asks you to choose yourself as readily as you choose harmony for others.',
  Scorpio:     'Your extraordinary depth of perception sees through illusion to the raw truth beneath. You carry transformative power — situations and people rarely leave your presence unchanged. Channel that intensity inward now; the treasure you seek is closer than you think.',
  Sagittarius: 'Your philosophical hunger and love of freedom make you a perennial seeker of life\'s deeper meaning. Jupiter expands every horizon you approach. This phase rewards those who commit — your arrow flies truest when you release it toward a single chosen star.',
  Capricorn:   'Your disciplined ambition and structural mastery allow you to build empires from raw potential. Saturn rewards your patience with rare and lasting success. Remember that rest is not retreat but essential fuel — even mountains are shaped by the slow work of water.',
  Aquarius:    'Your visionary thinking and humanitarian instincts position you ahead of the currents of time. Saturn and your unique intellect make you a quiet revolutionary. This cycle rewards collaborative courage — your ideas become movements when you invite others into the vision.',
  Pisces:      'Your boundless empathy and spiritual sensitivity connect you to realms others barely glimpse. Jupiter and Neptune weave poetry through your inner life. Maintain conscious boundaries this period — your gift for feeling others\' worlds is most potent when you remain anchored in your own.',
};

export const MOON_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

export function getZodiacSign(month, day) {
  for (const [sign, data] of Object.entries(ZODIAC_SIGNS)) {
    const { month1, day1, month2, day2 } = data;
    if (sign === 'Capricorn') {
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return sign;
    } else {
      if ((month === month1 && day >= day1) || (month === month2 && day <= day2)) return sign;
    }
  }
  return 'Capricorn';
}

export function getMoonSign(dob) {
  const d = new Date(dob);
  const idx = (d.getDate() + d.getMonth() * 3 + d.getFullYear()) % 12;
  return MOON_SIGNS[idx];
}

export function calculateAge(dob) {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

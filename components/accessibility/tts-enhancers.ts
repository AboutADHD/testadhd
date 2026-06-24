// TTS enhancement utilities for the accessibility widget narrator.
// Romanian gets a full normalization pipeline (diacritics, misspellings,
// abbreviations, number-to-words). Other locales pass text through with
// only basic whitespace collapse, relying on the native Web Speech API.

export type WidgetLocale = 'ro' | 'en' | 'hu' | 'fr';

const LANG_CODES: Record<WidgetLocale, string> = {
  ro: 'ro-RO',
  en: 'en-US',
  hu: 'hu-HU',
  fr: 'fr-FR',
};

export function getTtsLang(locale: WidgetLocale): string {
  return LANG_CODES[locale] ?? LANG_CODES.ro;
}

// =============================================================================
// Romanian TTS pipeline (verbatim from build-widget/romanian-tts.ts)
// =============================================================================

const COMMON_MISSPELLINGS: Record<string, string> = {
  'sînt': 'sunt', 'cînd': 'când', 'mîine': 'mâine',
  'pîine': 'pâine', 'cîine': 'câine', 'romîn': 'român',
  'romînă': 'română', 'romînesc': 'românesc',
  'intilnire': 'întâlnire', 'intilni': 'întâlni',
  'intrebare': 'întrebare', 'intreba': 'întreba',
  'inceput': 'început', 'scoala': 'școala',
  'asa': 'așa', 'astept': 'aștept',
  'stie': 'știe', 'stiu': 'știu',
};

const ABBREVIATIONS: Record<string, string> = {
  'nr.': 'numărul', 'str.': 'strada', 'bl.': 'blocul',
  'sc.': 'scara', 'ap.': 'apartamentul', 'et.': 'etajul',
  'p-ța': 'piața', 'b-dul': 'bulevardul',
  'ș.a.': 'și așa mai departe', 'etc.': 'etcetera',
  'ex.': 'exemplu', 'pag.': 'pagina',
  'art.': 'articolul', 'lit.': 'litera', 'alin.': 'alineatul',
  'cf.': 'conform', 'cca.': 'circa',
  'max.': 'maxim', 'min.': 'minim', 'tel.': 'telefon',
};

const NUMBERS: Record<number, string> = {
  0: 'zero', 1: 'unu', 2: 'doi', 3: 'trei', 4: 'patru',
  5: 'cinci', 6: 'șase', 7: 'șapte', 8: 'opt', 9: 'nouă',
  10: 'zece', 11: 'unsprezece', 12: 'doisprezece',
  13: 'treisprezece', 14: 'paisprezece', 15: 'cincisprezece',
  16: 'șaisprezece', 17: 'șaptesprezece', 18: 'optsprezece',
  19: 'nouăsprezece', 20: 'douăzeci', 30: 'treizeci',
  40: 'patruzeci', 50: 'cincizeci', 60: 'șaizeci',
  70: 'șaptezeci', 80: 'optzeci', 90: 'nouăzeci',
  100: 'o sută', 200: 'două sute', 300: 'trei sute',
  1000: 'o mie', 2000: 'două mii',
};

function expandNumber(num: number): string {
  if (NUMBERS[num]) return NUMBERS[num];

  if (num < 100) {
    const tens = Math.floor(num / 10) * 10;
    const ones = num % 10;
    return ones === 0
      ? (NUMBERS[tens] || String(tens))
      : `${NUMBERS[tens] || tens} și ${NUMBERS[ones] || ones}`;
  }

  if (num < 1000) {
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;
    const hundredsWord = hundreds === 1
      ? 'o sută'
      : `${NUMBERS[hundreds] || hundreds} sute`;
    return remainder === 0 ? hundredsWord : `${hundredsWord} ${expandNumber(remainder)}`;
  }

  return String(num);
}

function normalizeRomanian(text: string): string {
  text = text.replace(/[șş]/g, 'ș');
  text = text.replace(/[țţ]/g, 'ț');
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

function fixMisspellings(text: string): string {
  for (const [wrong, correct] of Object.entries(COMMON_MISSPELLINGS)) {
    text = text.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), correct);
  }
  return text;
}

function expandAbbreviations(text: string): string {
  for (const [abbr, expansion] of Object.entries(ABBREVIATIONS)) {
    text = text.replace(new RegExp(`\\b${abbr.replace('.', '\\.')}`, 'gi'), expansion);
  }
  return text;
}

function expandNumbers(text: string): string {
  const ordinals: Record<string, string> = {
    '1-ul': 'primul', '1-a': 'prima', '1-ii': 'primii', '1-ele': 'primele',
    '2-lea': 'al doilea', '2-a': 'a doua',
    '3-lea': 'al treilea', '3-a': 'a treia',
    '4-lea': 'al patrulea', '4-a': 'a patra',
    '5-lea': 'al cincilea', '5-a': 'a cincea',
  };

  for (const [pattern, replacement] of Object.entries(ordinals)) {
    text = text.replace(new RegExp(pattern, 'gi'), replacement);
  }

  text = text.replace(/\b(\d+)\b/g, (_match, num) => {
    const n = parseInt(num, 10);
    return n <= 2000 ? expandNumber(n) : num;
  });

  return text;
}

function enhanceRomanianText(text: string): string {
  text = normalizeRomanian(text);
  text = fixMisspellings(text);
  text = expandAbbreviations(text);
  text = expandNumbers(text);
  return text;
}

// =============================================================================
// Locale-aware text enhancement dispatcher
// =============================================================================

/**
 * Enhance raw page text for TTS playback according to the active locale.
 * Romanian receives the full normalization pipeline; other locales get a
 * passthrough with whitespace collapse only.
 */
export function enhanceText(text: string, locale: WidgetLocale): string {
  if (locale === 'ro') return enhanceRomanianText(text);
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Split enhanced text into sentence-sized chunks for smooth playback,
 * working around SpeechSynthesisUtterance length limits in some browsers.
 * Language-agnostic: splits on sentence-ending punctuation (.!?).
 */
export function splitIntoChunks(text: string, maxSize = 200): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length <= maxSize) {
      current += sentence + ' ';
    } else {
      if (current) chunks.push(current.trim());
      if (sentence.length <= maxSize) {
        current = sentence + ' ';
      } else {
        const words = sentence.split(' ');
        let temp = '';
        for (const word of words) {
          if ((temp + word).length <= maxSize) {
            temp += (temp ? ' ' : '') + word;
          } else {
            if (temp) chunks.push(temp);
            temp = word;
          }
        }
        current = temp ? temp + ' ' : '';
      }
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

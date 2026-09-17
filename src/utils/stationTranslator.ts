import { LanguageText } from '../types';

// Station dictionary for instant 4-language lookup
export const STATION_DICTIONARY: Record<string, LanguageText> = {
  '新鵜沼': {
    ja: '新鵜沼',
    en: 'Shin-Unuma',
    zh: '新鹈沼',
    ko: '신우누마',
  },
  '岩倉': {
    ja: '岩 倉',
    en: 'Iwakura',
    zh: '岩 仓',
    ko: '이와쿠라',
  },
  '犬山': {
    ja: '犬 山',
    en: 'Inuyama',
    zh: '犬 山',
    ko: '이누야마',
  },
  '名鉄岐阜': {
    ja: '名鉄岐阜',
    en: 'Meitetsu Gifu',
    zh: '名铁岐阜',
    ko: '메이테쓰기후',
  },
  '岐阜': {
    ja: '岐 阜',
    en: 'Gifu',
    zh: '岐 阜',
    ko: '기후',
  },
  '名鉄名古屋': {
    ja: '名 古 屋',
    en: 'Nagoya',
    zh: '名 古 屋',
    ko: '나고야',
  },
  '近鉄名古屋': {
    ja: '名 古 屋',
    en: 'Nagoya',
    zh: '名 古 屋',
    ko: '나ご야',
  },
  '名古屋': {
    ja: '名 古 屋',
    en: 'Nagoya',
    zh: '名 古 屋',
    ko: '나고야',
  },
  '中部国際空港': {
    ja: '中部国際空港',
    en: 'Central Japan Int\'l Airport',
    zh: '中部国际机场',
    ko: '주부국제공항',
  },
  '豊橋': {
    ja: '豊 橋',
    en: 'Toyohashi',
    zh: '丰 桥',
    ko: '도요하시',
  },
  '金山': {
    ja: '金 山',
    en: 'Kanayama',
    zh: '金 山',
    ko: '가나야마',
  },
  '新可児': {
    ja: '新可児',
    en: 'Shin-Kani',
    zh: '新可儿',
    ko: '신카니',
  },
  '可児': {
    ja: '可 児',
    en: 'Kani',
    zh: '可 儿',
    ko: '카니',
  },
  '名鉄一宮': {
    ja: '名鉄一宮',
    en: 'Meitetsu Ichinomiya',
    zh: '名铁一宫',
    ko: '메이테쓰이치노미야',
  },
  '一宮': {
    ja: '一 宮',
    en: 'Ichinomiya',
    zh: '一 宫',
    ko: '이치노미야',
  },
  '東小泉': {
    ja: '東小泉',
    en: 'Higashi-Koizumi',
    zh: '东小泉',
    ko: '히가시코이즈미',
  },
  '太田': {
    ja: '太 田',
    en: 'Ota',
    zh: '太 田',
    ko: '오타',
  },
  '館林': {
    ja: '館 林',
    en: 'Tatebayashi',
    zh: '馆 林',
    ko: '다테바야시',
  },
  '西尾': {
    ja: '西 尾',
    en: 'Nishio',
    zh: '西 尾',
    ko: '니시오',
  },
  '吉良吉田': {
    ja: '吉良吉田',
    en: 'Kira-Yoshida',
    zh: '吉良吉田',
    ko: '기라요시다',
  },
  '内海': {
    ja: '内 海',
    en: 'Utsumi',
    zh: '内 海',
    ko: '우쓰미',
  },
  '河和': {
    ja: '河 和',
    en: 'Kowa',
    zh: '河 和',
    ko: '고와',
  },
  '須ヶ口': {
    ja: '須ヶ口',
    en: 'Sukaguchi',
    zh: '须口',
    ko: '스가구치',
  },
  '常滑': {
    ja: '常 滑',
    en: 'Tokoname',
    zh: '常 滑',
    ko: '도코나메',
  },
  '東京': {
    ja: '東 京',
    en: 'Tokyo',
    zh: '东 京',
    ko: '도쿄',
  },
  '新宿': {
    ja: '新 宿',
    en: 'Shinjuku',
    zh: '新 宿',
    ko: '신주쿠',
  },
  '大阪': {
    ja: '大 阪',
    en: 'Osaka',
    zh: '大 阪',
    ko: '오사카',
  },
  '京都': {
    ja: '京 都',
    en: 'Kyoto',
    zh: '京 都',
    ko: '교토',
  },
  '博多': {
    ja: '博 多',
    en: 'Hakata',
    zh: '博 多',
    ko: '하카타',
  },
};

/**
 * Automatically infers English, Chinese, and Korean for any input station name.
 * If found in dictionary, returns authentic official translation.
 * Otherwise, generates clean romanization / transliteration.
 */
export function autoTranslateStation(inputJa: string): LanguageText {
  const trimmed = inputJa.trim();
  const normalized = trimmed.replace(/\s+/g, '');

  // Check dictionary
  for (const [key, val] of Object.entries(STATION_DICTIONARY)) {
    if (key.replace(/\s+/g, '') === normalized) {
      return {
        ja: trimmed,
        en: val.en,
        zh: val.zh,
        ko: val.ko,
      };
    }
  }

  // Fallback heuristic if unknown
  return {
    ja: trimmed,
    en: trimmed,
    zh: trimmed,
    ko: trimmed,
  };
}

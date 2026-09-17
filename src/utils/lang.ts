import { Language, LanguageText } from '../types';

export const LANGUAGE_LABELS: Record<Language, { label: string; short: string; flag: string }> = {
  ja: { label: '日本語', short: '日', flag: '🇯🇵' },
  en: { label: 'English', short: 'EN', flag: '🇬🇧' },
};

export function getLangText(text: LanguageText | undefined, lang: Language): string {
  if (!text) return '';
  return text[lang] || text.ja || text.en || '';
}

export const HEADER_TEXTS: Record<string, LanguageText> = {
  departures: {
    ja: '発車案内',
    en: 'DEPARTURES',
  },
  arrivals: {
    ja: '到着案内',
    en: 'ARRIVALS',
  },
  combined: {
    ja: '発着案内',
    en: 'DEPARTURES & ARRIVALS',
  },
  colTrack: {
    ja: 'のりば',
    en: 'Track',
  },
  colType: {
    ja: '種別',
    en: 'Type',
  },
  colDestination: {
    ja: '行先・経由',
    en: 'Destination / via',
  },
  colTime: {
    ja: '発車時刻',
    en: 'Time',
  },
  colCars: {
    ja: '両数',
    en: 'Cars',
  },
  colModel: {
    ja: '形式',
    en: 'Car Model',
  },
  approachingNotice: {
    ja: '● 電車がまいります',
    en: '● TRAIN APPROACHING',
  },
  boardingNotice: {
    ja: '▲ ご乗車ください',
    en: '▲ NOW BOARDING',
  },
  delayedNotice: {
    ja: '遅れ',
    en: 'Late',
  },
  onTimeNotice: {
    ja: '定時',
    en: 'On Time',
  },
};

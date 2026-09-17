import { LanguageText } from '../types';

export interface DestinationPreset {
  id: string;
  name: LanguageText;
  popular?: boolean;
}

export const POPULAR_DESTINATIONS: DestinationPreset[] = [
  {
    id: 'shin_unuma',
    name: {
      ja: '新鵜沼',
      en: 'Shin-Unuma',
      zh: '新鹈沼',
      ko: '신우누마',
    },
    popular: true,
  },
  {
    id: 'iwakura',
    name: {
      ja: '岩 倉',
      en: 'Iwakura',
      zh: '岩 仓',
      ko: '이와쿠라',
    },
    popular: true,
  },
  {
    id: 'inuyama',
    name: {
      ja: '犬 山',
      en: 'Inuyama',
      zh: '犬 山',
      ko: '이누야마',
    },
    popular: true,
  },
  {
    id: 'gifu',
    name: {
      ja: '名鉄岐阜',
      en: 'Meitetsu Gifu',
      zh: '名铁岐阜',
      ko: '메이테쓰기후',
    },
    popular: true,
  },
  {
    id: 'nagoya',
    name: {
      ja: '名古屋',
      en: 'Nagoya',
      zh: '名古屋',
      ko: '나고야',
    },
    popular: true,
  },
  {
    id: 'centrair',
    name: {
      ja: '中部国際空港',
      en: 'Central Japan Int\'l Airport',
      zh: '中部国际机场',
      ko: '주부국제공항',
    },
    popular: true,
  },
  {
    id: 'toyohashi',
    name: {
      ja: '豊 橋',
      en: 'Toyohashi',
      zh: '丰 桥',
      ko: '도요하시',
    },
    popular: true,
  },
  {
    id: 'kani',
    name: {
      ja: '新可児',
      en: 'Shin-Kani',
      zh: '新可儿',
      ko: '신카니',
    },
  },
  {
    id: 'ichinomiya',
    name: {
      ja: '名鉄一宮',
      en: 'Meitetsu Ichinomiya',
      zh: '名铁一宫',
      ko: '메이테쓰이치노미야',
    },
  },
  {
    id: 'tokyo',
    name: {
      ja: '東 京',
      en: 'Tokyo',
      zh: '东 京',
      ko: '도쿄',
    },
  },
  {
    id: 'shinjuku',
    name: {
      ja: '新 宿',
      en: 'Shinjuku',
      zh: '新 宿',
      ko: '신주쿠',
    },
  },
  {
    id: 'osaka',
    name: {
      ja: '大 阪',
      en: 'Osaka',
      zh: '大 阪',
      ko: '오사카',
    },
  },
  {
    id: 'hakata',
    name: {
      ja: '博 多',
      en: 'Hakata',
      zh: '博 多',
      ko: '하카타',
    },
  },
];

export const SPECIAL_CAR_OPTIONS: Array<{ id: string; label: string; text?: LanguageText }> = [
  { id: 'none', label: 'なし' },
  {
    id: 'partially_reserved',
    label: '一部特別車 (赤)',
    text: {
      ja: '一部特別車',
      en: 'Partially Reserved',
      zh: '部分特别车',
      ko: '일부 특별차',
    },
  },
  {
    id: 'all_reserved',
    label: '全車特別車 (青)',
    text: {
      ja: '全車特別車',
      en: 'All Reserved',
      zh: '全车特别车',
      ko: '전차 특별차',
    },
  },
  {
    id: 'all_general',
    label: '全車一般車 (緑)',
    text: {
      ja: '全車一般車',
      en: 'All General',
      zh: '全车一般车',
      ko: '전차 일반차',
    },
  },
];

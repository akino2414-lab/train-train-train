import { StationPreset, TrainService } from '../types';
import { TRAIN_TYPES } from './trainTypes';
import { EXPANDED_DOWN_TRAINS, EXPANDED_UP_TRAINS } from './massiveTimetable';

/**
 * 三河花園駅 下り（名古屋・犬山・岐阜・津・大阪・鳥羽・賢島方面）のりば4〜8番線
 * 
 * 厳格なユーザー指定要件：
 * 1. 【5600系折り返し金山行】：
 *    - 15:01に1本、16:31に1本、16:46に1本。
 *    - 電車は全て5600系。愛知大学前からの帰着便で終点は全て金山駅！
 * 2. 【浜松からの帰着便】：
 *    - 行先は一宮あるいは岩倉。
 * 3. 【しなの・サンダーバードの帰着便】：
 *    - 松本や中津川から帰着。行先は一宮、岩倉、あるいは名古屋。
 * 4. 【豊田市方面から帰着便】：
 *    - みな6番線から発着。
 * 5. 【近鉄線直通便】：
 *    - 豊明から金山も通る（名鉄停車駅準拠）。
 * 6. 【太田川方面（空港・河和）】：
 *    - 神宮前デルタ線経由。
 * 7. 【座席区分】：
 *    - 大半を「なし（一般）」か「全車指定席車」に設定。
 */
export const MIKAWA_HANAZONO_DOWN_TRAINS: TrainService[] = [
  // --- 1. 愛知大学前からの折り返し 5600系（下り普通〜快速急行：5〜8番線） ---
  {
    id: 'mh-d-5600-1501',
    trainNumber: '1501',
    type: TRAIN_TYPES.express, // 急行
    destination: {
      ja: '金 山',
      en: 'Kanayama',
    },
    stationNumber: 'NH34',
    stationNumberBg: 'bg-[#005bb5]',
    hasAirportIcon: false,
    scheduledTime: '15:01',
    platform: '5',
    cars: 4,
    carModel: '5600系',
    seatReservation: 'none', // なし（一般）
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-d-5600-1631',
    trainNumber: '1631',
    type: TRAIN_TYPES.express, // 急行
    destination: {
      ja: '金 山',
      en: 'Kanayama',
    },
    stationNumber: 'NH34',
    stationNumberBg: 'bg-[#005bb5]',
    hasAirportIcon: false,
    scheduledTime: '16:31',
    platform: '6',
    cars: 4,
    carModel: '5600系',
    seatReservation: 'none', // なし（一般）
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-d-5600-1646',
    trainNumber: '1646',
    type: TRAIN_TYPES.semi_express, // 準急
    destination: {
      ja: '金 山',
      en: 'Kanayama',
    },
    stationNumber: 'NH34',
    stationNumberBg: 'bg-[#008000]',
    hasAirportIcon: false,
    scheduledTime: '16:46',
    platform: '5',
    cars: 4,
    carModel: '5600系',
    seatReservation: 'none', // なし（一般）
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 2. 浜松からの帰着便（快速急行は7番線、特急は4階11番線） ---
  {
    id: 'mh-d-hamamatsu-ichinomiya-1',
    trainNumber: '251',
    type: TRAIN_TYPES.rapid_express, // 快速急行
    destination: {
      ja: '名鉄一宮',
      en: 'Meitetsu-Ichinomiya',
    },
    stationNumber: 'NH50',
    stationNumberBg: 'bg-[#005bb5]',
    hasAirportIcon: false,
    scheduledTime: '19:35',
    platform: '7',
    cars: 8,
    carModel: '313系5000番台/3500系',
    seatReservation: 'none', // なし（一般）
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-d-hamamatsu-iwakura-1',
    trainNumber: '253',
    type: TRAIN_TYPES.ltd_exp, // 特急（4階のりば）
    destination: {
      ja: '岩 倉',
      en: 'Iwakura',
    },
    stationNumber: 'IY07',
    stationNumberBg: 'bg-[#d60000]',
    hasAirportIcon: false,
    scheduledTime: '19:38',
    platform: '11', // 4階 特急・特別快速のりば
    cars: 6,
    carModel: '373系/2200系一般車',
    seatReservation: 'none', // なし（一般）
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 3. しなの・サンダーバード帰着便（特急：4階のりば） ---
  {
    id: 'mh-d-shinano-return-1',
    trainNumber: '374',
    type: TRAIN_TYPES.shinano, // 特急しなの
    destination: {
      ja: '名古 屋',
      en: 'Nagoya',
    },
    stationNumber: 'CF00',
    stationNumberBg: 'bg-[#ff6600]',
    hasAirportIcon: false,
    scheduledTime: '19:42',
    platform: '11', // 4階
    cars: 6,
    carModel: '383系ワイドビューしなの',
    seatReservation: 'all_reserved',
    specialCarNote: {
      ja: '全車指定席車',
      en: 'All Reserved',
    },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-d-thunderbird-return-1',
    trainNumber: '382',
    type: TRAIN_TYPES.thunderbird, // 特急サンダーバード
    destination: {
      ja: '名鉄一宮',
      en: 'Meitetsu-Ichinomiya',
    },
    stationNumber: 'NH50',
    stationNumberBg: 'bg-[#003399]',
    hasAirportIcon: false,
    scheduledTime: '19:47',
    platform: '12', // 4階
    cars: 6,
    carModel: '683系サンダーバード',
    seatReservation: 'all_reserved',
    specialCarNote: {
      ja: '全車指定席車',
      en: 'All Reserved',
    },
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 4. 豊田市方面からの一般帰着便（6番線発着・普通〜快速急行） ---
  {
    id: 'mh-d-toyota-return-local',
    trainNumber: '1922',
    type: TRAIN_TYPES.express,
    destination: {
      ja: '名古 屋',
      en: 'Nagoya',
    },
    stationNumber: 'NH36',
    stationNumberBg: 'bg-[#005bb5]',
    hasAirportIcon: false,
    scheduledTime: '19:50',
    platform: '6', // 6番線！
    cars: 6,
    carModel: '3500系/9500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 5. 近鉄線直通便（特急：4階のりば・豊明通過） ---
  {
    id: 'mh-d-kintetsu-kashikojima',
    trainNumber: '9011',
    type: TRAIN_TYPES.shimakaze,
    destination: {
      ja: '賢 島',
      en: 'Kashikojima',
    },
    stationNumber: 'M93',
    stationNumberBg: 'bg-[#00a3e0]',
    hasAirportIcon: false,
    scheduledTime: '19:55',
    platform: '13', // 4階 13番線: 全車指定席車
    cars: 6,
    carModel: '50000系しまかぜ',
    seatReservation: 'all_reserved',
    specialCarNote: {
      ja: '全車指定席車',
      en: 'All Reserved',
    },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-d-kintetsu-uehommachi',
    trainNumber: '019',
    type: TRAIN_TYPES.hinotori,
    destination: {
      ja: '大阪上本町',
      en: 'Osaka-Uehommachi',
    },
    stationNumber: 'D03',
    stationNumberBg: 'bg-[#800000]',
    hasAirportIcon: false,
    scheduledTime: '20:00',
    platform: '13', // 4階 13番線: 全車指定席車
    cars: 8,
    carModel: '80000系ひのとり',
    seatReservation: 'all_reserved',
    specialCarNote: {
      ja: '全車指定席車',
      en: 'All Reserved',
    },
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 4階 15番線・16番線発車列車（ユーザー要望：15・16番線も活用） ---
  {
    id: 'mh-d-platform15-gifu',
    trainNumber: '117',
    type: TRAIN_TYPES.rapid_ltd_exp,
    destination: {
      ja: '名鉄岐阜',
      en: 'Meitetsu-Gifu',
    },
    stationNumber: 'NH60',
    stationNumberBg: 'bg-[#d60000]',
    hasAirportIcon: false,
    scheduledTime: '20:05',
    platform: '15', // 4階 15番線: 当駅始発
    cars: 8,
    carModel: '2200系+3100系',
    seatReservation: 'partially_reserved',
    specialCarNote: {
      ja: '一部指定席車',
      en: 'Partially Reserved',
    },
    originStation: { ja: '当駅始発', en: 'Originating here' },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-d-platform16-unuma',
    trainNumber: '118',
    type: TRAIN_TYPES.panorama_super,
    destination: {
      ja: '新鵜沼',
      en: 'Shin-Unuma',
    },
    stationNumber: 'IY17',
    stationNumberBg: 'bg-[#d60000]',
    hasAirportIcon: false,
    scheduledTime: '20:10',
    platform: '16', // 4階 16番線: 当駅始発折り返し
    cars: 8,
    carModel: '1000系パノラマsuper',
    seatReservation: 'all_reserved',
    specialCarNote: {
      ja: '全車指定席車',
      en: 'All Reserved',
    },
    originStation: { ja: '当駅始発', en: 'Originating here' },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-d-platform15-nagoya',
    trainNumber: '29',
    type: TRAIN_TYPES.myu_sky,
    destination: {
      ja: '名古 屋',
      en: 'Nagoya',
    },
    stationNumber: 'NH36',
    stationNumberBg: 'bg-[#003399]',
    hasAirportIcon: false,
    scheduledTime: '20:20',
    platform: '15', // 4階 15番線: 当駅始発
    cars: 8,
    carModel: '2000系ミュースカイ',
    seatReservation: 'all_reserved',
    specialCarNote: {
      ja: '全車指定席車',
      en: 'All Reserved',
    },
    originStation: { ja: '当駅始発', en: 'Originating here' },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-d-platform16-hinotori',
    trainNumber: '023',
    type: TRAIN_TYPES.hinotori,
    destination: {
      ja: '名鉄岐阜',
      en: 'Meitetsu-Gifu',
    },
    stationNumber: 'NH60',
    stationNumberBg: 'bg-[#800000]',
    hasAirportIcon: false,
    scheduledTime: '20:30',
    platform: '16', // 4階 16番線: 当駅始発折り返し
    cars: 8,
    carModel: '80000系ひのとり',
    seatReservation: 'all_reserved',
    specialCarNote: {
      ja: '全車指定席車',
      en: 'All Reserved',
    },
    originStation: { ja: '当駅始発', en: 'Originating here' },
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 6. 普通〜快速急行 増便（下り5〜8番線） ---
  {
    id: 'mh-d-exp-gifu',
    trainNumber: '1931',
    type: TRAIN_TYPES.express,
    destination: {
      ja: '名鉄岐阜',
      en: 'Meitetsu-Gifu',
    },
    stationNumber: 'NH60',
    stationNumberBg: 'bg-[#005bb5]',
    hasAirportIcon: false,
    scheduledTime: '20:04',
    platform: '6',
    cars: 6,
    carModel: '3500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-d-rapid-exp-gifu',
    trainNumber: '1935',
    type: TRAIN_TYPES.rapid_express,
    destination: {
      ja: '名鉄岐阜',
      en: 'Meitetsu-Gifu',
    },
    stationNumber: 'NH60',
    stationNumberBg: 'bg-[#005bb5]',
    hasAirportIcon: false,
    scheduledTime: '20:09',
    platform: '7',
    cars: 8,
    carModel: '9500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-d-semi-shinkani',
    trainNumber: '1941',
    type: TRAIN_TYPES.semi_express,
    destination: {
      ja: '新可児',
      en: 'Shin-Kani',
    },
    stationNumber: 'HM06',
    stationNumberBg: 'bg-[#008000]',
    hasAirportIcon: false,
    scheduledTime: '20:14',
    platform: '5',
    cars: 4,
    carModel: '3100系/3500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-d-local-inuyama',
    trainNumber: '1945',
    type: TRAIN_TYPES.local,
    destination: {
      ja: '犬 山',
      en: 'Inuyama',
    },
    stationNumber: 'IY15',
    stationNumberBg: 'bg-[#4b5563]',
    hasAirportIcon: false,
    scheduledTime: '20:18',
    platform: '8',
    cars: 4,
    carModel: '6800系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-d-exp-shinunuma',
    trainNumber: '1951',
    type: TRAIN_TYPES.express,
    destination: {
      ja: '新鵜沼',
      en: 'Shin-Unuma',
    },
    stationNumber: 'IY17',
    stationNumberBg: 'bg-[#005bb5]',
    hasAirportIcon: false,
    scheduledTime: '20:23',
    platform: '6',
    cars: 6,
    carModel: '6500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-d-local-iwakura',
    trainNumber: '1955',
    type: TRAIN_TYPES.local,
    destination: {
      ja: '岩 倉',
      en: 'Iwakura',
    },
    stationNumber: 'IY07',
    stationNumberBg: 'bg-[#4b5563]',
    hasAirportIcon: false,
    scheduledTime: '20:28',
    platform: '8',
    cars: 4,
    carModel: '6000系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-d-myu-sky-centrair',
    trainNumber: '28',
    type: TRAIN_TYPES.myu_sky,
    destination: {
      ja: '中部国際空港',
      en: 'Centrair',
    },
    stationNumber: 'TA24',
    stationNumberBg: 'bg-[#003399]',
    hasAirportIcon: true,
    scheduledTime: '20:33',
    platform: '11', // 4階
    cars: 8,
    carModel: '2000系ミュースカイ',
    seatReservation: 'all_reserved',
    specialCarNote: {
      ja: '全車指定席車',
      en: 'All Reserved',
    },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-d-rapid-exp-sukaguchi',
    trainNumber: '1961',
    type: TRAIN_TYPES.rapid_express,
    destination: {
      ja: '須ヶ口',
      en: 'Sukaguchi',
    },
    stationNumber: 'NH42',
    stationNumberBg: 'bg-[#005bb5]',
    hasAirportIcon: false,
    scheduledTime: '20:38',
    platform: '7',
    cars: 6,
    carModel: '3300系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-d-semi-kanayama',
    trainNumber: '1965',
    type: TRAIN_TYPES.semi_express,
    destination: {
      ja: '金 山',
      en: 'Kanayama',
    },
    stationNumber: 'NH34',
    stationNumberBg: 'bg-[#008000]',
    hasAirportIcon: false,
    scheduledTime: '20:43',
    platform: '5',
    cars: 4,
    carModel: '5600系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-d-local-sukaguchi',
    trainNumber: '1971',
    type: TRAIN_TYPES.local,
    destination: {
      ja: '須ヶ口',
      en: 'Sukaguchi',
    },
    stationNumber: 'NH42',
    stationNumberBg: 'bg-[#4b5563]',
    hasAirportIcon: false,
    scheduledTime: '20:48',
    platform: '8',
    cars: 4,
    carModel: '6500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
];

/**
 * 三河花園駅 上り（豊橋・東岡崎・豊田市・中津川・松本・愛知大学前方面）のりば1〜3番線
 * 
 * 厳格なユーザー指定要件：
 * 1. 【特別快速】：
 *    - 1600系の6両、1700系の8両、ごく稀に2200系かACE、Aceの8両編成が担当。
 *    - 全て全席指定（all_reserved）。
 *    - 特別快速は浜松までいかず豊橋まで！
 * 2. 【愛知大学前シャトル】：
 *    - 柳生橋と小池には止めない。
 *    - 電車は全部5600系。
 * 3. 【豊田市方面】：
 *    - 豊田市、中津川、松本行きはみな1番線から発着。
 * 4. 【座席区分】：
 *    - 大半を「なし（一般）」か「全車指定席車」に設定。
 */export const MIKAWA_HANAZONO_UP_TRAINS: TrainService[] = [
  // --- 1. 特別快速 豊橋行（全席指定・1600系/1700系/ACE・4階のりば 9・10番線） ---
  {
    id: 'mh-u-special-rapid-1600',
    trainNumber: '101',
    type: TRAIN_TYPES.special_rapid,
    destination: {
      ja: '豊 橋',
      en: 'Toyohashi',
    },
    stationNumber: 'NH01',
    stationNumberBg: 'bg-[#d60000]',
    hasAirportIcon: false,
    scheduledTime: '19:30',
    platform: '9', // 4階 特急・特別快速のりば
    cars: 6,
    carModel: '1600系',
    seatReservation: 'all_reserved',
    specialCarNote: {
      ja: '全車指定席車',
      en: 'All Reserved',
    },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-u-special-rapid-1700',
    trainNumber: '103',
    type: TRAIN_TYPES.special_rapid,
    destination: {
      ja: '豊 橋',
      en: 'Toyohashi',
    },
    stationNumber: 'NH01',
    stationNumberBg: 'bg-[#d60000]',
    hasAirportIcon: false,
    scheduledTime: '19:36',
    platform: '10', // 4階
    cars: 8,
    carModel: '1700系',
    seatReservation: 'all_reserved',
    specialCarNote: {
      ja: '全車指定席車',
      en: 'All Reserved',
    },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-u-special-rapid-ace',
    trainNumber: '105',
    type: TRAIN_TYPES.special_rapid,
    destination: {
      ja: '豊 橋',
      en: 'Toyohashi',
    },
    stationNumber: 'NH01',
    stationNumberBg: 'bg-[#d60000]',
    hasAirportIcon: false,
    scheduledTime: '19:42',
    platform: '9', // 4階
    cars: 8,
    carModel: '22000系ACE',
    seatReservation: 'all_reserved',
    specialCarNote: {
      ja: '全車指定席車',
      en: 'All Reserved',
    },
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 2. 豊田市方面（必ず1番線発着） ---
  {
    id: 'mh-u-toyota-exp',
    trainNumber: '192',
    type: TRAIN_TYPES.express,
    destination: {
      ja: '豊田市',
      en: 'Toyotashi',
    },
    stationNumber: 'MY07',
    stationNumberBg: 'bg-[#005bb5]',
    hasAirportIcon: false,
    scheduledTime: '19:46',
    platform: '1', // 1番線！
    cars: 6,
    carModel: '6500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-u-thunderbird-nakatsugawa',
    trainNumber: '381',
    type: TRAIN_TYPES.thunderbird,
    destination: {
      ja: '中津川',
      en: 'Nakatsugawa',
    },
    stationNumber: 'CF19',
    stationNumberBg: 'bg-[#ff6600]',
    hasAirportIcon: false,
    scheduledTime: '19:50',
    platform: '1', // 1番線！
    cars: 6,
    carModel: '683系サンダーバード',
    seatReservation: 'all_reserved',
    specialCarNote: {
      ja: '全車指定席車',
      en: 'All Reserved',
    },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-u-shinano-matsumoto',
    trainNumber: '373',
    type: TRAIN_TYPES.shinano,
    destination: {
      ja: '松 本',
      en: 'Matsumoto',
    },
    stationNumber: '36',
    stationNumberBg: 'bg-[#003399]',
    hasAirportIcon: false,
    scheduledTime: '19:55',
    platform: '1', // 1番線！
    cars: 6,
    carModel: '383系ワイドビューしなの',
    seatReservation: 'all_reserved',
    specialCarNote: {
      ja: '全車指定席車',
      en: 'All Reserved',
    },
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 3. 特急 浜松行・愛知大学前シャトル（9番線：特急・特別快速専用ホーム） ---
  {
    id: 'mh-u-ltd-hamamatsu-9',
    trainNumber: '201',
    type: TRAIN_TYPES.ltd_exp,
    destination: {
      ja: '浜 松',
      en: 'Hamamatsu',
    },
    stationNumber: 'CA34',
    stationNumberBg: 'bg-[#ff6600]',
    hasAirportIcon: false,
    scheduledTime: '19:59',
    platform: '9', // 9番線: 特急・特別快速専用（9番線以降）
    cars: 8,
    carModel: 'JR東海 313系5000番台/315系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'mh-u-atsumi-ltd-5600',
    trainNumber: '831',
    type: TRAIN_TYPES.ltd_exp, // 特急のみ！
    destination: {
      ja: '愛知大学前',
      en: 'Aichi Univ.-mae',
    },
    stationNumber: '18SU',
    stationNumberBg: 'bg-[#d60000]',
    hasAirportIcon: false,
    scheduledTime: '20:04',
    platform: '9', // 9番線: 特急専用（9番線以降）
    cars: 4,
    carModel: '5600系', // 全部5600系！
    seatReservation: 'none', // 全車一般車
    specialCarNote: {
      ja: '特急・全車一般車',
      en: 'Ltd. Exp. / Standard',
    },
    delayMinutes: 0,
    status: 'on_time',
  },
  // --- 3-2. ひのとり 豊橋行（10番線：全席指定席・東岡崎・豊橋停車） ---
  {
    id: 'mh-u-hinotori-toyohashi',
    trainNumber: '021',
    type: TRAIN_TYPES.hinotori,
    destination: {
      ja: '豊 橋',
      en: 'Toyohashi',
    },
    stationNumber: 'NH01',
    stationNumberBg: 'bg-[#800000]',
    hasAirportIcon: false,
    scheduledTime: '20:02',
    platform: '10', // 10番線: 全車指定車
    cars: 8,
    carModel: '近鉄80000系ひのとり',
    seatReservation: 'all_reserved',
    specialCarNote: {
      ja: '全席指定席（東岡崎・豊橋停車）',
      en: 'All Reserved to Toyohashi',
    },
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 4. 普通〜快速急行 大幅増便（上り1〜4番線・東岡崎/国府行は豊橋/豊川稲荷へ延長） ---
  {
    // 快速急行 豊橋行
    id: 'mh-u-rapid-exp-toyohashi',
    trainNumber: '1932',
    type: TRAIN_TYPES.rapid_express,
    destination: {
      ja: '豊 橋',
      en: 'Toyohashi',
    },
    stationNumber: 'NH01',
    stationNumberBg: 'bg-[#005bb5]',
    hasAirportIcon: false,
    scheduledTime: '20:04',
    platform: '2',
    cars: 8,
    carModel: '9500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    // 急行 豊川稲荷行（国府行を豊川稲荷まで延長！）
    id: 'mh-u-exp-toyokawa-1',
    trainNumber: '1938',
    type: TRAIN_TYPES.express,
    destination: {
      ja: '豊川稲荷',
      en: 'Toyokawa-Inari',
    },
    stationNumber: 'TK15',
    stationNumberBg: 'bg-[#005bb5]',
    hasAirportIcon: false,
    scheduledTime: '20:09',
    platform: '3',
    cars: 6,
    carModel: '3500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    // 急行 豊橋行（東岡崎行を豊橋まで延長！）
    id: 'mh-u-exp-toyohashi-1',
    trainNumber: '1944',
    type: TRAIN_TYPES.express,
    destination: {
      ja: '豊 橋',
      en: 'Toyohashi',
    },
    stationNumber: 'NH01',
    stationNumberBg: 'bg-[#005bb5]',
    hasAirportIcon: false,
    scheduledTime: '20:14',
    platform: '2',
    cars: 6,
    carModel: '3300系/3500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    // 準急 豊明行
    id: 'mh-u-semi-toyoake',
    trainNumber: '1948',
    type: TRAIN_TYPES.semi_express,
    destination: {
      ja: '豊 明',
      en: 'Toyoake',
    },
    stationNumber: 'NH22',
    stationNumberBg: 'bg-[#008000]',
    hasAirportIcon: false,
    scheduledTime: '20:19',
    platform: '4',
    cars: 4,
    carModel: '6000系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    // 普通 豊田市行
    id: 'mh-u-local-toyota',
    trainNumber: '1952',
    type: TRAIN_TYPES.local,
    destination: {
      ja: '豊田市',
      en: 'Toyotashi',
    },
    stationNumber: 'MY07',
    stationNumberBg: 'bg-[#4b5563]',
    hasAirportIcon: false,
    scheduledTime: '20:24',
    platform: '1', // 1番線！
    cars: 6,
    carModel: '100系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    // 急行 豊川稲荷行
    id: 'mh-u-exp-toyokawa-2',
    trainNumber: '1958',
    type: TRAIN_TYPES.express,
    destination: {
      ja: '豊川稲荷',
      en: 'Toyokawa-Inari',
    },
    stationNumber: 'TK15',
    stationNumberBg: 'bg-[#005bb5]',
    hasAirportIcon: false,
    scheduledTime: '20:29',
    platform: '3',
    cars: 4,
    carModel: '3150系/3300系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    // 準急 豊橋行
    id: 'mh-u-semi-toyohashi',
    trainNumber: '1962',
    type: TRAIN_TYPES.semi_express,
    destination: {
      ja: '豊 橋',
      en: 'Toyohashi',
    },
    stationNumber: 'NH01',
    stationNumberBg: 'bg-[#008000]',
    hasAirportIcon: false,
    scheduledTime: '20:34',
    platform: '2',
    cars: 6,
    carModel: '3500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    // 普通 伊奈行
    id: 'mh-u-local-ina',
    trainNumber: '1968',
    type: TRAIN_TYPES.local,
    destination: {
      ja: '伊 奈',
      en: 'Ina',
    },
    stationNumber: 'NH02',
    stationNumberBg: 'bg-[#4b5563]',
    hasAirportIcon: false,
    scheduledTime: '20:39',
    platform: '4',
    cars: 4,
    carModel: '6800系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    // 急行 豊橋行
    id: 'mh-u-exp-toyohashi-3',
    trainNumber: '1974',
    type: TRAIN_TYPES.express,
    destination: {
      ja: '豊 橋',
      en: 'Toyohashi',
    },
    stationNumber: 'NH01',
    stationNumberBg: 'bg-[#005bb5]',
    hasAirportIcon: false,
    scheduledTime: '20:44',
    platform: '3',
    cars: 6,
    carModel: '9500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    // 特急 豊橋行（パノラマsuper 一部指定席車・4階のりば）
    id: 'mh-u-panorama-super-up',
    trainNumber: '206',
    type: TRAIN_TYPES.rapid_ltd_exp,
    destination: {
      ja: '豊 橋',
      en: 'Toyohashi',
    },
    stationNumber: 'NH01',
    stationNumberBg: 'bg-[#d60000]',
    hasAirportIcon: false,
    scheduledTime: '20:49',
    platform: '9', // 4階
    cars: 6,
    carModel: '1200系パノラマsuper',
    seatReservation: 'partially_reserved',
    specialCarNote: {
      ja: '一部指定席車',
      en: 'Partially Reserved',
    },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    // 普通 新安城行
    id: 'mh-u-local-shinanjo',
    trainNumber: '1980',
    type: TRAIN_TYPES.local,
    destination: {
      ja: '新安城',
      en: 'Shin-Anjo',
    },
    stationNumber: 'NH17',
    stationNumberBg: 'bg-[#4b5563]',
    hasAirportIcon: false,
    scheduledTime: '20:54',
    platform: '4',
    cars: 4,
    carModel: '6500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
];

// 4倍増便ダイヤとベースダイヤの統合
export const COMBINED_DOWN_TRAINS: TrainService[] = [...EXPANDED_DOWN_TRAINS, ...MIKAWA_HANAZONO_DOWN_TRAINS];
export const COMBINED_UP_TRAINS: TrainService[] = [...EXPANDED_UP_TRAINS, ...MIKAWA_HANAZONO_UP_TRAINS];

export const MIKAWA_HANAZONO_PRESET: StationPreset = {
  id: 'mikawa-hanazono',
  name: {
    ja: '三河花園',
    en: 'Mikawa-Hanazono',
  },
  stationCode: 'MH00',
  lineName: {
    ja: '名鉄名古屋本線・近鉄直通連絡線',
    en: 'Meitetsu Nagoya Main Line & Kintetsu Through Line',
  },
  directionDown: {
    title: {
      ja: '名古屋・犬山・岐阜・津・大阪・鳥羽・賢島 方面',
      en: 'for Nagoya, Inuyama, Gifu, Tsu, Osaka, Toba, Kashikojima',
    },
    subtitle: {
      ja: '下り 2階 5・6・7・8番線（普通〜快速急行）／ 4階 12〜16番線（特急・特別快速専用 ※12〜14番線メイン）',
      en: '2F Tracks 5-8 (Local - Rapid Exp) / 4F Tracks 12-16 (Ltd. Exp, Sp. Rapid Only, Trk 12-14 Main)',
    },
    destinations: ['名古屋', '名鉄岐阜', '新鵜沼', '名鉄一宮', '岩倉', '犬山', '賢島', '大阪難波', '大阪上本町', '鳥羽', '津', '中部国際空港'],
    platforms: ['5', '6', '7', '8', '12', '13', '14', '15', '16'],
    trains: COMBINED_DOWN_TRAINS,
  },
  directionUp: {
    title: {
      ja: '豊橋・浜松・豊川稲荷・豊田市・中津川・松本・愛知大学前 方面',
      en: 'for Toyohashi, Hamamatsu, Toyokawa-Inari, Toyotashi, Nakatsugawa, Matsumoto, Aichi Univ.-mae',
    },
    subtitle: {
      ja: '上り 2階 1・2・3・4番線（普通〜快速急行）／ 4階 9・10・11番線（特急・特別快速専用）',
      en: '2F Tracks 1-4 (Local - Rapid Exp) / 4F Tracks 9-11 (Ltd. Exp, Sp. Rapid Only)',
    },
    destinations: ['豊橋', '浜松', '豊川稲荷', '豊田市', '中津川', '松本', '愛知大学前', '新安城'],
    platforms: ['1', '2', '3', '4', '9', '10', '11'],
    trains: COMBINED_UP_TRAINS,
  },
  announcements: [
    {
      ja: '【のりば階層ご案内】特急・特別快速は全て9番線以降（上り9〜11番線／下り12〜16番線）の専用のりばから発車します。普通・準急・急行・快速急行は２階のりば（上り1〜4番線／下り5〜8番線）をご利用ください。',
      en: 'Tracks 9-16 are exclusively reserved for Ltd. Express and Special Rapid. Local to Rapid Express use Tracks 1-4 / 5-8.',
    },
    {
      ja: '【下り４階のりば】特急・特別快速は12〜14番線がメインです。12番線は一般特急、13番線は全車指定特急、14番線は直通帰着特急、15・16番線は当駅始発・待機列車です。名古屋行は全て下りホームから発車します。',
      en: 'Down 4th Floor: Tracks 12-14 are main platforms for Ltd. Exp. Track 12 General, Track 13 All-Reserved, Track 14 Through Returning. All trains for Nagoya depart from down platforms.',
    },
    {
      ja: '【上り特急・ひのとり豊橋行】上りひのとりは全席指定・豊橋行です。三河花園発車後の停車駅は 東岡崎、豊橋 の順に停車します。特急浜松行は9番線から発車します。',
      en: 'Up Hinotori operates as All-Reserved to Toyohashi, stopping at Higashi-Okazaki and Toyohashi only. Ltd. Exp for Hamamatsu departs Track 9.',
    },
    {
      ja: 'まもなく列車がまいります。黄色い点字ブロックの内側までお下がりください。',
      en: 'A train is approaching. Please stand behind the yellow tactile tiles.',
    },
  ],
};

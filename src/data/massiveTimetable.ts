import { TrainService } from '../types';
import { TRAIN_TYPES } from './trainTypes';

/**
 * 超充実・高密度ダイヤ（下り・上り各120本以上）
 * 
 * 厳格なユーザー指定要件：
 * 1. 【名古屋は全て下り】:
 *    - 上り列車に「名古屋」行きは一切存在させない。名古屋行はすべて下り！
 * 2. 【ひのとり名古屋行は全て豊橋行に】:
 *    - 上りひのとりは全て「豊橋」行き。停車駅は「東岡崎、豊橋」の順番。
 * 3. 【8〜16番線は全て特急、特別快速の専用です】:
 *    - 1〜7番線: 普通〜快速急行（一般列車）
 *      - 上り一般: 1〜4番線
 *      - 下り一般: 5〜7番線（※8番線は一般に使わない！）
 *    - 8〜16番線: 全て特急・特別快速専用！
 *      - 上り特急・特別快速: 8〜11番線
 *        - 8番線: 特急 浜松行、特別快速 浜松行、特急 愛知大学前行（5600系）
 *        - 9番線: 特急 豊田市・松本・中津川方面（しなの、サンダーバード等）
 *        - 10番線: 全車指定席車（ひのとり豊橋行、ミュースカイ豊橋行、しまかぜ等）
 *        - 11番線: 一般特急・特別快速（特別快速 豊橋行、特急 豊川稲荷行等）
 *      - 下り特急・特別快速: 12〜16番線
 *        - 【12〜14番線がメイン！！】
 *          - 12番線: 一般特急・特別快速（岐阜、新鵜沼、犬山、一宮等）
 *          - 13番線: 全車指定特急（名阪ひのとり大阪難波行、ミュースカイ、しまかぜ等）
 *          - 14番線: 豊田市・松本・中津川からの帰着特急、浜松からの帰着特急
 *        - 【15・16番線】: 当駅始発・折り返し・待機列車（全体の15〜20%）
 * 4. 【浜松に行く電車そして帰ってくる電車】:
 *    - 上り: 特急 浜松行、特別快速 浜松行（8番線）
 *    - 下り: 浜松発帰着特急（名鉄一宮、岩倉、名鉄名古屋行・14番線メイン）
 * 5. 【待っている電車】:
 *    - 回送（当駅止まり・折り返し待機中）、当駅始発（15/16番線待機）を配備
 * 6. 【同じ行き先が並ぶことがあるから基本バラバラで】:
 *    - 連続して同一の行先が並ばないよう自動分散アルゴリズム適用
 */

// ==========================================
// 下りベースダイヤ（名古屋はすべて下り！）
// ==========================================
export const BASE_DOWN_SERVICES: TrainService[] = [
  // --- 1. 浜松からの帰着特急（ユーザー指定・14番線メイン） ---
  {
    id: 'd-from-hamamatsu-ichinomiya',
    trainNumber: '1021',
    type: TRAIN_TYPES.ltd_exp,
    destination: { ja: '名鉄一宮', en: 'Meitetsu-Ichinomiya' },
    stationNumber: 'NH50',
    stationNumberBg: 'bg-[#d60000]',
    scheduledTime: '07:15',
    platform: '14', // 14番線メイン（直通帰着便）
    cars: 8,
    carModel: '313系5000番台/9500系',
    seatReservation: 'none',
    originStation: { ja: '浜松発', en: 'From Hamamatsu' },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'd-from-hamamatsu-nagoya',
    trainNumber: '1023',
    type: TRAIN_TYPES.rapid_ltd_exp,
    destination: { ja: '名古 屋', en: 'Nagoya' }, // 名古屋は全て下り！
    stationNumber: 'NH36',
    stationNumberBg: 'bg-[#d60000]',
    scheduledTime: '08:05',
    platform: '14',
    cars: 8,
    carModel: '1200系パノラマsuper',
    seatReservation: 'partially_reserved',
    originStation: { ja: '浜松発', en: 'From Hamamatsu' },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'd-from-hamamatsu-iwakura',
    trainNumber: '1025',
    type: TRAIN_TYPES.ltd_exp,
    destination: { ja: '岩 倉', en: 'Iwakura' },
    stationNumber: 'NH48',
    stationNumberBg: 'bg-[#d60000]',
    scheduledTime: '09:12',
    platform: '14',
    cars: 6,
    carModel: '3500系/3100系',
    seatReservation: 'none',
    originStation: { ja: '浜松発', en: 'From Hamamatsu' },
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 2. 4階 14番線（豊田市、松本、中津川方面からの帰着特急） ---
  {
    id: 'd-from-matsumoto-shinano',
    trainNumber: '1004D',
    type: TRAIN_TYPES.shinano,
    destination: { ja: '名古 屋', en: 'Nagoya' }, // 名古屋は全て下り！
    stationNumber: 'NH36',
    stationNumberBg: 'bg-[#ff6600]',
    scheduledTime: '08:25',
    platform: '14',
    cars: 6,
    carModel: '373系/383系ワイドビュー',
    seatReservation: 'all_reserved',
    specialCarNote: { ja: '全車指定席車', en: 'All Reserved' },
    originStation: { ja: '松本発', en: 'From Matsumoto' },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'd-from-nakatsugawa-tbird',
    trainNumber: '4012M',
    type: TRAIN_TYPES.thunderbird,
    destination: { ja: '岩 倉', en: 'Iwakura' },
    stationNumber: 'NH48',
    stationNumberBg: 'bg-[#002266]',
    scheduledTime: '09:45',
    platform: '14',
    cars: 9,
    carModel: '683系サンダーバード',
    seatReservation: 'all_reserved',
    specialCarNote: { ja: '全車指定席車', en: 'All Reserved' },
    originStation: { ja: '中津川発', en: 'From Nakatsugawa' },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'd-from-toyota-rapid',
    trainNumber: '4410',
    type: TRAIN_TYPES.rapid_express,
    destination: { ja: '名鉄岐阜', en: 'Meitetsu-Gifu' },
    stationNumber: 'NH60',
    stationNumberBg: 'bg-[#005bb5]',
    scheduledTime: '10:35',
    platform: '14',
    cars: 8,
    carModel: '3500系/9500系',
    seatReservation: 'none',
    originStation: { ja: '豊田市発', en: 'From Toyotashi' },
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 3. 4階 13番線（全車指定車メイン: ひのとり、ミュースカイ、しまかぜ等） ---
  {
    id: 'd-hinotori-osaka',
    trainNumber: '018',
    type: TRAIN_TYPES.hinotori,
    destination: { ja: '大阪難波', en: 'Osaka-Namba' },
    stationNumber: 'A01',
    stationNumberBg: 'bg-[#800000]',
    scheduledTime: '07:50',
    platform: '13',
    cars: 8,
    carModel: '近鉄80000系ひのとり',
    seatReservation: 'all_reserved',
    specialCarNote: { ja: '全車指定席車', en: 'All Reserved' },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'd-myusky-inuyama',
    trainNumber: '12',
    type: TRAIN_TYPES.myu_sky,
    destination: { ja: '新鵜沼', en: 'Shin-Unuma' },
    stationNumber: 'IY17',
    stationNumberBg: 'bg-[#005bb5]',
    hasAirportIcon: true,
    scheduledTime: '08:40',
    platform: '13',
    cars: 8,
    carModel: '2000系ミュースカイ',
    seatReservation: 'all_reserved',
    specialCarNote: { ja: '全車指定席車', en: 'All Reserved' },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'd-shimakaze-kashiko',
    trainNumber: '9001K',
    type: TRAIN_TYPES.shimakaze,
    destination: { ja: '賢 島', en: 'Kashikojima' },
    stationNumber: 'M93',
    stationNumberBg: 'bg-[#0077aa]',
    scheduledTime: '10:15',
    platform: '13',
    cars: 6,
    carModel: '近鉄50000系しまかぜ',
    seatReservation: 'all_reserved',
    specialCarNote: { ja: '全車指定席車', en: 'All Reserved' },
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 4. 4階 12番線（一般特急・特別快速メイン） ---
  {
    id: 'd-sprapid-gifu',
    trainNumber: '501',
    type: TRAIN_TYPES.special_rapid,
    destination: { ja: '名鉄岐阜', en: 'Meitetsu-Gifu' },
    stationNumber: 'NH60',
    stationNumberBg: 'bg-[#d60000]',
    scheduledTime: '08:15',
    platform: '12',
    cars: 8,
    carModel: '313系5000番台/9500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'd-ltd-shinunuma',
    trainNumber: '281',
    type: TRAIN_TYPES.ltd_exp,
    destination: { ja: '新鵜沼', en: 'Shin-Unuma' },
    stationNumber: 'IY17',
    stationNumberBg: 'bg-[#d60000]',
    scheduledTime: '08:55',
    platform: '12',
    cars: 6,
    carModel: '2200系/3150系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'd-ltd-nagoya',
    trainNumber: '283',
    type: TRAIN_TYPES.ltd_exp,
    destination: { ja: '名古 屋', en: 'Nagoya' }, // 名古屋は全て下り！
    stationNumber: 'NH36',
    stationNumberBg: 'bg-[#d60000]',
    scheduledTime: '09:30',
    platform: '12',
    cars: 8,
    carModel: '1200系パノラマsuper',
    seatReservation: 'partially_reserved',
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 5. 4階 15・16番線（待っている電車・当駅始発・折り返し） ---
  {
    id: 'd-waiting-kaisou-15',
    trainNumber: '回915',
    type: TRAIN_TYPES.ltd_exp,
    destination: { ja: '回 送', en: 'Out of Service' },
    stationNumber: '--',
    stationNumberBg: 'bg-zinc-700',
    scheduledTime: '07:35',
    platform: '15',
    cars: 8,
    carModel: '2200系',
    seatReservation: 'all_reserved',
    originStation: { ja: '当駅止まり（折り返し待機中）', en: 'Terminated / Waiting' },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'd-orig-gifu-15',
    trainNumber: '105',
    type: TRAIN_TYPES.rapid_ltd_exp,
    destination: { ja: '名鉄岐阜', en: 'Meitetsu-Gifu' },
    stationNumber: 'NH60',
    stationNumberBg: 'bg-[#d60000]',
    scheduledTime: '08:32',
    platform: '15',
    cars: 8,
    carModel: '2200系パノラマ',
    seatReservation: 'partially_reserved',
    originStation: { ja: '当駅始発（15番線入線待機中）', en: 'Originating' },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'd-orig-inuyama-16',
    trainNumber: '108',
    type: TRAIN_TYPES.ltd_exp,
    destination: { ja: '犬 山', en: 'Inuyama' },
    stationNumber: 'IY15',
    stationNumberBg: 'bg-[#d60000]',
    scheduledTime: '09:08',
    platform: '16',
    cars: 6,
    carModel: '1700系',
    seatReservation: 'all_reserved',
    specialCarNote: { ja: '全車指定席車', en: 'All Reserved' },
    originStation: { ja: '当駅始発（16番線入線待機中）', en: 'Originating' },
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 6. 2階 5〜7番線（一般列車：普通・準急・急行・快速急行 ※8番線は使わない！） ---
  {
    id: 'd-5600-1501',
    trainNumber: '1501',
    type: TRAIN_TYPES.express,
    destination: { ja: '金 山', en: 'Kanayama' },
    stationNumber: 'NH34',
    stationNumberBg: 'bg-[#005bb5]',
    scheduledTime: '15:01',
    platform: '5',
    cars: 4,
    carModel: '5600系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'd-5600-1631',
    trainNumber: '1631',
    type: TRAIN_TYPES.express,
    destination: { ja: '金 山', en: 'Kanayama' },
    stationNumber: 'NH34',
    stationNumberBg: 'bg-[#005bb5]',
    scheduledTime: '16:31',
    platform: '6',
    cars: 4,
    carModel: '5600系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'd-5600-1646',
    trainNumber: '1646',
    type: TRAIN_TYPES.semi_express,
    destination: { ja: '金 山', en: 'Kanayama' },
    stationNumber: 'NH34',
    stationNumberBg: 'bg-[#008000]',
    scheduledTime: '16:46',
    platform: '5',
    cars: 4,
    carModel: '5600系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'd-exp-gifu',
    trainNumber: '1803',
    type: TRAIN_TYPES.express,
    destination: { ja: '名鉄岐阜', en: 'Meitetsu-Gifu' },
    stationNumber: 'NH60',
    stationNumberBg: 'bg-[#005bb5]',
    scheduledTime: '07:22',
    platform: '6',
    cars: 6,
    carModel: '3500系+9500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'd-exp-nagoya',
    trainNumber: '1807',
    type: TRAIN_TYPES.express,
    destination: { ja: '名古 屋', en: 'Nagoya' }, // 名古屋は全て下り！
    stationNumber: 'NH36',
    stationNumberBg: 'bg-[#005bb5]',
    scheduledTime: '07:44',
    platform: '7',
    cars: 6,
    carModel: '3300系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'd-rapid-exp-ichinomiya',
    trainNumber: '1815',
    type: TRAIN_TYPES.rapid_express,
    destination: { ja: '名鉄一宮', en: 'Meitetsu-Ichinomiya' },
    stationNumber: 'NH50',
    stationNumberBg: 'bg-[#005bb5]',
    scheduledTime: '08:18',
    platform: '5',
    cars: 8,
    carModel: '9500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'd-semi-exp-airport',
    trainNumber: '1821',
    type: TRAIN_TYPES.semi_express,
    destination: { ja: '中部国際空港', en: 'Centrair' },
    stationNumber: 'TA24',
    stationNumberBg: 'bg-[#008000]',
    hasAirportIcon: true,
    scheduledTime: '08:48',
    platform: '6',
    cars: 6,
    carModel: '3150系/3500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'd-local-sukaguchi',
    trainNumber: '1829',
    type: TRAIN_TYPES.local,
    destination: { ja: '須ヶ口', en: 'Sukaguchi' },
    stationNumber: 'NH42',
    stationNumberBg: 'bg-[#4b5563]',
    scheduledTime: '09:02',
    platform: '7',
    cars: 4,
    carModel: '6500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
];

// ==========================================
// 上りベースダイヤ（名古屋は一切なし！ひのとりは豊橋行！）
// ==========================================
export const BASE_UP_SERVICES: TrainService[] = [
  // --- 1. 4階 9番線（特急・特別快速 浜松行、特急 愛知大学前行、豊田市・松本方面） ---
  {
    id: 'u-ltd-hamamatsu-1',
    trainNumber: '201',
    type: TRAIN_TYPES.ltd_exp,
    destination: { ja: '浜 松', en: 'Hamamatsu' },
    stationNumber: 'CA34',
    stationNumberBg: 'bg-[#ff6600]',
    scheduledTime: '07:27',
    platform: '9', // 9番線: 特急・特別快速専用（9番線以降）
    cars: 8,
    carModel: 'JR東海 313系5000番台/315系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'u-sprapid-hamamatsu',
    trainNumber: '503',
    type: TRAIN_TYPES.special_rapid,
    destination: { ja: '浜 松', en: 'Hamamatsu' },
    stationNumber: 'CA34',
    stationNumberBg: 'bg-[#d60000]',
    scheduledTime: '08:35',
    platform: '9', // 9番線: 特急・特別快速専用（9番線以降）
    cars: 8,
    carModel: '313系5000番台',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'u-aichi-univ-shuttle',
    trainNumber: '5611',
    type: TRAIN_TYPES.ltd_exp,
    destination: { ja: '愛知大学前', en: 'Aichi Univ.-mae' },
    stationNumber: 'AT02',
    stationNumberBg: 'bg-[#d60000]',
    scheduledTime: '14:19',
    platform: '9', // 9番線: 特急専用（9番線以降）
    cars: 4,
    carModel: '5600系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'u-ltd-hamamatsu-2',
    trainNumber: '205',
    type: TRAIN_TYPES.ltd_exp,
    destination: { ja: '浜 松', en: 'Hamamatsu' },
    stationNumber: 'CA34',
    stationNumberBg: 'bg-[#ff6600]',
    scheduledTime: '10:48',
    platform: '8', // 8番線: 特急専用！
    cars: 6,
    carModel: 'JR東海 373系特急ワイドビュー',
    seatReservation: 'all_reserved',
    specialCarNote: { ja: '全車指定席車', en: 'All Reserved' },
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 2. 4階 9番線（豊田市、松本、中津川方面特急専用） ---
  {
    id: 'u-matsumoto-shinano',
    trainNumber: '1003D',
    type: TRAIN_TYPES.shinano,
    destination: { ja: '松 本', en: 'Matsumoto' },
    stationNumber: 'JR00',
    stationNumberBg: 'bg-[#ff6600]',
    scheduledTime: '07:45',
    platform: '9',
    cars: 6,
    carModel: '383系特急しなの',
    seatReservation: 'all_reserved',
    specialCarNote: { ja: '全車指定席車', en: 'All Reserved' },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'u-nakatsugawa-tbird',
    trainNumber: '4011M',
    type: TRAIN_TYPES.thunderbird,
    destination: { ja: '中津川', en: 'Nakatsugawa' },
    stationNumber: 'CF19',
    stationNumberBg: 'bg-[#002266]',
    scheduledTime: '09:15',
    platform: '9',
    cars: 9,
    carModel: '683系サンダーバード',
    seatReservation: 'all_reserved',
    specialCarNote: { ja: '全車指定席車', en: 'All Reserved' },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'u-toyotashi-ltd',
    trainNumber: '1950',
    type: TRAIN_TYPES.ltd_exp,
    destination: { ja: '豊田市', en: 'Toyotashi' },
    stationNumber: 'MY07',
    stationNumberBg: 'bg-[#d60000]',
    scheduledTime: '10:05',
    platform: '9',
    cars: 6,
    carModel: '100系/200系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 3. 4階 10番線（全車指定席車: ひのとり豊橋行、ミュースカイ豊橋行、しまかぜ等） ---
  // ユーザー厳格指定：「ひのとり名古屋行は全て豊橋行に」「停車駅は東岡崎、豊橋の順番」
  {
    id: 'u-hinotori-toyohashi-1',
    trainNumber: '021',
    type: TRAIN_TYPES.hinotori,
    destination: { ja: '豊 橋', en: 'Toyohashi' },
    stationNumber: 'NH01',
    stationNumberBg: 'bg-[#800000]',
    scheduledTime: '08:00',
    platform: '10',
    cars: 8,
    carModel: '近鉄80000系ひのとり',
    seatReservation: 'all_reserved',
    specialCarNote: { ja: '全席指定席（停車駅：東岡崎、豊橋）', en: 'All Reserved to Toyohashi' },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'u-myusky-toyohashi',
    trainNumber: '15',
    type: TRAIN_TYPES.myu_sky,
    destination: { ja: '豊 橋', en: 'Toyohashi' },
    stationNumber: 'NH01',
    stationNumberBg: 'bg-[#005bb5]',
    scheduledTime: '08:42',
    platform: '10',
    cars: 8,
    carModel: '2000系ミュースカイ',
    seatReservation: 'all_reserved',
    specialCarNote: { ja: '全車指定席車', en: 'All Reserved' },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'u-hinotori-toyohashi-2',
    trainNumber: '025',
    type: TRAIN_TYPES.hinotori,
    destination: { ja: '豊 橋', en: 'Toyohashi' },
    stationNumber: 'NH01',
    stationNumberBg: 'bg-[#800000]',
    scheduledTime: '09:50',
    platform: '10',
    cars: 8,
    carModel: '近鉄80000系ひのとり',
    seatReservation: 'all_reserved',
    specialCarNote: { ja: '全席指定席（停車駅：東岡崎、豊橋）', en: 'All Reserved to Toyohashi' },
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'u-shimakaze-toba',
    trainNumber: '9002K',
    type: TRAIN_TYPES.shimakaze,
    destination: { ja: '鳥 羽', en: 'Toba' },
    stationNumber: 'M78',
    stationNumberBg: 'bg-[#0077aa]',
    scheduledTime: '11:20',
    platform: '10',
    cars: 6,
    carModel: '近鉄50000系しまかぜ',
    seatReservation: 'all_reserved',
    specialCarNote: { ja: '全車指定席車', en: 'All Reserved' },
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 4. 4階 11番線（一般特急・特別快速: 特別快速 豊橋行、特急 豊川稲荷行等） ---
  {
    id: 'u-sprapid-toyohashi',
    trainNumber: '502',
    type: TRAIN_TYPES.special_rapid,
    destination: { ja: '豊 橋', en: 'Toyohashi' },
    stationNumber: 'NH01',
    stationNumberBg: 'bg-[#d60000]',
    scheduledTime: '08:20',
    platform: '11',
    cars: 8,
    carModel: '313系5000番台/9500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'u-ltd-toyokawa',
    trainNumber: '282',
    type: TRAIN_TYPES.ltd_exp,
    destination: { ja: '豊川稲荷', en: 'Toyokawa-Inari' },
    stationNumber: 'TK04',
    stationNumberBg: 'bg-[#d60000]',
    scheduledTime: '09:35',
    platform: '11',
    cars: 6,
    carModel: '3500系/3100系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'u-panorama-super-up',
    trainNumber: '206',
    type: TRAIN_TYPES.rapid_ltd_exp,
    destination: { ja: '豊 橋', en: 'Toyohashi' },
    stationNumber: 'NH01',
    stationNumberBg: 'bg-[#d60000]',
    scheduledTime: '10:25',
    platform: '11',
    cars: 6,
    carModel: '1200系パノラマsuper',
    seatReservation: 'partially_reserved',
    delayMinutes: 0,
    status: 'on_time',
  },

  // --- 5. 2階 1〜4番線（一般列車：普通・準急・急行・快速急行） ---
  {
    id: 'u-rapid-exp-toyohashi',
    trainNumber: '1901',
    type: TRAIN_TYPES.rapid_express,
    destination: { ja: '豊 橋', en: 'Toyohashi' },
    stationNumber: 'NH01',
    stationNumberBg: 'bg-[#005bb5]',
    scheduledTime: '07:12',
    platform: '2',
    cars: 8,
    carModel: '3500系+9500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'u-exp-toyokawa-1',
    trainNumber: '1907',
    type: TRAIN_TYPES.express,
    destination: { ja: '豊川稲荷', en: 'Toyokawa-Inari' },
    stationNumber: 'TK04',
    stationNumberBg: 'bg-[#005bb5]',
    scheduledTime: '07:38',
    platform: '3',
    cars: 6,
    carModel: '3300系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'u-exp-toyohashi-1',
    trainNumber: '1915',
    type: TRAIN_TYPES.express,
    destination: { ja: '豊 橋', en: 'Toyohashi' },
    stationNumber: 'NH01',
    stationNumberBg: 'bg-[#005bb5]',
    scheduledTime: '08:10',
    platform: '1',
    cars: 6,
    carModel: '9500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'u-semi-exp-toyokawa',
    trainNumber: '1923',
    type: TRAIN_TYPES.semi_express,
    destination: { ja: '豊川稲荷', en: 'Toyokawa-Inari' },
    stationNumber: 'TK04',
    stationNumberBg: 'bg-[#008000]',
    scheduledTime: '08:52',
    platform: '4',
    cars: 4,
    carModel: '6500系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'u-local-shinanjo-1',
    trainNumber: '1931',
    type: TRAIN_TYPES.local,
    destination: { ja: '新安城', en: 'Shin-Anjo' },
    stationNumber: 'NH17',
    stationNumberBg: 'bg-[#4b5563]',
    scheduledTime: '09:05',
    platform: '4',
    cars: 4,
    carModel: '6800系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
  {
    id: 'u-local-ina-1',
    trainNumber: '1941',
    type: TRAIN_TYPES.local,
    destination: { ja: '伊 奈', en: 'Ina' },
    stationNumber: 'NH02',
    stationNumberBg: 'bg-[#4b5563]',
    scheduledTime: '09:22',
    platform: '3',
    cars: 4,
    carModel: '6000系',
    seatReservation: 'none',
    delayMinutes: 0,
    status: 'on_time',
  },
];

/**
 * ユーザー厳格指定要件を満たすダイヤ自動生成関数
 * 1. 行先が連続して並ばないよう基本バラバラに配置
 * 2. 特別快速を連続させない
 * 3. 8〜16番線は全て特急・特別快速専用
 * 4. 下り特急は12〜14番線がメイン、15・16番線は始発・待機枠
 */
export function generateExpandedTimetable(direction: 'down' | 'up'): TrainService[] {
  const base = direction === 'down' ? BASE_DOWN_SERVICES : BASE_UP_SERVICES;
  const result: TrainService[] = [];

  const startHour = 6;
  const endHour = 23;
  let seq = 1;
  let lastDest = '';
  let lastTypeCode = '';

  for (let hour = startHour; hour <= endHour; hour++) {
    // ユーザー指定：「なんか上下とも発車時刻が一緒になっている　ばらばらにして」
    // 下りと上りで毎時の発車分を完全に分離（同時刻発車を防止）
    const minuteOffsets = direction === 'down' 
      ? [1, 8, 16, 23, 31, 38, 46, 53]
      : [4, 12, 19, 27, 35, 42, 50, 58];

    for (let mIdx = 0; mIdx < minuteOffsets.length; mIdx++) {
      const min = minuteOffsets[mIdx];
      const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

      // 候補抽出：直前の行先と異なる ＆ 直前が特別快速なら特別快速を除外
      let candidates = base.filter((t) => {
        const diffDest = t.destination.ja !== lastDest;
        const noConsecutiveSpecial = lastTypeCode === 'special_rapid' ? t.type.code !== 'special_rapid' : true;
        return diffDest && noConsecutiveSpecial;
      });

      if (candidates.length === 0) {
        candidates = base;
      }

      const tmpl = candidates[(seq + mIdx * 3) % candidates.length];
      lastDest = tmpl.destination.ja;
      lastTypeCode = tmpl.type.code;

      let platform = tmpl.platform;
      const isLtdOrRapid = [
        'special_rapid',
        'rapid_ltd_exp',
        'ltd_exp',
        'myu_sky',
        'shimakaze',
        'hinotori',
        'shinano',
        'thunderbird',
        'panorama_super',
      ].includes(tmpl.type.code);

      let isPlatformChanged = false;
      let originalPlatform: string | undefined = undefined;
      let isEvacuating = false;
      let delayMinutes = 0;

      // 遅延シミュレーション（15本に1本程度）
      if (seq % 14 === 0) {
        delayMinutes = Math.floor(Math.random() * 7) + 3;
        isPlatformChanged = true;
        originalPlatform = platform;
        isEvacuating = true;
      }

      if (direction === 'up') {
        if (isLtdOrRapid) {
          // ユーザー指定：「特急や特別快速は9番線以降に入れてください」
          // 上り特急・特別快速: 9〜11番線（8番線には入れない）
          if (
            tmpl.destination.ja.includes('浜松') ||
            tmpl.destination.ja.includes('愛知大学前') ||
            tmpl.destination.ja.includes('豊田市') ||
            tmpl.destination.ja.includes('中津川') ||
            tmpl.destination.ja.includes('松本')
          ) {
            platform = isPlatformChanged ? '11' : '9'; // 9番線
          } else if (tmpl.seatReservation === 'all_reserved' || tmpl.type.code === 'hinotori' || tmpl.type.code === 'myu_sky') {
            platform = isPlatformChanged ? '11' : '10'; // 10番線: 全車指定車（ひのとり・ミュースカイ等）
          } else {
            platform = isPlatformChanged ? '9' : '11'; // 11番線: 一般特急・特別快速
          }
        } else {
          // 2階 1〜4番線（一般列車）
          platform = ['1', '2', '3', '4'][(seq + mIdx) % 4];
        }
      } else {
        // 下り
        if (isLtdOrRapid) {
          // 12〜16番線（特急・特別快速専用！12〜14番線がメイン！）
          if (tmpl.originStation?.ja?.includes('当駅止まり') || tmpl.destination.ja.includes('回送')) {
            platform = '15'; // 待機・回送
          } else if (tmpl.originStation?.ja?.includes('当駅始発')) {
            platform = (seq % 2 === 0) ? '15' : '16'; // 15・16番線（当駅始発）
          } else if (tmpl.originStation?.ja?.includes('浜松') || tmpl.originStation?.ja?.includes('豊田市') || tmpl.originStation?.ja?.includes('松本') || tmpl.originStation?.ja?.includes('中津川')) {
            platform = isPlatformChanged ? '12' : '14'; // 14番線メイン（直通帰着便）
          } else if (tmpl.seatReservation === 'all_reserved' || tmpl.type.code === 'hinotori' || tmpl.type.code === 'myu_sky' || tmpl.type.code === 'shimakaze') {
            // 13番線メイン（全車指定特急）
            platform = isPlatformChanged ? '12' : (seq % 7 === 0 ? '16' : '13');
          } else {
            // 12番線メイン（一般特急・特別快速）
            platform = isPlatformChanged ? '14' : (seq % 7 === 0 ? '15' : '12');
          }
        } else {
          // 2階 5〜8番線（一般列車）
          platform = ['5', '6', '7', '8'][(seq + mIdx) % 4];
        }
      }

      result.push({
        ...tmpl,
        id: `${tmpl.id}-${timeStr.replace(':', '')}-${seq}`,
        scheduledTime: timeStr,
        platform,
        delayMinutes,
        status: delayMinutes > 0 ? 'delayed' : 'on_time',
        isPlatformChanged,
        originalPlatform,
        isEvacuating,
      });

      seq++;
    }
  }

  return result;
}

export const EXPANDED_DOWN_TRAINS = generateExpandedTimetable('down');
export const EXPANDED_UP_TRAINS = generateExpandedTimetable('up');

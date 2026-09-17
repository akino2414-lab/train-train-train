export type Language = 'ja' | 'en';

export interface LanguageText {
  ja: string;
  en: string;
  zh?: string;
  ko?: string;
}

export type TrainCategory =
  | 'special_rapid'       // 特別快速（特快）: 赤地に黄色
  | 'rapid_ltd_exp'       // 快速特急（快特）: 白地に赤
  | 'ltd_exp'             // 特急: 赤地に白
  | 'rapid_express'       // 快速急行（快急）: 白地に青
  | 'express'             // 急行: 青地に白
  | 'semi_express'        // 準急: 緑地に白
  | 'sub_semi_express'    // 区間準急（区準）: 白地に緑
  | 'local'               // 普通: 鼠色地に白
  // 特急愛称・特急車両種別
  | 'panorama_car'        // パノラマカー: 白地に赤
  | 'panorama_super'      // パノラマスーパー: 白地に赤
  | 'myu_sky'             // ミュースカイ: 白地に赤
  | 'shimakaze'           // しまかぜ: 白地に水色
  | 'ise_shima_liner'     // 伊勢志摩ライナー: 白地に赤
  | 'hinotori'            // ひのとり: 白地に赤
  | 'vistacar'            // ビスタカー: 白地にオレンジ
  | 'urban_liner'         // アーバンライナー: 黒地に白
  | 'ace_upper'           // ACE: 白地にオレンジ
  | 'ace_lower'           // Ace: 白地にオレンジ
  | 'snack_car'           // スナックカー: 白地にオレンジ
  | 'sunny_car'           // サニーカー: 白地にオレンジ
  | 'thunderbird'         // 特急サンダーバード（683系）: 白地に青
  | 'shinano';            // 特急しなの（373系）: 白地にオレンジ

export type SeatReservationType = 'all_reserved' | 'partially_reserved' | 'none';

export interface TrainTypeInfo {
  code: TrainCategory;
  name: LanguageText;
  shortName: LanguageText;
  badgeBg: string;      // Tailwind class or style
  badgeText: string;    // Tailwind text color
  borderColor?: string;
  lcdStyle: {
    bg: string;
    text: string;
    border?: string;
  };
  ledColor: 'green' | 'orange' | 'red' | 'amber' | 'white' | 'blue';
}

export type TrainStatus =
  | 'on_time'
  | 'approaching'
  | 'arrived'
  | 'boarding'
  | 'departing'
  | 'delayed'
  | 'cancelled';

export interface TrainService {
  id: string;
  trainNumber?: string;
  trainName?: LanguageText;
  type: TrainTypeInfo;
  destination: LanguageText;
  stationNumber?: string; // e.g. "NH01", "TA24"
  stationNumberBg?: string; // color badge e.g. blue for TA, red for NH, green for TK
  hasAirportIcon?: boolean; // ✈
  via?: LanguageText;
  scheduledTime: string; // HH:MM
  arrivalTime?: string;
  platform: string; // 1〜3 for up, 4〜8 for down
  cars?: number; // e.g. 6, 4, 8
  carModel?: string; // e.g. "6000系", "1200系", "2200系", "80000系"
  seatReservation?: SeatReservationType; // 全車指定席車, 一部指定席車, なし
  specialCarNote?: LanguageText;
  boardingInfo?: LanguageText;
  delayMinutes: number;
  status: TrainStatus;
  statusRemark?: LanguageText;
  isPlatformChanged?: boolean; // 番線変更フラグ
  originalPlatform?: string; // 変更前の番線
  isEvacuating?: boolean; // 退避待ちフラグ
  originStation?: LanguageText; // 当駅始発など
  isUserModified?: boolean; // ユーザー手動編集フラグ（自動生成による上書き防止）
}

export type DirectionType = 'down' | 'up'; // 下り | 上り
export type BoardViewMode = 'single_down' | 'single_up' | 'dual';
export type BoardMode = 'departures' | 'arrivals' | 'combined';
export type DisplayTheme = 'lcd' | 'meitetsu' | 'led';

export interface StationPreset {
  id: string;
  name: LanguageText;
  stationCode: string;
  lineName?: LanguageText;
  direction?: LanguageText;
  directionDown: {
    title: LanguageText;
    subtitle: LanguageText;
    destinations: string[];
    platforms: string[]; // 4〜8
    trains: TrainService[];
  };
  directionUp: {
    title: LanguageText;
    subtitle: LanguageText;
    destinations: string[];
    platforms: string[]; // 1〜3
    trains: TrainService[];
  };
  availablePlatforms?: string[];
  announcements: LanguageText[];
  trains?: TrainService[];
}

export interface BoardConfig {
  stationId: string;
  mode: BoardMode;
  theme: DisplayTheme;
  language: Language;
  autoCycleLanguage: boolean;
  cycleIntervalSeconds: number;
  soundEnabled: boolean;
  isSimulatedTime: boolean;
  simulatedTimeSpeed: number; // 1x, 2x, 5x
  showSeconds: boolean;
}

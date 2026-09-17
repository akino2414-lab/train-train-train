import { TrainCategory, TrainTypeInfo } from '../types';

export const TRAIN_TYPES: Record<TrainCategory, TrainTypeInfo> = {
  // 1. 特別快速（特快）: 赤地に黄色
  special_rapid: {
    code: 'special_rapid',
    name: {
      ja: '特別快速',
      en: 'Special Rapid',
    },
    shortName: {
      ja: '特快',
      en: 'Sp-Rap',
    },
    badgeBg: 'bg-[#d60000] text-[#ffe600]',
    badgeText: 'text-[#ffe600]',
    lcdStyle: {
      bg: 'bg-[#d60000]',
      text: 'text-[#ffe600]',
      border: 'border-[#ffe600]',
    },
    ledColor: 'red',
  },

  // 2. 快速特急（快特）: 白地に赤
  rapid_ltd_exp: {
    code: 'rapid_ltd_exp',
    name: {
      ja: '快速特急',
      en: 'Rapid Ltd. Exp.',
    },
    shortName: {
      ja: '快特',
      en: 'R-Ltd',
    },
    badgeBg: 'bg-white text-[#d60000]',
    badgeText: 'text-[#d60000]',
    lcdStyle: {
      bg: 'bg-white',
      text: 'text-[#d60000]',
      border: 'border-[#d60000]',
    },
    ledColor: 'red',
  },

  // 3. 特急: 赤地に白
  ltd_exp: {
    code: 'ltd_exp',
    name: {
      ja: '特急',
      en: 'Ltd. Express',
    },
    shortName: {
      ja: '特急',
      en: 'L-Exp',
    },
    badgeBg: 'bg-[#d60000] text-white',
    badgeText: 'text-white',
    lcdStyle: {
      bg: 'bg-[#d60000]',
      text: 'text-white',
      border: 'border-white',
    },
    ledColor: 'red',
  },

  // 4. 快速急行（快急）: 白地に青
  rapid_express: {
    code: 'rapid_express',
    name: {
      ja: '快速急行',
      en: 'Rapid Express',
    },
    shortName: {
      ja: '快急',
      en: 'R-Exp',
    },
    badgeBg: 'bg-white text-[#005bb5]',
    badgeText: 'text-[#005bb5]',
    lcdStyle: {
      bg: 'bg-white',
      text: 'text-[#005bb5]',
      border: 'border-[#005bb5]',
    },
    ledColor: 'orange',
  },

  // 5. 急行: 青地に白
  express: {
    code: 'express',
    name: {
      ja: '急行',
      en: 'Express',
    },
    shortName: {
      ja: '急行',
      en: 'Exp',
    },
    badgeBg: 'bg-[#005bb5] text-white',
    badgeText: 'text-white',
    lcdStyle: {
      bg: 'bg-[#005bb5]',
      text: 'text-white',
      border: 'border-white',
    },
    ledColor: 'orange',
  },

  // 6. 準急: 緑地に白
  semi_express: {
    code: 'semi_express',
    name: {
      ja: '準急',
      en: 'Semi Express',
    },
    shortName: {
      ja: '準急',
      en: 'S-Exp',
    },
    badgeBg: 'bg-[#008a38] text-white',
    badgeText: 'text-white',
    lcdStyle: {
      bg: 'bg-[#008a38]',
      text: 'text-white',
      border: 'border-white',
    },
    ledColor: 'green',
  },

  // 7. 区間準急（区準）: 白地に緑
  sub_semi_express: {
    code: 'sub_semi_express',
    name: {
      ja: '区間準急',
      en: 'Sub Semi Exp.',
    },
    shortName: {
      ja: '区準',
      en: 'Sub-S',
    },
    badgeBg: 'bg-white text-[#008a38]',
    badgeText: 'text-[#008a38]',
    lcdStyle: {
      bg: 'bg-white',
      text: 'text-[#008a38]',
      border: 'border-[#008a38]',
    },
    ledColor: 'green',
  },

  // 8. 普通: 鼠色地に白
  local: {
    code: 'local',
    name: {
      ja: '普通',
      en: 'Local',
    },
    shortName: {
      ja: '普通',
      en: 'Local',
    },
    badgeBg: 'bg-[#555f6d] text-white',
    badgeText: 'text-white',
    lcdStyle: {
      bg: 'bg-[#555f6d]',
      text: 'text-white',
      border: 'border-[#555f6d]',
    },
    ledColor: 'amber',
  },

  // --- 特急愛称・特急車両種別 ---

  // パノラマカー: 白地に赤
  panorama_car: {
    code: 'panorama_car',
    name: {
      ja: 'パノラマカー',
      en: 'Panorama Car',
    },
    shortName: {
      ja: 'パノラマ',
      en: 'Panorama',
    },
    badgeBg: 'bg-white text-[#d60000]',
    badgeText: 'text-[#d60000]',
    lcdStyle: {
      bg: 'bg-white',
      text: 'text-[#d60000]',
      border: 'border-[#d60000]',
    },
    ledColor: 'red',
  },

  // パノラマスーパー: 白地に赤
  panorama_super: {
    code: 'panorama_super',
    name: {
      ja: 'パノラマSuper',
      en: 'Panorama Super',
    },
    shortName: {
      ja: 'P-Super',
      en: 'P-Super',
    },
    badgeBg: 'bg-white text-[#d60000]',
    badgeText: 'text-[#d60000]',
    lcdStyle: {
      bg: 'bg-white',
      text: 'text-[#d60000]',
      border: 'border-[#d60000]',
    },
    ledColor: 'red',
  },

  // ミュースカイ: 白地に赤
  myu_sky: {
    code: 'myu_sky',
    name: {
      ja: 'ミュースカイ',
      en: 'μ-SKY',
    },
    shortName: {
      ja: 'μ-SKY',
      en: 'μ-SKY',
    },
    badgeBg: 'bg-white text-[#d60000]',
    badgeText: 'text-[#d60000]',
    lcdStyle: {
      bg: 'bg-white',
      text: 'text-[#d60000]',
      border: 'border-[#d60000]',
    },
    ledColor: 'blue',
  },

  // しまかぜ: 白地に水色
  shimakaze: {
    code: 'shimakaze',
    name: {
      ja: 'しまかぜ',
      en: 'SHIMAKAZE',
    },
    shortName: {
      ja: 'しまかぜ',
      en: 'Shimakaze',
    },
    badgeBg: 'bg-white text-[#00a3e0]',
    badgeText: 'text-[#00a3e0]',
    lcdStyle: {
      bg: 'bg-white',
      text: 'text-[#00a3e0]',
      border: 'border-[#00a3e0]',
    },
    ledColor: 'blue',
  },

  // 伊勢志摩ライナー: 白地に赤
  ise_shima_liner: {
    code: 'ise_shima_liner',
    name: {
      ja: '伊勢志摩ライナー',
      en: 'Ise-Shima Liner',
    },
    shortName: {
      ja: 'ISライナー',
      en: 'IS Liner',
    },
    badgeBg: 'bg-white text-[#d60000]',
    badgeText: 'text-[#d60000]',
    lcdStyle: {
      bg: 'bg-white',
      text: 'text-[#d60000]',
      border: 'border-[#d60000]',
    },
    ledColor: 'red',
  },

  // ひのとり: 白地に赤
  hinotori: {
    code: 'hinotori',
    name: {
      ja: 'ひのとり',
      en: 'HINOTORI',
    },
    shortName: {
      ja: 'ひのとり',
      en: 'Hinotori',
    },
    badgeBg: 'bg-white text-[#d60000]',
    badgeText: 'text-[#d60000]',
    lcdStyle: {
      bg: 'bg-white',
      text: 'text-[#d60000]',
      border: 'border-[#d60000]',
    },
    ledColor: 'red',
  },

  // ビスタカー: 白地にオレンジ
  vistacar: {
    code: 'vistacar',
    name: {
      ja: 'ビスタカー',
      en: 'Vistacar',
    },
    shortName: {
      ja: 'ビスタ',
      en: 'Vista',
    },
    badgeBg: 'bg-white text-[#ff6600]',
    badgeText: 'text-[#ff6600]',
    lcdStyle: {
      bg: 'bg-white',
      text: 'text-[#ff6600]',
      border: 'border-[#ff6600]',
    },
    ledColor: 'orange',
  },

  // アーバンライナー: 黒地に白（黒字に白）
  urban_liner: {
    code: 'urban_liner',
    name: {
      ja: 'アーバンライナー',
      en: 'Urban Liner',
    },
    shortName: {
      ja: 'アーバン',
      en: 'Urban',
    },
    badgeBg: 'bg-[#111111] text-white',
    badgeText: 'text-white',
    lcdStyle: {
      bg: 'bg-[#111111]',
      text: 'text-white',
      border: 'border-zinc-700',
    },
    ledColor: 'amber',
  },

  // ACE: 白地にオレンジ
  ace_upper: {
    code: 'ace_upper',
    name: {
      ja: 'ACE',
      en: 'ACE',
    },
    shortName: {
      ja: 'ACE',
      en: 'ACE',
    },
    badgeBg: 'bg-white text-[#ff6600]',
    badgeText: 'text-[#ff6600]',
    lcdStyle: {
      bg: 'bg-white',
      text: 'text-[#ff6600]',
      border: 'border-[#ff6600]',
    },
    ledColor: 'orange',
  },

  // Ace: 白地にオレンジ
  ace_lower: {
    code: 'ace_lower',
    name: {
      ja: 'Ace',
      en: 'Ace',
    },
    shortName: {
      ja: 'Ace',
      en: 'Ace',
    },
    badgeBg: 'bg-white text-[#ff6600]',
    badgeText: 'text-[#ff6600]',
    lcdStyle: {
      bg: 'bg-white',
      text: 'text-[#ff6600]',
      border: 'border-[#ff6600]',
    },
    ledColor: 'orange',
  },

  // スナックカー: 白地にオレンジ
  snack_car: {
    code: 'snack_car',
    name: {
      ja: 'スナックカー',
      en: 'Snack Car',
    },
    shortName: {
      ja: 'スナック',
      en: 'Snack',
    },
    badgeBg: 'bg-white text-[#ff6600]',
    badgeText: 'text-[#ff6600]',
    lcdStyle: {
      bg: 'bg-white',
      text: 'text-[#ff6600]',
      border: 'border-[#ff6600]',
    },
    ledColor: 'orange',
  },

  // サニーカー: 白地にオレンジ
  sunny_car: {
    code: 'sunny_car',
    name: {
      ja: 'サニーカー',
      en: 'Sunny Car',
    },
    shortName: {
      ja: 'サニー',
      en: 'Sunny',
    },
    badgeBg: 'bg-white text-[#ff6600]',
    badgeText: 'text-[#ff6600]',
    lcdStyle: {
      bg: 'bg-white',
      text: 'text-[#ff6600]',
      border: 'border-[#ff6600]',
    },
    ledColor: 'orange',
  },

  // 特急サンダーバード（683系）: 白地に青
  thunderbird: {
    code: 'thunderbird',
    name: {
      ja: '特急サンダーバード',
      en: 'Ltd. Exp. Thunderbird',
    },
    shortName: {
      ja: 'サンダーバード',
      en: 'Thunderbird',
    },
    badgeBg: 'bg-white text-[#003399]',
    badgeText: 'text-[#003399]',
    lcdStyle: {
      bg: 'bg-white',
      text: 'text-[#003399]',
      border: 'border-[#003399]',
    },
    ledColor: 'blue',
  },

  // 特急しなの（373系）: 白地にオレンジ
  shinano: {
    code: 'shinano',
    name: {
      ja: '特急しなの',
      en: 'Ltd. Exp. Shinano',
    },
    shortName: {
      ja: 'しなの',
      en: 'Shinano',
    },
    badgeBg: 'bg-white text-[#e65100]',
    badgeText: 'text-[#e65100]',
    lcdStyle: {
      bg: 'bg-white',
      text: 'text-[#e65100]',
      border: 'border-[#e65100]',
    },
    ledColor: 'orange',
  },
};

import { TrainService } from '../types';
import { isAllReservedVehicleModel } from '../data/vehicleModels';

export interface TrainStopsResult {
  stopsJa: string[];
  stopsEn: string[];
  seatNoticeJa: string;
  seatNoticeEn: string;
  crossNoteJa?: string;
  crossNoteEn?: string;
}

/**
 * 停車駅名の日英変換マッピング
 */
const STOP_EN_MAP: Record<string, string> = {
  三河花園: 'Mikawa-Hanazono',
  若林: 'Wakabayashi',
  土橋: 'Tsuchihashi',
  豊田市: 'Toyotashi',
  多治見: 'Tajimi',
  恵那: 'Ena',
  中津川: 'Nakatsugawa',
  南木曽: 'Nagiso',
  上松: 'Agematsu',
  木曽福島: 'Kiso-Fukushima',
  塩尻: 'Shiojiri',
  松本: 'Matsumoto',
  新安城: 'Shin-Anjo',
  東岡崎: 'Higashi-Okazaki',
  美合: 'Miai',
  本宿: 'Motojuku',
  国府: 'Kou',
  伊奈: 'Ina',
  八幡: 'Yawata',
  諏訪町: 'Suwacho',
  稲荷口: 'Inariguchi',
  豊川稲荷: 'Toyokawa-Inari',
  矢作橋: 'Yahagibashi',
  岡崎公園前: 'Okazaki-Koen-mae',
  男川: 'Otogawa',
  藤川: 'Fujikawa',
  名電山中: 'Meiden-Yamanaka',
  名電長沢: 'Meiden-Nagasawa',
  名電赤坂: 'Meiden-Akasaka',
  御油: 'Goyu',
  豊橋: 'Toyohashi',
  新豊橋: 'Shin-Toyohashi',
  愛知大学前: 'Aichi Univ.-mae',
  二川: 'Futagawa',
  新所原: 'Shinjohara',
  鷲津: 'Washizu',
  弁天島: 'Bentenjima',
  浜松: 'Hamamatsu',
  豊明: 'Toyoake',
  前後: 'Zengo',
  鳴海: 'Narumi',
  神宮前: 'Jingu-mae',
  金山: 'Kanayama',
  名鉄名古屋: 'Nagoya',
  近鉄名古屋: 'Nagoya',
  名古屋: 'Nagoya',
  栄生: 'Sako',
  須ヶ口: 'Sukaguchi',
  岩倉: 'Iwakura',
  犬山: 'Inuyama',
  犬山遊園: 'Inuyama-Yuen',
  新鵜沼: 'Shin-Unuma',
  新可児: 'Shin-Kani',
  名鉄一宮: 'Meitetsu-Ichinomiya',
  名鉄岐阜: 'Meitetsu-Gifu',
  笠松: 'Kasamatsu',
  太田川: 'Otagawa',
  尾張横須賀: 'Owari-Yokosuka',
  朝倉: 'Asakura',
  新舞子: 'Shin-Maiko',
  常滑: 'Tokoname',
  中部国際空港: 'Centrair',
  阿久比: 'Agui',
  知多半田: 'Chita-Handa',
  青山: 'Aoyama',
  知多武豊: 'Chita-Taketoyo',
  富貴: 'Fuki',
  河和: 'Kowa',
  内海: 'Utsumi',
  桑名: 'Kuwana',
  近鉄富田: 'Kintetsu-Tomida',
  近鉄四日市: 'Kintetsu-Yokkaichi',
  塩浜: 'Shiohama',
  伊勢若松: 'Ise-Wakamatsu',
  白子: 'Shiroko',
  江戸橋: 'Edobashi',
  津: 'Tsu',
  津新町: 'Tsu-shimmachi',
  久居: 'Hisai',
  伊勢中川: 'Ise-Nakagawa',
  松阪: 'Matsusaka',
  伊勢市: 'Iseshi',
  宇治山田: 'Ujiyamada',
  五十鈴川: 'Isuzugawa',
  鳥羽: 'Toba',
  志摩磯部: 'Shima-Isobe',
  鵜方: 'Ugata',
  賢島: 'Kashikojima',
  名張: 'Nabari',
  桔梗が丘: 'Kikyogaoka',
  美旗: 'Mihata',
  伊賀神戸: 'Iga-Kambe',
  青山町: 'Aoyamacho',
  榛原: 'Haibara',
  桜井: 'Sakurai',
  大和八木: 'Yamato-Yagi',
  大和高田: 'Yamato-Takada',
  五位堂: 'Goido',
  河内国分: 'Kawachi-Kokubu',
  布施: 'Fuse',
  鶴橋: 'Tsuruhashi',
  大阪上本町: 'Osaka-Uehommachi',
  近鉄日本橋: 'Kintetsu-Nippombashi',
  大阪難波: 'Osaka-Namba',
};

function translateStopToEn(stopJa: string): string {
  return STOP_EN_MAP[stopJa] || stopJa;
}

/**
 * 座席区分案内文（日本語）
 * ユーザー指示「さっきのPDFで全席指定と備考に書いてあるものは全席指定で動かしていいからね」
 */
function getSeatNoticeJa(train: TrainService): string {
  if (train.seatReservation === 'all_reserved' || isAllReservedVehicleModel(train.carModel || '')) {
    return '※全席指定席（特別車両券・ミューチケットまたは特急券が必要です）。';
  }
  if (train.seatReservation === 'partially_reserved') {
    return '※一部指定席車（1・2号車は特別車、乗車券のほかに特別車両券が必要です）。';
  }
  return '※全車一般車（特別料金・座席指定券は不要です）。';
}

/**
 * 座席区分案内文（英語）
 */
function getSeatNoticeEn(train: TrainService): string {
  if (train.seatReservation === 'all_reserved' || isAllReservedVehicleModel(train.carModel || '')) {
    return '*All seats reserved. μ-Ticket or Express ticket required.';
  }
  if (train.seatReservation === 'partially_reserved') {
    return '*Cars 1 & 2 are First Class Reserved cars (ticket required).';
  }
  return '*Standard seating only (No extra fare or reservation required).';
}

/**
 * 列車の停車駅および座席・乗り換え案内を算出
 * 
 * 厳格なユーザー指定要件：
 * 1. 【特別快速】：
 *    - 浜松までいかず豊橋まで！
 *    - 1600系6両、1700系8両、ごく稀に2200系かACE/Ace8両編成。全て全席指定。
 * 2. 【愛知大学前シャトル】：
 *    - 柳生橋と小池には止めない（豊橋〜愛知大学前ノンストップ）。電車は全部5600系。
 *    - 15:01に1本、16:31と16:46に1本折り返しの5600系（終点は全て金山駅）。
 * 3. 【近鉄線直通便】：
 *    - 名鉄線豊明から金山も通っている。名鉄の停車駅に準拠！
 * 4. 【太田川方面（空港・河和・内海等）】：
 *    - 神宮前でデルタ線になっているので、神宮前に停車してあとは名鉄の停車駅に沿って停車！
 * 5. 【浜松からの帰着便】：
 *    - 行先は一宮あるいは岩倉。
 * 6. 【しなの・サンダーバードの帰着便】：
 *    - 松本や中津川から帰ってくる。行先は一宮、岩倉、あるいは名古屋。
 * 7. 【全列車共通】：知立駅は完全通過。
 */
export function getTrainStopsInfo(
  train: TrainService,
  currentStation: string = '三河花園',
  direction: 'up' | 'down' = 'down'
): TrainStopsResult {
  const destJa = train.destination?.ja?.replace(/\s+/g, '') || '';
  const typeCode = train.type?.code;
  const typeNameJa = train.type?.name?.ja || '';
  const trainNum = train.trainNumber || '';

  // ==========================================
  // A-0. 【ひのとり 豊橋行】（ユーザー厳格指定：「ひのとり名古屋行は全て豊橋行に」「停車駅は東岡崎、豊橋の順番」）
  // ==========================================
  if (
    (typeCode === 'hinotori' || train.carModel?.includes('ひのとり') || trainNum.includes('ひのとり')) &&
    (destJa.includes('豊橋') || direction === 'up')
  ) {
    const stops = ['三河花園', '東岡崎', '豊橋'];
    return {
      stopsJa: stops,
      stopsEn: ['Mikawa-Hanazono', 'Higashi-Okazaki', 'Toyohashi'],
      seatNoticeJa: '※全席指定席（名阪・近鉄直通特急ひのとり・東岡崎、豊橋のみ停車）。',
      seatNoticeEn: '*All seats reserved (Hinotori Ltd. Exp. to Toyohashi via Higashi-Okazaki).',
      crossNoteJa: '【ひのとり 豊橋行・最速達】三河花園の次は 東岡崎、豊橋 の順に停車いたします（新安城・国府通過）',
      crossNoteEn: '[Hinotori to Toyohashi: Stops at Higashi-Okazaki and Toyohashi only]',
    };
  }

  // ==========================================
  // A-1. 【浜松行（上り・JR東海道本線直通）】（ユーザー指定：「浜松に行く電車そして帰ってくる電車消えちゃった」）
  // ==========================================
  if (destJa.includes('浜松')) {
    const isLtd = typeCode === 'ltd_exp' || typeCode === 'rapid_ltd_exp' || typeCode === 'special_rapid' || typeNameJa.includes('特急') || typeNameJa.includes('特別快速');
    const stops = isLtd
      ? ['三河花園', '新安城', '東岡崎', '国府', '豊橋', '二川', '新居町', '弁天島', '舞阪', '浜松']
      : ['三河花園', '新安城', '東岡崎', '美合', '本宿', '国府', '豊橋', '二川', '新居町', '弁天島', '舞阪', '浜松'];
    return {
      stopsJa: stops,
      stopsEn: stops.map(translateStopToEn),
      seatNoticeJa: getSeatNoticeJa(train),
      seatNoticeEn: getSeatNoticeEn(train),
      crossNoteJa: '【JR東海直通・浜松行】豊橋からJR東海道本線直通（知立駅完全通過）',
      crossNoteEn: '[Direct JR Service to Hamamatsu via Toyohashi]',
    };
  }

  // ==========================================
  // A-2. 【回送・当駅止まり・待機列車】（ユーザー指定：「待っている電車を造ってもいいと思う」）
  // ==========================================
  if (destJa.includes('回送') || destJa.includes('当駅止') || destJa.includes('待避')) {
    return {
      stopsJa: ['三河花園'],
      stopsEn: ['Mikawa-Hanazono'],
      seatNoticeJa: '※当駅止まり・回送列車です。ご乗車になれません。',
      seatNoticeEn: '*Out of service / Terminates at this station. Do not board.',
      crossNoteJa: '【当駅折り返し・発車待機中】',
      crossNoteEn: '[Terminating / Waiting for next departure]',
    };
  }

  // ==========================================
  // A. 【特別快速】豊橋行（上り・全席指定）
  // ==========================================
  if (typeCode === 'special_rapid' || typeNameJa.includes('特別快速')) {
    // 特別快速は浜松までいかず豊橋まで！
    const stops = ['三河花園', '新安城', '東岡崎', '国府', '豊橋'];
    return {
      stopsJa: stops,
      stopsEn: stops.map(translateStopToEn),
      seatNoticeJa: '※全席指定席（1600系・1700系・2200系・ACE特別快速／全車指定席です）。',
      seatNoticeEn: '*All seats reserved (Rapid Special to Toyohashi).',
      crossNoteJa: '【特別快速・全席指定】豊橋まで最速達運行（浜松方面へはまいりません）',
      crossNoteEn: '[Rapid Special: All Reserved to Toyohashi]',
    };
  }

  // ==========================================
  // B. 【渥美線・愛知大学前シャトル】（特急のみ・1日数回のみ）
  // ==========================================
  if (destJa.includes('愛知大学前')) {
    // 柳生橋と小池には止めない！電車は全部5600系、特急
    const stops = ['三河花園', '新安城', '東岡崎', '国府', '豊橋', '愛知大学前'];
    return {
      stopsJa: stops,
      stopsEn: stops.map(translateStopToEn),
      seatNoticeJa: '※全車一般車（名鉄5600系・特急愛知大学前行／1日数回のみ運行）。',
      seatNoticeEn: '*Standard cars only (5600 Series Ltd. Exp. to Aichi Univ.-mae).',
      crossNoteJa: '【特急 愛知大学前】豊橋〜愛知大学前ノンストップ（柳生橋・小池は通過）',
      crossNoteEn: '*Ltd. Exp. direct to Aichi Univ.-mae (Passes Yagyubashi & Koike)',
    };
  }

  // ==========================================
  // C. 【5600系折り返し金山行（15:01, 16:31, 16:46）】
  // ==========================================
  if (
    destJa.includes('金山') &&
    (train.carModel?.includes('5600') || trainNum.includes('560') || ['15:01', '16:31', '16:46'].includes(train.scheduledTime))
  ) {
    const stops = ['三河花園', '新安城', '豊明', '鳴海', '神宮前', '金山'];
    return {
      stopsJa: stops,
      stopsEn: stops.map(translateStopToEn),
      seatNoticeJa: '※全車一般車（愛知大学前発折り返し・5600系金山行）。',
      seatNoticeEn: '*Standard cars only (5600 Series returning to Kanayama).',
      crossNoteJa: '【折り返し5600系】愛知大学前からの帰着便・終点金山駅',
      crossNoteEn: '[Returning 5600 Series: Bound for Kanayama Terminus]',
    };
  }

  // ==========================================
  // D. 【太田川方面（神宮前でデルタ線分岐）】
  // 中部国際空港、河和、内海、太田川
  // ==========================================
  if (
    destJa.includes('空港') ||
    destJa.includes('中部') ||
    destJa.includes('河和') ||
    destJa.includes('内海') ||
    destJa.includes('太田川') ||
    destJa.includes('常滑')
  ) {
    if (destJa.includes('空港') || destJa.includes('中部')) {
      // ミュースカイ・空港特急（特急は豊明通過）
      const stops = ['三河花園', '神宮前', '金山', '太田川', '尾張横須賀', '朝倉', '新舞子', '常滑', '中部国際空港'];
      return {
        stopsJa: stops,
        stopsEn: stops.map(translateStopToEn),
        seatNoticeJa: getSeatNoticeJa(train),
        seatNoticeEn: getSeatNoticeEn(train),
        crossNoteJa: '※神宮前デルタ線経由・空港線直通（豊明駅は通過）',
        crossNoteEn: '*Via Jingu-mae Delta line direct to Centrair (Passes Toyoake)',
      };
    }
    if (destJa.includes('河和') || destJa.includes('内海')) {
      const term = destJa.includes('内海') ? '内海' : '河和';
      const stops = ['三河花園', '神宮前', '金山', '太田川', '阿久比', '知多半田', '青山', '知多武豊', '富貴', term];
      return {
        stopsJa: stops,
        stopsEn: stops.map(translateStopToEn),
        seatNoticeJa: getSeatNoticeJa(train),
        seatNoticeEn: getSeatNoticeEn(train),
        crossNoteJa: '※神宮前デルタ線経由・河和線直通（豊明駅は通過）',
        crossNoteEn: '*Via Jingu-mae Delta to Kowa Line (Passes Toyoake)',
      };
    }
    const stops = ['三河花園', '豊明', '鳴海', '神宮前', '太田川'];
    return {
      stopsJa: stops,
      stopsEn: stops.map(translateStopToEn),
      seatNoticeJa: getSeatNoticeJa(train),
      seatNoticeEn: getSeatNoticeEn(train),
      crossNoteJa: '※神宮前デルタ線経由太田川行',
      crossNoteEn: '*Via Jingu-mae Delta to Otagawa',
    };
  }

  // ==========================================
  // E. 【近鉄線直通便（特急・特別快速は豊明通過！）】
  // 津、鳥羽、宇治山田、五十鈴川、賢島、大阪上本町、大阪難波、名張、青山町、河内国分
  // ==========================================
  const isKintetsuDest =
    destJa.includes('鳥羽') ||
    destJa.includes('宇治山田') ||
    destJa.includes('五十鈴川') ||
    destJa.includes('賢島') ||
    destJa.includes('大阪上本町') ||
    destJa.includes('難波') ||
    destJa.includes('津') ||
    destJa.includes('名張') ||
    destJa.includes('青山町') ||
    destJa.includes('河内国分');

  if (isKintetsuDest) {
    // 観光特急 しまかぜ（特急は豊明通過！）
    if (typeCode === 'shimakaze' || train.carModel?.includes('しまかぜ')) {
      const stops = [
        '三河花園',
        '神宮前',
        '金山',
        '名古屋',
        '近鉄四日市',
        '伊勢市',
        '宇治山田',
        '鳥羽',
        '鵜方',
        '賢島',
      ];
      return {
        stopsJa: stops,
        stopsEn: stops.map(translateStopToEn),
        seatNoticeJa: '※全席プレミアムシート（観光特急しまかぜ・特別車両券が必要です）。',
        seatNoticeEn: '*All seats premium reserved. Special express ticket required.',
        crossNoteJa: '【近鉄直通特急・豊明通過】神宮前・金山・名古屋経由伊勢志摩直通',
        crossNoteEn: '[Kintetsu Through via Kanayama & Nagoya to Ise-Shima (Passes Toyoake)]',
      };
    }

    // 名阪甲特急 ひのとり（特急は豊明通過！）
    if (typeCode === 'hinotori' || train.carModel?.includes('ひのとり')) {
      const stops = [
        '三河花園',
        '神宮前',
        '金山',
        '名古屋',
        '津',
        '大和八木',
        '鶴橋',
        '大阪上本町',
      ];
      if (destJa.includes('難波')) stops.push('大阪難波');
      return {
        stopsJa: stops,
        stopsEn: stops.map(translateStopToEn),
        seatNoticeJa: '※全席指定席（名阪甲特急ひのとり・特別車両券が必要です）。',
        seatNoticeEn: '*All seats reserved (Meihan Express Hinotori).',
        crossNoteJa: '【近鉄直通特急・豊明通過】神宮前・金山・名古屋経由名阪甲特急',
        crossNoteEn: '[Kintetsu Through via Kanayama & Nagoya to Osaka (Passes Toyoake)]',
      };
    }

    // 一般近鉄特急（特急は豊明通過！）
    if (train.seatReservation === 'all_reserved' || typeCode === 'ltd_exp' || typeNameJa.includes('特急')) {
      const meitetsuSection = ['三河花園', '神宮前', '金山', '名古屋'];
      const kintetsuSection = ['桑名', '近鉄四日市', '白子', '津'];

      if (destJa.includes('大阪') || destJa.includes('難波') || destJa.includes('名張')) {
        kintetsuSection.push('名張', '大和八木', '鶴橋', '大阪上本町');
        if (destJa.includes('難波')) kintetsuSection.push('大阪難波');
      } else {
        kintetsuSection.push('久居', '伊勢中川', '松阪', '伊勢市', '宇治山田');
        if (destJa.includes('五十鈴川')) kintetsuSection.push('五十鈴川');
        if (destJa.includes('鳥羽') || destJa.includes('賢島')) {
          if (!kintetsuSection.includes('五十鈴川')) kintetsuSection.push('五十鈴川');
          kintetsuSection.push('鳥羽');
        }
        if (destJa.includes('賢島')) kintetsuSection.push('志摩磯部', '鵜方', '賢島');
      }

      const stops = [...meitetsuSection, ...kintetsuSection];
      return {
        stopsJa: stops,
        stopsEn: stops.map(translateStopToEn),
        seatNoticeJa: '※全席指定席（近鉄直通特急・特急券が必要です）。',
        seatNoticeEn: '*All seats reserved. Express ticket required.',
        crossNoteJa: '【近鉄直通特急・豊明通過】神宮前・金山・名古屋・近鉄特急停車駅に準拠',
        crossNoteEn: '[Kintetsu Through Ltd. Exp. (Passes Toyoake)]',
      };
    }

    // 近鉄直通 急行・快速（豊明・鳴海にも停車）
    const meitetsuSection = ['三河花園', '新安城', '豊明', '前後', '鳴海', '神宮前', '金山', '名古屋'];
    const kintetsuSection = ['桑名', '近鉄富田', '近鉄四日市', '塩浜', '伊勢若松', '白子', '江戸橋', '津'];
    if (destJa.includes('五十鈴川') || destJa.includes('宇治山田') || destJa.includes('鳥羽')) {
      kintetsuSection.push('津新町', '久居', '伊勢中川', '松阪', '伊勢市', '宇治山田');
      if (destJa.includes('五十鈴川')) kintetsuSection.push('五十鈴川');
      if (destJa.includes('鳥羽')) kintetsuSection.push('鳥羽');
    } else if (destJa.includes('名張') || destJa.includes('青山町') || destJa.includes('河内国分')) {
      kintetsuSection.push('久居', '伊勢中川', '榊原温泉口', '伊賀神戸', '美旗', '桔梗が丘', '名張');
      if (destJa.includes('青山町')) kintetsuSection.push('青山町');
      if (destJa.includes('河内国分')) kintetsuSection.push('榛原', '桜井', '大和八木', '大和高田', '五位堂', '河内国分');
    }
    const stops = [...meitetsuSection, ...kintetsuSection];
    return {
      stopsJa: stops,
      stopsEn: stops.map(translateStopToEn),
      seatNoticeJa: '※全車一般車（近鉄直通急行・乗車券のみでご利用いただけます）。',
      seatNoticeEn: '*Standard seating only (Direct Kintetsu Express).',
      crossNoteJa: '【近鉄直通急行】名鉄線豊明〜金山停車・近鉄急行停車駅準拠',
      crossNoteEn: '[Kintetsu Through Express via Meitetsu Toyoake - Kanayama]',
    };
  }

  // ==========================================
  // F. 【しなの・サンダーバードの帰着便（松本/中津川発、名古屋・岩倉・一宮行）】
  // ==========================================
  if (typeCode === 'shinano' || typeCode === 'thunderbird') {
    const isShinano = typeCode === 'shinano';
    const origin = isShinano ? '松本' : '中津川';
    const term = destJa.includes('一宮') ? '名鉄一宮' : destJa.includes('岩倉') ? '岩倉' : '名古屋';

    const stops = ['三河花園', '神宮前', '金山', '名古屋'];
    if (term === '岩倉') stops.push('岩倉');
    if (term === '名鉄一宮') stops.push('岩倉', '名鉄一宮');

    return {
      stopsJa: stops,
      stopsEn: stops.map(translateStopToEn),
      seatNoticeJa: `※全席指定席（JR直通特急${isShinano ? 'しなの' : 'サンダーバード'}・全車指定席です）。`,
      seatNoticeEn: `*All seats reserved (Through Ltd. Exp. ${isShinano ? 'Shinano' : 'Thunderbird'}).`,
      crossNoteJa: `【JR直通帰着便】${origin}発・中央西線から豊田線経由（終点：${term}）`,
      crossNoteEn: `[JR Returning: From ${origin} to ${term}]`,
    };
  }

  // ==========================================
  // G. 【浜松からの帰着便（行先は一宮あるいは岩倉）】
  // ==========================================
  if (destJa.includes('一宮') || destJa.includes('岩倉')) {
    const term = destJa.includes('一宮') ? '名鉄一宮' : '岩倉';
    const isLtd = typeCode === 'ltd_exp' || typeCode === 'rapid_ltd_exp' || typeNameJa.includes('特急');

    if (isLtd) {
      const stops = ['三河花園', '鳴海', '神宮前', '金山', '名古屋', '須ヶ口'];
      if (term === '岩倉') stops.push('岩倉');
      if (term === '名鉄一宮') stops.push('名鉄一宮');
      return {
        stopsJa: stops,
        stopsEn: stops.map(translateStopToEn),
        seatNoticeJa: getSeatNoticeJa(train),
        seatNoticeEn: getSeatNoticeEn(train),
        crossNoteJa: `【浜松発・JR直通帰着特急】終点：${term}`,
        crossNoteEn: `[Hamamatsu Returning Ltd. Exp. to ${term}]`,
      };
    }

    const stops = ['三河花園', '豊明', '前後', '鳴海', '神宮前', '金山', '名古屋', '栄生', '須ヶ口'];
    if (term === '岩倉') stops.push('西春', '岩倉');
    if (term === '名鉄一宮') stops.push('新清洲', '国府宮', '名鉄一宮');
    return {
      stopsJa: stops,
      stopsEn: stops.map(translateStopToEn),
      seatNoticeJa: getSeatNoticeJa(train),
      seatNoticeEn: getSeatNoticeEn(train),
      crossNoteJa: `【浜松発・JR直通帰着便】豊橋経由（終点：${term}）`,
      crossNoteEn: `[Hamamatsu Returning Train to ${term}]`,
    };
  }

  // ==========================================
  // H. 【豊田市・松本・中津川方面（上り・1番線発着）】
  // ==========================================
  // ユーザー厳格指定：松本で行く際は土橋、豊田市、多治見まで行ってあとはJRの停車駅に準拠
  if (destJa.includes('松本')) {
    const stops = ['三河花園', '土橋', '豊田市', '多治見', '恵那', '中津川', '南木曽', '上松', '木曽福島', '塩尻', '松本'];
    return {
      stopsJa: stops,
      stopsEn: stops.map(translateStopToEn),
      seatNoticeJa: '※全席指定席（特急しなの・JR中央西線直通特急券が必要です）。',
      seatNoticeEn: '*All seats reserved (Ltd. Exp. Shinano to Matsumoto).',
      crossNoteJa: '【松本行】土橋・豊田市・多治見経由 JR中央西線直通（JR停車駅準拠）',
      crossNoteEn: '[To Matsumoto via Tsuchihashi, Toyotashi, Tajimi & JR Chuo Line]',
    };
  }

  if (destJa.includes('中津川')) {
    const stops = ['三河花園', '土橋', '豊田市', '多治見', '恵那', '中津川'];
    return {
      stopsJa: stops,
      stopsEn: stops.map(translateStopToEn),
      seatNoticeJa: '※全席指定席（特急サンダーバード／中央線直通）。',
      seatNoticeEn: '*All seats reserved (Ltd. Exp. Thunderbird to Nakatsugawa).',
      crossNoteJa: '【中津川行】土橋・豊田市・多治見経由 JR中央線直通（JR停車駅準拠）',
      crossNoteEn: '[To Nakatsugawa via Tsuchihashi, Toyotashi, Tajimi & JR Line]',
    };
  }

  if (destJa.includes('豊田市')) {
    const isLtd = typeCode === 'ltd_exp' || typeNameJa.includes('特急');
    if (isLtd) {
      const stops = ['三河花園', '土橋', '豊田市'];
      return {
        stopsJa: stops,
        stopsEn: stops.map(translateStopToEn),
        seatNoticeJa: getSeatNoticeJa(train),
        seatNoticeEn: getSeatNoticeEn(train),
        crossNoteJa: '※豊田線特急（1番線発車・若林通過）',
        crossNoteEn: '*Toyota Line Ltd. Exp. (Dep. Trk 1, passes Wakabayashi)',
      };
    }
    const stops = ['三河花園', '若林', '土橋', '豊田市'];
    return {
      stopsJa: stops,
      stopsEn: stops.map(translateStopToEn),
      seatNoticeJa: getSeatNoticeJa(train),
      seatNoticeEn: getSeatNoticeEn(train),
      crossNoteJa: '※三河線・豊田線直通（1番線発車）',
      crossNoteEn: '*Mikawa / Toyota Line (Dep. Trk 1)',
    };
  }

  // ==========================================
  // I. 【標準名鉄線内（上り：東岡崎・豊橋・豊川稲荷方面）】
  // ==========================================
  // ユーザー厳格指定：豊川稲荷に行く電車は国府駅まで行ってあとは名鉄の停車駅に準拠
  if (destJa.includes('豊川稲荷')) {
    const isLtd = typeCode === 'ltd_exp' || typeCode === 'rapid_ltd_exp' || typeNameJa.includes('特急');
    let stops: string[];
    if (isLtd) {
      // 特急 豊川稲荷行（国府まで特急停車駅、国府以降は名鉄豊川線の全駅）
      stops = ['三河花園', '新安城', '東岡崎', '国府', '八幡', '諏訪町', '稲荷口', '豊川稲荷'];
    } else {
      // 快速急行・急行・普通 豊川稲荷行（国府まで急行停車駅、国府以降は名鉄豊川線停車駅）
      stops = ['三河花園', '新安城', '東岡崎', '美合', '本宿', '国府', '八幡', '諏訪町', '稲荷口', '豊川稲荷'];
    }
    return {
      stopsJa: stops,
      stopsEn: stops.map(translateStopToEn),
      seatNoticeJa: getSeatNoticeJa(train),
      seatNoticeEn: getSeatNoticeEn(train),
      crossNoteJa: '【豊川稲荷行】国府駅まで名鉄本線、国府より名鉄豊川線停車駅準拠',
      crossNoteEn: '[To Toyokawa-Inari via Meitetsu Main Line to Kou, then Toyokawa Line]',
    };
  }

  if (direction === 'up') {
    const isLtd = typeCode === 'ltd_exp' || typeCode === 'rapid_ltd_exp' || typeNameJa.includes('特急');
    if (isLtd) {
      const stops = ['三河花園', '新安城', '東岡崎', '国府'];
      // 上り特急の特別停車：伊奈駅（一般席・なしの場合のみ）
      if (train.seatReservation === 'none') {
        stops.push('伊奈');
      }
      if (destJa.includes('豊橋')) stops.push('豊橋');
      return {
        stopsJa: stops,
        stopsEn: stops.map(translateStopToEn),
        seatNoticeJa: getSeatNoticeJa(train),
        seatNoticeEn: getSeatNoticeEn(train),
        crossNoteJa: train.seatReservation === 'none' ? '※伊奈駅に特別停車いたします（知立通過）' : '※知立駅は通過いたします',
        crossNoteEn: train.seatReservation === 'none' ? '*Special stop at Ina (passes Chiryu)' : '*Passes Chiryu Station',
      };
    }

    // 急行・準急・普通
    const stops = ['三河花園', '新安城', '東岡崎', '美合', '本宿', '国府', '伊奈', '豊橋'];
    return {
      stopsJa: stops,
      stopsEn: stops.map(translateStopToEn),
      seatNoticeJa: getSeatNoticeJa(train),
      seatNoticeEn: getSeatNoticeEn(train),
      crossNoteJa: '※知立駅は全列車完全通過いたします',
      crossNoteEn: '*All trains pass Chiryu Station',
    };
  }

  // ==========================================
  // J. 【標準名鉄線内（下り：名古屋・岐阜・犬山方面）】
  // ==========================================
  const isLtd = typeCode === 'ltd_exp' || typeCode === 'rapid_ltd_exp' || typeNameJa.includes('特急');
  if (isLtd) {
    const stops = ['三河花園', '新安城'];
    // 下り特急の特別停車：鳴海駅（一般席・なしの場合のみ）
    if (train.seatReservation === 'none') {
      stops.push('鳴海');
    }
    stops.push('神宮前', '金山', '名古屋');
    if (destJa.includes('新鵜沼') || destJa.includes('犬山')) {
      stops.push('岩倉', '江南', '柏森', '犬山', '犬山遊園', '新鵜沼');
    } else if (destJa.includes('岐阜')) {
      stops.push('須ヶ口', '国府宮', '名鉄一宮', '新木曽川', '笠松', '名鉄岐阜');
    }
    return {
      stopsJa: stops,
      stopsEn: stops.map(translateStopToEn),
      seatNoticeJa: getSeatNoticeJa(train),
      seatNoticeEn: getSeatNoticeEn(train),
      crossNoteJa: train.seatReservation === 'none' ? '※鳴海駅に特別停車いたします（知立通過）' : '※知立駅は通過いたします',
      crossNoteEn: train.seatReservation === 'none' ? '*Special stop at Narumi (passes Chiryu)' : '*Passes Chiryu Station',
    };
  }

  // 下り急行・普通
  const stops = ['三河花園', '新安城', '豊明', '前後', '鳴海', '神宮前', '金山', '名古屋'];
  if (destJa.includes('岐阜')) {
    stops.push('須ヶ口', '国府宮', '名鉄一宮', '新木曽川', '笠松', '名鉄岐阜');
  } else if (destJa.includes('新鵜沼') || destJa.includes('犬山')) {
    stops.push('栄生', '西春', '岩倉', '布袋', '江南', '柏森', '扶桑', '犬山', '犬山遊園', '新鵜沼');
  }
  return {
    stopsJa: stops,
    stopsEn: stops.map(translateStopToEn),
    seatNoticeJa: getSeatNoticeJa(train),
    seatNoticeEn: getSeatNoticeEn(train),
    crossNoteJa: '※知立駅は全列車完全通過いたします',
    crossNoteEn: '*All trains pass Chiryu Station',
  };
}

/**
 * 方面別（上り・下り）の自動テロップ案内生成関数
 * ユーザー要件：「上りと下りで停車駅案内は分けて」
 */
export function generateDirectionTickerAnnouncement(
  trains: TrainService[],
  direction: 'down' | 'up',
  lang: 'ja' | 'en' = 'ja'
): string {
  const firstTrain = trains[0];
  if (!firstTrain) {
    return lang === 'ja'
      ? 'まもなく列車がまいります。黄色い点字ブロックの内側までお下がりください。'
      : 'Trains are approaching. Please wait behind the yellow line.';
  }

  const stopsInfo = getTrainStopsInfo(firstTrain, '三河花園', direction);
  const typeName = lang === 'ja' ? firstTrain.type.name.ja : firstTrain.type.name.en;
  const destName = lang === 'ja' ? firstTrain.destination.ja : firstTrain.destination.en;
  const stopsList = lang === 'ja' ? stopsInfo.stopsJa.slice(1).join('、') : stopsInfo.stopsEn.slice(1).join(', ');
  const seatNotice = lang === 'ja' ? stopsInfo.seatNoticeJa : stopsInfo.seatNoticeEn;
  const crossNote = (lang === 'ja' ? stopsInfo.crossNoteJa : stopsInfo.crossNoteEn) || '';

  if (lang === 'ja') {
    return `【停車駅のご案内】${firstTrain.scheduledTime}発 ${typeName} ${destName}ゆきの停車駅は、${stopsList} です。${seatNotice ? ` （${seatNotice}）` : ''} ${crossNote} ◆ 普通から快速急行をご利用のお客様は２階専用のりばでお乗り換えください。 ◆ 車内・駅構内は終日全面禁煙です。`;
  } else {
    return `[Stopping Stations] Dep. ${firstTrain.scheduledTime} ${typeName} for ${destName} stops at: ${stopsList}. ${seatNotice ? `(${seatNotice})` : ''} ${crossNote} ◆ Please wait behind the yellow tactile tiles. Smoking is strictly prohibited.`;
  }
}

/**
 * 上り・下り総合テロップ案内生成関数
 */
export function generateCombinedTickerAnnouncement(
  downTrains: TrainService[],
  upTrains: TrainService[]
): { ja: string; en: string } {
  const downJa = generateDirectionTickerAnnouncement(downTrains, 'down', 'ja');
  const downEn = generateDirectionTickerAnnouncement(downTrains, 'down', 'en');
  const upJa = generateDirectionTickerAnnouncement(upTrains, 'up', 'ja');
  const upEn = generateDirectionTickerAnnouncement(upTrains, 'up', 'en');
  return {
    ja: `【下り】${downJa} ◆ 【上り】${upJa}`,
    en: `[Downbound] ${downEn} ◆ [Upbound] ${upEn}`,
  };
}



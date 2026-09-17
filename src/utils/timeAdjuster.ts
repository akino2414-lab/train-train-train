import { TrainService } from '../types';

/**
 * Fisher-Yates アルゴリズムによる安全な配列シャッフル
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 【特別快速は並べないで ＆ 同じ行先が並ばないよう基本バラバラで】ルール
 * - 特別快速（special_rapid）が連続して並ばないようにする
 * - 同じ行先（destination.ja）が連続して並ばないように基本バラバラに再配置する
 */
export function avoidConsecutiveDestinationsAndSpecialRapid(trains: TrainService[]): TrainService[] {
  if (!trains || trains.length <= 1) return trains;

  const pool = [...trains];
  const result: TrainService[] = [];

  while (pool.length > 0) {
    const last = result[result.length - 1];

    let foundIdx = -1;
    for (let i = 0; i < pool.length; i++) {
      const cand = pool[i];
      const isCandSpecial = cand.type.code === 'special_rapid' || cand.type.name.ja.includes('特別快速');
      const isLastSpecial = last && (last.type.code === 'special_rapid' || last.type.name.ja.includes('特別快速'));

      // 条件1: 特別快速が連続しない
      if (isLastSpecial && isCandSpecial) continue;

      // 条件2: 行先が連続しない
      if (last && last.destination.ja === cand.destination.ja) continue;

      foundIdx = i;
      break;
    }

    // 理想的な候補が見つからなかった場合、行先だけでも違うもの、それもなければ先頭を取得
    if (foundIdx === -1) {
      for (let i = 0; i < pool.length; i++) {
        if (!last || last.destination.ja !== pool[i].destination.ja) {
          foundIdx = i;
          break;
        }
      }
    }

    if (foundIdx === -1) foundIdx = 0;

    result.push(pool.splice(foundIdx, 1)[0]);
  }

  return result;
}

export function avoidConsecutiveSpecialRapid(trains: TrainService[]): TrainService[] {
  return avoidConsecutiveDestinationsAndSpecialRapid(trains);
}

/**
 * 厳格な4階 / 2階の番線割り振りおよび遅延時の退避・番線変更ロジック
 * 
 * ユーザー厳格指定要件：
 * 1. 【特急や特別快速は9番線以降に入れてください】:
 *    - 1〜8番線: 普通〜快速急行（一般列車専用）
 *      - 上り一般: 1〜4番線
 *      - 下り一般: 5〜8番線
 *    - 9〜16番線: 特急・特別快速専用！
 *      - 上り特急・特別快速: 9〜11番線
 *        - 9番線: 特急 浜松行、特別快速 浜松行、特急 愛知大学前行（5600系）、特急 豊田市・松本・中津川方面
 *        - 10番線: 全車指定席車（ひのとり豊橋行、ミュースカイ豊橋行、しまかぜ等）
 *        - 11番線: 一般特急・特別快速（特別快速 豊橋行、特急 豊川稲荷行等）
 *      - 下り特急・特別快速: 12〜16番線
 *        - 【12〜14番線がメイン！！】
 *          - 12番線: 一般特急・特別快速（岐阜、新鵜沼、犬山、一宮等）
 *          - 13番線: 全車指定特急（名阪ひのとり大阪難波行、ミュースカイ、しまかぜ等）
 *          - 14番線: 豊田市・松本・中津川からの帰着特急、浜松からの帰着特急
 *        - 【15・16番線】: 当駅始発・折り返し・待機列車（全体の15〜20%）
 * 2. 【名古屋は全て下り】: 上りで万一名古屋行があれば豊橋行に自動置換
 * 3. 【ひのとりは豊橋行】: 停車駅は東岡崎、豊橋の順番
 */
export function assignStrictPlatform(
  train: TrainService,
  direction: 'down' | 'up',
  index: number
): TrainService {
  let modifiedTrain = { ...train };

  // ガード1: 【名古屋は全て下り】
  if (direction === 'up' && modifiedTrain.destination.ja.includes('名古')) {
    modifiedTrain.destination = { ja: '豊 橋', en: 'Toyohashi' };
    modifiedTrain.stationNumber = 'NH01';
    modifiedTrain.stationNumberBg = 'bg-[#005bb5]';
  }

  // ガード2: 【ひのとり名古屋行は全て豊橋行に】
  if (
    direction === 'up' &&
    (modifiedTrain.type.code === 'hinotori' || modifiedTrain.carModel?.includes('ひのとり'))
  ) {
    modifiedTrain.destination = { ja: '豊 橋', en: 'Toyohashi' };
    modifiedTrain.stationNumber = 'NH01';
    modifiedTrain.stationNumberBg = 'bg-[#800000]';
    modifiedTrain.specialCarNote = { ja: '全席指定席（東岡崎・豊橋停車）', en: 'All Reserved to Toyohashi' };
  }

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
  ].includes(modifiedTrain.type.code);

  const destJa = modifiedTrain.destination.ja || '';
  const originJa = modifiedTrain.originStation?.ja || '';
  const isAllReserved = modifiedTrain.seatReservation === 'all_reserved';
  const isNoneReserved = modifiedTrain.seatReservation === 'none';

  let platform = modifiedTrain.platform;
  let isPlatformChanged = modifiedTrain.isPlatformChanged || false;
  let originalPlatform = modifiedTrain.originalPlatform;
  let isEvacuating = modifiedTrain.isEvacuating || false;

  // 遅延シミュレーション（15本に1本程度）
  if (modifiedTrain.delayMinutes > 2 || index % 14 === 7) {
    isPlatformChanged = true;
    isEvacuating = true;
  }

  if (direction === 'up') {
    if (isLtdOrRapid) {
      // ユーザー厳格指定：「特急や特別快速は9番線以降に入れてください」
      // 上り特急・特別快速: 9〜11番線（8番線には絶対入れない！）
      if (
        destJa.includes('浜松') ||
        destJa.includes('愛知大学前') ||
        destJa.includes('豊田市') ||
        destJa.includes('中津川') ||
        destJa.includes('松本')
      ) {
        originalPlatform = '9';
        platform = isPlatformChanged ? '11' : '9'; // 9番線: 浜松・愛知大学前・豊田市・松本方面特急
      } else if (isAllReserved || modifiedTrain.type.code === 'hinotori' || modifiedTrain.type.code === 'myu_sky') {
        originalPlatform = '10';
        platform = isPlatformChanged ? '11' : '10'; // 10番線: 全車指定車（ひのとり豊橋行、ミュースカイ等）
      } else if (isNoneReserved) {
        originalPlatform = '11';
        platform = isPlatformChanged ? '9' : '11'; // 11番線: 一般特急・特別快速
      } else {
        originalPlatform = (index % 2 === 0) ? '10' : '11';
        platform = originalPlatform;
      }
    } else {
      // 2階上り 1〜4番線（一般列車専用）
      const upTracks = ['1', '2', '3', '4'];
      platform = upTracks[index % upTracks.length];
    }
  } else {
    // 下り
    if (isLtdOrRapid) {
      // 12〜16番線（特急・特別快速専用！12〜14番線がメイン！）
      if (originJa.includes('当駅止まり') || destJa.includes('回送')) {
        originalPlatform = '15';
        platform = '15'; // 15番線: 待避・回送
      } else if (originJa.includes('当駅始発')) {
        originalPlatform = (index % 2 === 0) ? '15' : '16';
        platform = isPlatformChanged ? (originalPlatform === '15' ? '16' : '15') : originalPlatform;
      } else if (
        originJa.includes('浜松') ||
        originJa.includes('豊田市') ||
        originJa.includes('松本') ||
        originJa.includes('中津川') ||
        modifiedTrain.id.includes('toyota') ||
        modifiedTrain.id.includes('matsumoto') ||
        modifiedTrain.id.includes('nakatsugawa') ||
        modifiedTrain.id.includes('hamamatsu')
      ) {
        originalPlatform = '14';
        platform = isPlatformChanged ? '12' : '14'; // 14番線メイン（直通帰着便）
      } else if (isAllReserved || modifiedTrain.type.code === 'hinotori' || modifiedTrain.type.code === 'myu_sky' || modifiedTrain.type.code === 'shimakaze') {
        // 13番線メイン（全車指定特急）
        originalPlatform = '13';
        platform = isPlatformChanged ? '12' : (index % 6 === 0 ? '16' : '13');
      } else if (isNoneReserved) {
        // 12番線メイン（一般特急・特別快速）
        originalPlatform = '12';
        platform = isPlatformChanged ? '14' : (index % 6 === 0 ? '15' : '12');
      } else {
        originalPlatform = (index % 2 === 0) ? '12' : '13';
        platform = originalPlatform;
      }
    } else {
      // 2階下り 5〜8番線（一般列車専用）
      const downTracks = ['5', '6', '7', '8'];
      platform = downTracks[index % downTracks.length];
    }
  }

  return {
    ...modifiedTrain,
    platform,
    isPlatformChanged,
    originalPlatform,
    isEvacuating,
  };
}

/**
 * ページ読み込み時およびリセット時に、現在時刻から近い時刻でダイヤを初期化する
 * ユーザー指定：「なんか上下とも発車時刻が一緒になっている　ばらばらにして」
 * 下りと上りのオフセット・刻みを完全にずらして同時刻発車を防止
 */
export function initializeTrainsWithCurrentTime(
  trains: TrainService[],
  baseDate: Date = new Date(),
  direction: 'down' | 'up' = 'down'
): TrainService[] {
  if (!trains || trains.length === 0) return [];

  // 1. シャッフルして並び順をランダム化
  const shuffled = shuffleArray(trains);

  // 2. 特別快速が並ばず、かつ同じ行先が連続しないよう基本バラバラに整列
  const ordered = avoidConsecutiveDestinationsAndSpecialRapid(shuffled);

  // 3. 発車時刻を上下で完全にずらし、同時刻の被りを防止（下りは+1分〜奇数傾向、上りは+3分〜偶数傾向）
  let cumulativeMinutes = direction === 'down' ? 1 : 3;

  // 下りと上りで異なるインターバルパターン
  const downSteps = [2, 3, 2, 4, 3, 2, 3];
  const upSteps = [3, 2, 4, 2, 3, 3, 4];
  const steps = direction === 'down' ? downSteps : upSteps;

  return ordered.map((train, idx) => {
    cumulativeMinutes += steps[idx % steps.length];

    const targetTime = new Date(baseDate.getTime() + cumulativeMinutes * 60 * 1000);
    const hh = String(targetTime.getHours()).padStart(2, '0');
    const mm = String(targetTime.getMinutes()).padStart(2, '0');

    const formatted = {
      ...train,
      scheduledTime: `${hh}:${mm}`,
    };

    return assignStrictPlatform(formatted, direction, idx);
  });
}

/**
 * 【自動更新エンジン】
 * 時間経過スピードを速く（5x, 30x, 60x等）しても、発車時刻を過ぎた列車をすべて安全に完了・排出し、
 * 同時に後続列車を末尾に補充して常に「これから発車する直近の列車」がリアルタイムに先頭へ並び続ける！
 */
export function advanceScheduleByTime(
  currentList: TrainService[],
  masterList: TrainService[],
  now: Date,
  direction: 'down' | 'up'
): TrainService[] {
  if (!currentList || currentList.length === 0) {
    return initializeTrainsWithCurrentTime(masterList, now, direction);
  }

  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  // 発車後20秒以上経過した列車（diff <= -20）をすべて判定して排出
  let activeTrains = [...currentList];
  let departedCount = 0;

  while (activeTrains.length > 0) {
    const first = activeTrains[0];
    const [h, m] = first.scheduledTime.split(':').map(Number);
    const trainSeconds = h * 3600 + m * 60 + (first.delayMinutes || 0) * 60;

    let diff = trainSeconds - currentSeconds;
    // 日付跨ぎ考慮（深夜23時〜0時等）
    if (diff < -43200) diff += 86400;
    if (diff > 43200) diff -= 86400;

    // 発車時刻から20秒以上経過した列車は発車完了とする
    if (diff <= -20) {
      activeTrains.shift();
      departedCount++;
    } else {
      break;
    }
  }

  // 残った列車のリアルタイム運行ステータス（接近・乗車中・平常）を自動更新
  activeTrains = activeTrains.map((train, idx) => {
    // 運休や手動キャンセルは維持
    if (train.status === 'cancelled') return train;

    const [h, m] = train.scheduledTime.split(':').map(Number);
    const trainSeconds = h * 3600 + m * 60 + (train.delayMinutes || 0) * 60;
    let diff = trainSeconds - currentSeconds;
    if (diff < -43200) diff += 86400;
    if (diff > 43200) diff -= 86400;

    // 乗車中：発車15秒前 〜 発車後20秒まで
    if (diff <= 15 && diff > -20) {
      return {
        ...train,
        status: 'boarding' as const,
      };
    }
    // 接近中：発車90秒前 〜 15秒前まで
    if (diff <= 90 && diff > 15) {
      return {
        ...train,
        status: 'approaching' as const,
      };
    }
    // 平常時（手動でapproaching/boardingにセットされていない限り、遠い列車はon_time）
    if (train.status === 'boarding' || train.status === 'approaching') {
      // 90秒より先ならon_timeに戻す
      return {
        ...train,
        status: 'on_time' as const,
      };
    }
    return train;
  });

  // もし発車した列車があれば、その分だけ末尾に新しい列車を順次補充！
  if (departedCount > 0) {
    let lastTrain = activeTrains[activeTrains.length - 1] || currentList[currentList.length - 1];
    let [lh, lm] = lastTrain.scheduledTime.split(':').map(Number);

    for (let k = 0; k < departedCount; k++) {
      const step = direction === 'down' 
        ? [2, 4, 3, 3, 2, 4][k % 6]
        : [3, 3, 4, 2, 4, 3][k % 6];
      lm += step;
      if (lm >= 60) {
        lh = (lh + Math.floor(lm / 60)) % 24;
        lm = lm % 60;
      }
      const nh = String(lh).padStart(2, '0');
      const nm = String(lm).padStart(2, '0');

      // 特別快速が並ばないようにテンプレートを選ぶ
      const lastInList = activeTrains[activeTrains.length - 1];
      const lastIsSpecial = lastInList && (lastInList.type.code === 'special_rapid' || lastInList.type.name.ja.includes('特別快速'));

      let candidates = masterList;
      if (lastIsSpecial) {
        candidates = masterList.filter((t) => t.type.code !== 'special_rapid' && !t.type.name.ja.includes('特別快速'));
      }

      const tmpl = candidates[Math.floor(Math.random() * candidates.length)];
      const newTrain: TrainService = {
        ...tmpl,
        id: `${tmpl.id}-${Date.now()}-${k}`,
        scheduledTime: `${nh}:${nm}`,
        delayMinutes: 0,
        status: 'on_time',
      };

      const withPlatform = assignStrictPlatform(newTrain, direction, activeTrains.length);
      activeTrains.push(withPlatform);
    }
  }

  // 最低でも30本以上の十分なリストを常に維持
  while (activeTrains.length < 30 && masterList.length > 0) {
    const last = activeTrains[activeTrains.length - 1];
    let [lh, lm] = (last?.scheduledTime || '20:00').split(':').map(Number);
    lm += 4;
    if (lm >= 60) {
      lh = (lh + 1) % 24;
      lm = lm % 60;
    }
    const nh = String(lh).padStart(2, '0');
    const nm = String(lm).padStart(2, '0');

    const tmpl = masterList[Math.floor(Math.random() * masterList.length)];
    const newTrain: TrainService = {
      ...tmpl,
      id: `${tmpl.id}-${Date.now()}-pad-${activeTrains.length}`,
      scheduledTime: `${nh}:${nm}`,
      delayMinutes: 0,
      status: 'on_time',
    };
    activeTrains.push(assignStrictPlatform(newTrain, direction, activeTrains.length));
  }

  return activeTrains;
}

/**
 * 互換用：1本送り出し
 */
export function advanceAndReplenishTrains(
  currentList: TrainService[],
  masterList: TrainService[],
  currentTime: Date,
  direction: 'down' | 'up'
): TrainService[] {
  return advanceScheduleByTime(currentList, masterList, currentTime, direction);
}

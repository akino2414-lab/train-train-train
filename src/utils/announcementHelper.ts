import { TrainService, DirectionType } from '../types';
import { getTrainStopsInfo } from './stationStops';

export interface BottomNoticeInfo {
  state: 'approaching' | 'boarding' | 'normal';
  badgeJa: string;
  badgeEn: string;
  textJa: string;
  textEn: string;
  fullTickerText: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  pingBg: string;
  textColor: string;
}

/**
 * ユーザー指定要件：
 * 「接近案内や乗車中案内などは全てLED、LCDの一番下段を変更して案内するように」
 * 
 * 先発列車（displayList[0]）の状態（接近中、乗車中、平常）を検知し、
 * LED・LCDの一番下段（案内・テロップ段）に表示する情報・スタイルを算出します。
 */
export function getBottomNoticeInfo(
  trains: TrainService[],
  currentTime: Date,
  stationName: string = '三河花園',
  direction: DirectionType = 'down',
  userCustomAnnouncement?: string
): BottomNoticeInfo {
  const firstTrain = trains && trains.length > 0 ? trains[0] : null;

  if (firstTrain && firstTrain.scheduledTime) {
    const [h, m] = firstTrain.scheduledTime.split(':').map(Number);
    const delay = firstTrain.delayMinutes || 0;
    const totalMinutes = h * 60 + m + delay;
    const adjustedH = Math.floor(totalMinutes / 60) % 24;
    const adjustedM = totalMinutes % 60;

    const trainDate = new Date(currentTime);
    trainDate.setHours(adjustedH, adjustedM, 0, 0);

    let diffMs = trainDate.getTime() - currentTime.getTime();
    // 日跨ぎ調整
    if (diffMs < -12 * 3600 * 1000) diffMs += 24 * 3600 * 1000;
    if (diffMs > 12 * 3600 * 1000) diffMs -= 24 * 3600 * 1000;
    const diffMin = Math.floor(diffMs / 60000);

    const platform = firstTrain.platform || (direction === 'down' ? '12' : '1');
    const typeName = firstTrain.type?.name?.ja || '列車';
    const typeNameEn = firstTrain.type?.name?.en || 'Train';
    const dest = firstTrain.destination?.ja || '名古屋';
    const destEn = firstTrain.destination?.en || 'Nagoya';
    const cars = firstTrain.cars || 6;
    const timeStr = firstTrain.scheduledTime;
    const delayNoteJa = delay > 0 ? `【約${delay}分遅れ】` : '';
    const delayNoteEn = delay > 0 ? ` [Delayed ${delay}min]` : '';

    // 1. 電車接近案内（発車3分前〜0分）: 一番下段を接近案内に変更
    if (diffMin <= 3 && diffMin > 0) {
      const jaMsg = `【まもなく ${platform}番線に 電車がまいります】${delayNoteJa}${timeStr}発 ${typeName} ${dest} ゆき (${cars}両編成) です。黄色い点字ブロックの内側までお下がりください。`;
      const enMsg = `[Train Approaching]${delayNoteEn} The ${timeStr} ${typeNameEn} for ${destEn} (${cars} cars) will arrive shortly on Track ${platform}. Please wait behind the yellow line.`;
      const full = `${jaMsg} ◆ ${enMsg}`;

      return {
        state: 'approaching',
        badgeJa: delay > 0 ? `接近中(${delay}分遅れ)` : 'まもなく到着',
        badgeEn: 'APPROACHING',
        textJa: jaMsg,
        textEn: enMsg,
        fullTickerText: full,
        badgeBg: 'bg-red-600',
        badgeBorder: 'border-red-400',
        badgeText: 'text-white font-black',
        pingBg: 'bg-red-400',
        textColor: 'text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]',
      };
    }

    // 2. 乗車中案内（発車0分〜2分後）: 一番下段を乗車中案内に変更
    if (diffMin <= 0 && diffMin >= -2) {
      const jaMsg = `【ただいま ${platform}番線の電車は ご乗車になれます】${delayNoteJa}${timeStr}発 ${typeName} ${dest} ゆき (${cars}両編成) です。発車までしばらくお待ちください。ご乗車の方はお近くの扉からご乗車ください。`;
      const enMsg = `[Now Boarding]${delayNoteEn} The ${timeStr} ${typeNameEn} for ${destEn} on Track ${platform} is now boarding. Please board now.`;
      const full = `${jaMsg} ◆ ${enMsg}`;

      return {
        state: 'boarding',
        badgeJa: 'ご乗車中',
        badgeEn: 'BOARDING',
        textJa: jaMsg,
        textEn: enMsg,
        fullTickerText: full,
        badgeBg: 'bg-emerald-600',
        badgeBorder: 'border-emerald-300',
        badgeText: 'text-white font-black',
        pingBg: 'bg-emerald-300',
        textColor: 'text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.8)]',
      };
    }
  }

  // 3. 平常時案内（各列車の停車駅・乗り換え・安全案内）
  const displayList = trains.slice(0, 3);
  const trainStopsList = displayList
    .map((t, i) => {
      const info = getTrainStopsInfo(t, stationName, direction);
      const stops = info.stopsJa.slice(1).join('・');
      const order = i === 0 ? '先発' : i === 1 ? '次発' : '次々発';
      const changeNotice = t.isPlatformChanged ? `【※番線変更：${t.platform}番線】` : '';
      const delayNotice = t.delayMinutes > 0 ? `【約${t.delayMinutes}分遅れ】` : '';
      return `【${order} ${t.scheduledTime}発 ${t.type.name.ja} ${t.destination.ja}ゆき】${delayNotice}${changeNotice} 停車駅：${stops || '終点まで各駅'} ${info.seatNoticeJa ? `(${info.seatNoticeJa})` : ''}`;
    })
    .join(' ◆ ');

  const customPart = userCustomAnnouncement ? `${userCustomAnnouncement} ◆ ` : '';
  const transferPart =
    direction === 'down'
      ? '【のりば案内】普通〜快速急行は2階（5〜8番線）、特急・特別快速・全車指定席は4階（12〜14番線メイン・15/16番線）でお乗り換えください。特急は豊明駅を通過します。'
      : '【のりば案内】普通〜快速急行は2階（1〜4番線）、特急・特別快速・全車指定席は4階（9〜11番線）でお乗り換えください。豊田市・松本・中津川方面は1番線/9番線です。';

  const defaultFull = `${customPart}${trainStopsList} ◆ ${transferPart} ◆ 黄色い点字ブロックの内側までお下がりください。`;

  return {
    state: 'normal',
    badgeJa: '案内・停車駅',
    badgeEn: 'INFORMATION',
    textJa: defaultFull,
    textEn: defaultFull,
    fullTickerText: defaultFull,
    badgeBg: 'bg-amber-950/80',
    badgeBorder: 'border-amber-600',
    badgeText: 'text-amber-300 font-bold',
    pingBg: 'bg-amber-400',
    textColor: 'text-amber-200',
  };
}

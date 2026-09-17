import React, { useState, useEffect } from 'react';
import { TrainService, DirectionType, Language } from '../../types';
import { stationAudio } from '../../utils/audio';
import { getTrainStopsInfo } from '../../utils/stationStops';
import { getBottomNoticeInfo } from '../../utils/announcementHelper';

interface KintetsuLCDDisplayProps {
  stationName?: string;
  direction: DirectionType;
  trains: TrainService[];
  currentTime: Date;
  onTrainClick?: (train: TrainService) => void;
  announcementText?: string;
}

/**
 * 写真1完全再現：近鉄線タイプ 3段フルカラーLCD発車標
 * - 発車時刻 Dep.Time / 種別 Sort / 行先 Destination / のりば Track
 * - 近鉄特有のカラーピル（普通: 青、快速急行: 赤、準急: 緑、急行: 橙、特急: 赤、ひのとり: 深紅、しまかぜ: 水色）
 * - 大きな漢字・ゆったりとした文字間隔・右下に青色ナンバリング四角バッジ
 * - 右端の丸角白四角パネルに濃紺ののりば数字
 */
export const KintetsuLCDDisplay: React.FC<KintetsuLCDDisplayProps> = ({
  stationName = '三河花園駅',
  direction,
  trains,
  currentTime,
  onTrainClick,
  announcementText,
}) => {
  // 日英自動切替
  const [showEnglish, setShowEnglish] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => {
      setShowEnglish((prev) => !prev);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 最大3段表示
  const displayTrains = trains.slice(0, 3);

  // 近鉄スタイルの種別背景＆文字色マッピング
  const getKintetsuTypeStyle = (typeCode: string) => {
    switch (typeCode) {
      case 'local':
        return {
          bg: 'bg-[#0052cc]', // 鮮やかな青
          text: 'text-white',
          border: 'border-[#3385ff]',
          nameJa: '普　通',
          nameEn: 'Local',
        };
      case 'semi_express':
      case 'sub_semi_express':
        return {
          bg: 'bg-[#1b8b36]', // 鮮やかな緑
          text: 'text-white',
          border: 'border-[#42b75f]',
          nameJa: '準　急',
          nameEn: 'Semi-Exp.',
        };
      case 'rapid_express':
        return {
          bg: 'bg-[#d81b1b]', // 鮮やかな赤
          text: 'text-white',
          border: 'border-[#ff4d4d]',
          nameJa: '快速急行',
          nameEn: 'Rapid Exp.',
        };
      case 'express':
        return {
          bg: 'bg-[#e65100]', // 近鉄特有の鮮やかなオレンジ/朱色
          text: 'text-white',
          border: 'border-[#ff833a]',
          nameJa: '急　行',
          nameEn: 'Express',
        };
      case 'special_rapid':
        return {
          bg: 'bg-[#c62828]',
          text: 'text-white',
          border: 'border-[#ff5f52]',
          nameJa: '特別快速',
          nameEn: 'Special Rapid',
        };
      case 'hinotori':
        return {
          bg: 'bg-[#800000]', // ひのとり深紅
          text: 'text-white',
          border: 'border-[#d4af37]',
          nameJa: '特急 ひのとり',
          nameEn: 'Ltd.Exp. HINOTORI',
        };
      case 'shimakaze':
        return {
          bg: 'bg-[#0099cc]', // しまかぜ水色
          text: 'text-white',
          border: 'border-cyan-300',
          nameJa: '特急 しまかぜ',
          nameEn: 'SHIMAKAZE',
        };
      case 'ise_shima_liner':
      case 'vistacar':
      case 'urban_liner':
      case 'ltd_exp':
      case 'rapid_ltd_exp':
      default:
        return {
          bg: 'bg-[#d81b1b]', // 近鉄特急赤
          text: 'text-white',
          border: 'border-[#ff6666]',
          nameJa: '特　急',
          nameEn: 'Ltd. Exp.',
        };
    }
  };

  // 近鉄特有の文字スペーシング（2文字なら間を広く空ける）
  const formatDestinationJa = (dest: string) => {
    const clean = dest.replace(/\s+/g, '');
    if (clean.length === 2) {
      return `${clean[0]}　　${clean[1]}`;
    }
    if (clean.length === 3) {
      return `${clean[0]} ${clean[1]} ${clean[2]}`;
    }
    if (clean.length === 4) {
      return `${clean.slice(0, 2)}　${clean.slice(2)}`;
    }
    return clean;
  };

  return (
    <div className="w-full flex flex-col items-center select-none font-sans">
      {/* 吊り下げ・設置ケーシング */}
      <div className="w-full max-w-4xl bg-[#1c2026] p-2.5 rounded-t-xl border-t border-x border-zinc-700 shadow-md flex items-center justify-between text-zinc-400 text-xs px-4">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-zinc-200">{stationName} 発車案内表示器（近鉄仕様LCD）</span>
          <span className="text-zinc-500">|</span>
          <span className="text-amber-400 font-semibold">
            {direction === 'down' ? '下り（津・鳥羽・賢島・大阪・名古屋方面）' : '上り（豊田市・浜松・豊橋方面）'}
          </span>
        </div>
        <div className="font-mono text-zinc-300">
          {currentTime.toLocaleTimeString('ja-JP', { hour12: false })}
        </div>
      </div>

      {/* メインLCD表示ユニット */}
      <div className="w-full max-w-4xl bg-[#0a0d12] border-4 border-[#252b35] rounded-b-xl shadow-2xl overflow-hidden p-3 sm:p-4">
        {/* LCDヘッダーバー（写真完全準拠） */}
        <div className="grid grid-cols-12 gap-2 text-zinc-400 text-xs sm:text-sm font-bold border-b border-zinc-700/80 pb-2 px-3 tracking-wider">
          <div className="col-span-3 flex items-baseline space-x-1.5">
            <span className="text-zinc-200 text-sm sm:text-base">発車時刻</span>
            <span className="text-[10px] sm:text-xs text-zinc-400 font-normal">Dep. Time</span>
          </div>
          <div className="col-span-3 text-center flex items-baseline justify-center space-x-1.5">
            <span className="text-zinc-200 text-sm sm:text-base">種別</span>
            <span className="text-[10px] sm:text-xs text-zinc-400 font-normal">Sort</span>
          </div>
          <div className="col-span-4 pl-3 flex items-baseline space-x-1.5">
            <span className="text-zinc-200 text-sm sm:text-base">行先</span>
            <span className="text-[10px] sm:text-xs text-zinc-400 font-normal">Destination</span>
          </div>
          <div className="col-span-2 text-right pr-2 flex items-baseline justify-end space-x-1.5">
            <span className="text-zinc-200 text-sm sm:text-base">のりば</span>
            <span className="text-[10px] sm:text-xs text-zinc-400 font-normal">Track</span>
          </div>
        </div>

        {/* 3段の列車行（写真完全準拠） */}
        <div className="divide-y divide-zinc-800/80">
          {displayTrains.map((train, idx) => {
            const typeStyle = getKintetsuTypeStyle(train.type.code);
            const isApproaching = train.status === 'approaching';
            const isBoarding = train.status === 'boarding' || train.status === 'arrived';

            return (
              <div
                key={train.id || idx}
                onClick={() => {
                  stationAudio.playDepartureMelodyByRoute(train.destination.ja, train.type.code);
                  onTrainClick?.(train);
                }}
                className={`grid grid-cols-12 gap-2 items-center py-3.5 sm:py-4 px-3 cursor-pointer transition ${
                  isApproaching
                    ? 'animate-row-approach bg-amber-500/15 border-l-4 border-l-amber-400'
                    : isBoarding
                    ? 'bg-emerald-500/15 border-l-4 border-l-emerald-400'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* 1. 発車時刻 (写真そのままの白いクリアな大文字) ＆ 接近・乗車中バッジ */}
                <div className="col-span-3 flex flex-col justify-center">
                  <div className="font-mono font-bold text-3xl sm:text-4xl text-white tracking-tighter drop-shadow flex items-center space-x-1.5">
                    <span
                      className={
                        isApproaching
                          ? 'text-amber-300 animate-pulse'
                          : isBoarding
                          ? 'text-emerald-300 animate-pulse'
                          : ''
                      }
                    >
                      {train.scheduledTime}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        stationAudio.playDepartureMelodyByRoute(train.destination.ja, train.type.code);
                      }}
                      className="p-1 text-zinc-400 hover:text-amber-300 text-xs transition"
                      title="発車メロディを再生"
                    >
                      🎵
                    </button>
                  </div>

                  {/* 接近・乗車中バッジ */}
                  {isApproaching && (
                    <div className="mt-1">
                      <span className="animate-approach-flash inline-flex items-center bg-amber-500 text-black text-[10px] sm:text-xs font-black px-2 py-0.5 rounded shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-black mr-1 animate-ping" />
                        <span>電車接近中</span>
                      </span>
                    </div>
                  )}
                  {isBoarding && (
                    <div className="mt-1">
                      <span className="animate-boarding-flash inline-flex items-center bg-emerald-500 text-black text-[10px] sm:text-xs font-black px-2 py-0.5 rounded shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white mr-1 animate-ping" />
                        <span>ご乗車になれます</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. 種別 (近鉄スタイルの鮮やかな角丸カラーピル) */}
                <div className="col-span-3 flex justify-center">
                  <div
                    className={`w-full max-w-[130px] sm:max-w-[150px] py-1.5 sm:py-2 rounded-sm text-center font-extrabold text-lg sm:text-2xl shadow-md border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
                  >
                    {showEnglish ? typeStyle.nameEn : typeStyle.nameJa}
                  </div>
                </div>

                {/* 3. 行先 (ゆったりとした漢字配置＋右下に四角いナンバリングバッジ) */}
                <div className="col-span-4 pl-3 flex items-center justify-between">
                  <div className="flex flex-col min-w-0">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-widest truncate font-sans">
                      {showEnglish
                        ? (train.destination.en || train.destination.ja)
                        : formatDestinationJa(train.destination.ja)}
                    </div>
                    {train.carModel && (
                      <div className="text-[11px] sm:text-xs text-amber-300/90 font-mono font-medium tracking-tight">
                        形式: {train.carModel} ({train.cars || 6}両)
                      </div>
                    )}
                  </div>

                  {/* 駅ナンバリングバッジ（写真のD18, D53, D49など近鉄・名鉄駅番） */}
                  {train.stationNumber && (
                    <div className="ml-2 px-1.5 py-0.5 bg-[#0066cc] text-white text-xs sm:text-sm font-mono font-bold rounded-sm shadow border border-blue-400">
                      {train.stationNumber}
                    </div>
                  )}
                </div>

                {/* 4. のりば (写真の角丸白四角パネルに太い濃紺数字 ＋ 接近/乗車中リング) */}
                <div className="col-span-2 flex justify-end pr-2">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shadow-lg border transition-all ${
                      isApproaching
                        ? 'bg-amber-400 border-amber-200 ring-2 ring-amber-400 animate-pulse'
                        : isBoarding
                        ? 'bg-emerald-400 border-emerald-200 ring-2 ring-emerald-400 animate-pulse'
                        : 'bg-white border-zinc-300'
                    }`}
                  >
                    <span
                      className={`text-3xl sm:text-4xl font-black leading-none ${
                        isApproaching || isBoarding ? 'text-black' : 'text-[#002b66]'
                      }`}
                    >
                      {train.platform}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 3段に満たない場合の空き枠 */}
          {displayTrains.length < 3 &&
            Array.from({ length: 3 - displayTrains.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="grid grid-cols-12 gap-2 items-center py-5 px-3 opacity-20"
              >
                <div className="col-span-3 text-2xl font-mono text-zinc-600">--:--</div>
                <div className="col-span-3 flex justify-center">
                  <div className="w-28 py-2 bg-zinc-800 rounded text-center text-zinc-600 text-sm">----</div>
                </div>
                <div className="col-span-4 pl-3 text-2xl text-zinc-600">----</div>
                <div className="col-span-2 flex justify-end pr-2">
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 font-bold">
                    -
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* 下部案内テロップ（ユーザー厳格指定：「接近案内や乗車中案内などは全てLED、LCDの一番下段を変更して案内するように」） */}
        {(() => {
          const bottomNotice = getBottomNoticeInfo(displayTrains, currentTime, stationName, direction, announcementText);
          const isApproaching = bottomNotice.state === 'approaching';
          const isBoarding = bottomNotice.state === 'boarding';

          return (
            <div
              className={`mt-2.5 -mx-3 px-3 py-1.5 flex items-center overflow-hidden transition-all duration-300 ${
                isApproaching
                  ? 'bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-y-2 border-red-500 shadow-[0_0_18px_rgba(239,68,68,0.7)]'
                  : isBoarding
                  ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border-y-2 border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.7)]'
                  : 'bg-gradient-to-r from-[#001026] via-[#000814] to-[#001026] border-y border-blue-900/60 shadow-inner'
              }`}
            >
              {/* 一面左端インジケータ */}
              <div className="flex items-center space-x-1.5 mr-2.5 shrink-0 select-none">
                {isApproaching ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-600 border border-red-300 text-white font-black text-xs animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.9)]">
                    <span>⚠</span>
                    <span>{showEnglish ? 'APPROACHING' : 'まもなく到着'}</span>
                  </span>
                ) : isBoarding ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 border border-emerald-300 text-white font-black text-xs animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.9)]">
                    <span>●</span>
                    <span>{showEnglish ? 'BOARDING' : 'ご乗車中'}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600 text-amber-300 font-bold text-xs">
                    <span>ℹ</span>
                    <span>{showEnglish ? 'INFO' : '案内'}</span>
                  </span>
                )}
              </div>

              {/* 一面全幅スクロールテロップ */}
              <div className="relative overflow-hidden w-full whitespace-nowrap select-none">
                <div
                  className={`inline-block animate-marquee-smooth font-mono font-bold tracking-wider ${
                    isApproaching
                      ? 'text-xs sm:text-sm text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]'
                      : isBoarding
                      ? 'text-xs sm:text-sm text-emerald-200 drop-shadow-[0_0_8px_rgba(167,243,208,0.9)]'
                      : 'text-xs sm:text-sm text-amber-100'
                  }`}
                >
                  {bottomNotice.fullTickerText}
                </div>
              </div>

              {/* 一面右端ランプ */}
              {(isApproaching || isBoarding) && (
                <div className="hidden sm:flex items-center space-x-1 shrink-0 ml-2 select-none">
                  <span className={`w-2 h-2 rounded-full ${isApproaching ? 'bg-red-400 animate-ping' : 'bg-emerald-400 animate-ping'}`} />
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* フッター補足説明 */}
      <div className="w-full max-w-4xl mt-3 flex items-center justify-between text-xs text-zinc-400 px-2">
        <span>※ 行をクリックすると列車の時刻・行先・のりば・遅延設定を直接編集できます。</span>
        <span className="text-blue-400 font-medium">日英表記は5秒毎に自動切り替え</span>
      </div>
    </div>
  );
};

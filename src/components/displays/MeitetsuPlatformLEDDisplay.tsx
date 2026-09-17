import React, { useState, useEffect } from 'react';
import { TrainService, DirectionType } from '../../types';
import { stationAudio } from '../../utils/audio';
import { getTrainStopsInfo } from '../../utils/stationStops';
import { getBottomNoticeInfo } from '../../utils/announcementHelper';

interface MeitetsuPlatformLEDDisplayProps {
  stationName?: string;
  direction: DirectionType;
  trains: TrainService[];
  currentTime: Date;
  onTrainClick?: (train: TrainService) => void;
  trackNumberLeft?: string;
  trackNumberRight?: string;
  destinationSummaryJa?: string;
  destinationSummaryEn?: string;
  announcementText?: string;
}

/**
 * 写真再現：名鉄ホーム 3段フルLED発車標
 * （写真3の名鉄ホーム吊り下げLED標を極限までリアルに3段化＆精密再現）
 * 
 * 特徴：
 * 1. 上部：名鉄ブルーの方面サイン（のりば丸番号＆矢印付）
 * 2. 3段LED表示（先発・次発・次々発）
 * 3. リアルな16×16 LEDドットマトリクス（アンバー・グリーン・レッド・ホワイト）
 * 4. のりば表示部：赤色丸LED＋接近点滅矢印（← ① / ② →）
 * 5. 種別のベタ反転LED枠（緑ベタ「準急」、青/赤ベタ「急行」「特急」）
 * 6. 流れるLED案内テロップ（ユーザー要望：「案内も流して」「普通から快速急行は２階で乗り換えてください」）
 */
export const MeitetsuPlatformLEDDisplay: React.FC<MeitetsuPlatformLEDDisplayProps> = ({
  stationName = '三河花園',
  direction,
  trains,
  currentTime,
  onTrainClick,
  trackNumberLeft,
  trackNumberRight,
  destinationSummaryJa,
  destinationSummaryEn,
  announcementText,
}) => {
  // 言語自動切替 (日本語 6秒 / 英語 4秒)
  const [lang, setLang] = useState<'ja' | 'en'>('ja');
  // 矢印点滅タイマー
  const [blink, setBlink] = useState<boolean>(true);

  useEffect(() => {
    const langTimer = setInterval(() => {
      setLang((prev) => (prev === 'ja' ? 'en' : 'ja'));
    }, 5500);
    const blinkTimer = setInterval(() => {
      setBlink((prev) => !prev);
    }, 600);
    return () => {
      clearInterval(langTimer);
      clearInterval(blinkTimer);
    };
  }, []);

  // 最大3段（先発・次発・次々発）
  const displayList = trains.slice(0, 3);

  const defaultLeftTrack = trackNumberLeft || (direction === 'down' ? '4' : '1');
  const defaultRightTrack = trackNumberRight || (direction === 'down' ? '5' : '2');

  const defaultDestSummaryJa = destinationSummaryJa || (direction === 'down'
    ? '名古屋・犬山・岐阜・津・大阪 方面'
    : '豊橋・東岡崎・豊田市・中津川 方面');
  const defaultDestSummaryEn = destinationSummaryEn || (direction === 'down'
    ? 'for Nagoya, Inuyama, Gifu, Tsu, Osaka'
    : 'for Toyohashi, Higashi-Okazaki, Toyotashi');

  // 名鉄LED種別スタイル（全種別完全対応・名鉄LED実物写真準拠）
  const getLEDTypeStyle = (train: TrainService) => {
    const code = (train.type?.code || '').toLowerCase();
    const nameJa = train.type?.name?.ja || '';

    if (code === 'special_rapid' || nameJa.includes('特別快速') || nameJa.includes('特快')) {
      return {
        bg: 'bg-[#d60000] text-[#ffe600]',
        border: 'border-[#ffe600]',
        labelJa: '特別快速',
        labelEn: 'Sp.Rapid',
        isFilled: true,
      };
    }
    if (code === 'rapid_ltd_exp' || nameJa.includes('快特') || nameJa.includes('快速特急')) {
      return {
        bg: 'bg-[#d60000] text-white',
        border: 'border-[#ff3333]',
        labelJa: '快速特急',
        labelEn: 'RapidLtd',
        isFilled: true,
      };
    }
    if (code === 'myu_sky' || nameJa.includes('ミュースカイ') || nameJa.includes('μ-SKY')) {
      return {
        bg: 'bg-[#005bb5] text-white',
        border: 'border-[#38bdf8]',
        labelJa: 'μ-SKY',
        labelEn: 'μ-SKY',
        isFilled: true,
      };
    }
    if (code === 'shimakaze' || nameJa.includes('しまかぜ')) {
      return {
        bg: 'bg-[#0077aa] text-white',
        border: 'border-[#00a3e0]',
        labelJa: 'しまかぜ',
        labelEn: 'Shimakaze',
        isFilled: true,
      };
    }
    if (code === 'hinotori' || nameJa.includes('ひのとり')) {
      return {
        bg: 'bg-[#800000] text-[#ffd700]',
        border: 'border-[#ffd700]',
        labelJa: 'ひのとり',
        labelEn: 'Hinotori',
        isFilled: true,
      };
    }
    if (code === 'shinano' || nameJa.includes('しなの')) {
      return {
        bg: 'bg-[#cc4400] text-white',
        border: 'border-[#ff6600]',
        labelJa: 'しなの',
        labelEn: 'Shinano',
        isFilled: true,
      };
    }
    if (code === 'thunderbird' || nameJa.includes('サンダーバード')) {
      return {
        bg: 'bg-[#002266] text-white',
        border: 'border-[#003399]',
        labelJa: 'ｻﾝﾀﾞｰﾊﾞｰﾄﾞ',
        labelEn: 'Thunderbird',
        isFilled: true,
      };
    }
    if (code === 'panorama_super' || nameJa.includes('パノラマ')) {
      return {
        bg: 'bg-[#d60000] text-white',
        border: 'border-[#ff3333]',
        labelJa: 'P-Super',
        labelEn: 'P-Super',
        isFilled: true,
      };
    }
    if (code === 'ltd_exp' || nameJa.includes('特急')) {
      return {
        bg: 'bg-[#d60000] text-white',
        border: 'border-[#ff3333]',
        labelJa: '特　急',
        labelEn: 'Ltd.Exp',
        isFilled: true,
      };
    }
    if (code === 'rapid_express' || nameJa.includes('快急') || nameJa.includes('快速急行')) {
      return {
        bg: 'bg-[#005bb5] text-white',
        border: 'border-[#38bdf8]',
        labelJa: '快速急行',
        labelEn: 'RapidExp',
        isFilled: true,
      };
    }
    if (code === 'express' || nameJa.includes('急行')) {
      // 名鉄標準：青ベタ白抜きLED
      return {
        bg: 'bg-[#004ca3] text-white',
        border: 'border-[#38bdf8]',
        labelJa: '急　行',
        labelEn: 'Express',
        isFilled: true,
      };
    }
    if (code === 'semi_express' || nameJa.includes('準急')) {
      // 名鉄実物写真再現：緑ベタ白文字LED
      return {
        bg: 'bg-[#008a38] text-white',
        border: 'border-[#22c55e]',
        labelJa: '準　急',
        labelEn: 'SemiExp',
        isFilled: true,
      };
    }
    if (code === 'sub_semi_express' || nameJa.includes('区準')) {
      return {
        bg: 'bg-[#008a38] text-white',
        border: 'border-[#008a38]',
        labelJa: '区　準',
        labelEn: 'SubSemi',
        isFilled: true,
      };
    }
    // 普通：名鉄LED実物は緑色LED文字
    return {
      bg: 'bg-transparent text-[#38e068]',
      border: 'border-[#15803d]',
      labelJa: '普　通',
      labelEn: 'Local',
      isFilled: false,
    };
  };

  return (
    <div className="w-full flex flex-col items-center select-none font-mono my-3">
      {/* 吊り下げ金具 */}
      <div className="flex justify-between w-[85%] max-w-3xl px-12 -mb-1">
        <div className="w-4 h-6 bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-800 shadow-md border-x border-zinc-900" />
        <div className="w-4 h-6 bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-800 shadow-md border-x border-zinc-900" />
      </div>

      {/* 1. 最上部 名鉄コーポレートブルー 方面案内看板（写真3完全再現） */}
      <div className="w-full max-w-3xl bg-[#004ca3] border-4 border-[#1e2329] rounded-t-lg p-2 flex items-center justify-between text-white shadow-xl">
        {/* 左矢印＆のりば */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-white font-sans">←</span>
          <div className="w-8 h-8 rounded-full bg-white text-[#004ca3] font-black text-lg flex items-center justify-center shadow">
            {defaultLeftTrack}
          </div>
        </div>

        {/* 方面案内文字 */}
        <div className="flex flex-col text-center px-2">
          <span className="text-base sm:text-xl font-black tracking-widest leading-tight">
            {defaultDestSummaryJa}
          </span>
          <span className="text-[10px] sm:text-xs text-blue-100 font-sans tracking-tight leading-none">
            {defaultDestSummaryEn}
          </span>
        </div>

        {/* 右矢印＆のりば */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-white text-[#004ca3] font-black text-lg flex items-center justify-center shadow">
            {defaultRightTrack}
          </div>
          <span className="text-2xl font-bold text-white font-sans">→</span>
        </div>
      </div>

      {/* 2. LED発車標 メイン表示器本体（スチールフレーム＆3段LEDパネル） */}
      <div className="w-full max-w-3xl bg-gradient-to-b from-[#181a1f] via-[#101216] to-[#0a0b0d] border-4 border-[#2b3038] border-t-0 rounded-b-lg p-2.5 sm:p-3 shadow-[0_20px_40px_rgba(0,0,0,0.9)]">
        {/* LEDパネルスクリーン（黒のドットマトリクス感） */}
        <div className="bg-[#050607] border-2 border-[#1f2329] rounded p-2 shadow-inner relative overflow-hidden">
          {/* ドットマトリクス調の背景スキャンライン */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle, #333 1px, transparent 1px)',
              backgroundSize: '4px 4px',
            }}
          />

          {/* ヘッダー部（写真3再現：のりば・種別・行先・時刻・両数 ＋ 接近/乗車中ステータス） */}
          <div className="grid grid-cols-12 gap-1 pb-1 mb-1.5 border-b border-zinc-800 text-[10px] sm:text-xs text-zinc-400 font-sans font-bold items-center">
            <div className="col-span-2 text-center text-red-400">のりば Track</div>
            <div className="col-span-2 text-center text-green-400">種別 Type</div>
            <div className="col-span-5 text-left pl-2 text-amber-400 flex items-center justify-between">
              <span>行先 Destination</span>
              {displayList.some((t) => t.status === 'approaching') && (
                <span className="animate-approach-flash text-[9px] text-red-300 font-bold bg-red-950/80 px-1 py-0.2 rounded border border-red-500 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping inline-block" />
                  <span>接近中</span>
                </span>
              )}
              {displayList.some((t) => t.status === 'boarding' || t.status === 'arrived') && (
                <span className="animate-boarding-flash text-[9px] text-emerald-300 font-bold bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-500 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>乗車中</span>
                </span>
              )}
            </div>
            <div className="col-span-2 text-right text-amber-400">時刻 Time</div>
            <div className="col-span-1 text-center text-zinc-300">両数</div>
          </div>

          {/* 3段LED発車案内リスト */}
          <div className="flex flex-col space-y-2">
            {[0, 1, 2].map((idx) => {
              const train = displayList[idx];

              if (!train) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="h-10 flex items-center justify-center text-zinc-700 text-xs font-mono"
                  >
                    -----------------------------
                  </div>
                );
              }

              const ledStyle = getLEDTypeStyle(train);
              const isFirstRow = idx === 0;
              const isApproaching = train.status === 'approaching';
              const isBoarding = train.status === 'boarding' || train.status === 'arrived';
              const hasAlert = isApproaching || isBoarding;

              return (
                <div
                  key={train.id || idx}
                  onClick={() => {
                    stationAudio.playDepartureMelodyByRoute(train.destination.ja, train.type.code);
                    onTrainClick?.(train);
                  }}
                  className={`grid grid-cols-12 gap-1 items-center py-1 cursor-pointer hover:bg-zinc-900/60 rounded px-1 transition-colors border-b border-zinc-900 last:border-b-0 ${
                    isApproaching
                      ? 'bg-amber-950/20'
                      : isBoarding
                      ? 'bg-emerald-950/20'
                      : ''
                  }`}
                >
                  {/* 1. のりば表示部：写真3再現（赤丸LED ＋ 接近点滅矢印 ＋ 接近/乗車中ランプ） */}
                  <div className="col-span-2 flex items-center justify-center space-x-1">
                    {/* 左のりば矢印（偶数番線等） */}
                    {train.platform === defaultLeftTrack && (
                      <span
                        className={`text-red-500 font-bold text-sm sm:text-base leading-none transition-opacity ${
                          hasAlert
                            ? blink
                              ? 'opacity-100 drop-shadow-[0_0_10px_rgba(239,68,68,1)] scale-110'
                              : 'opacity-20'
                            : isFirstRow && blink
                            ? 'opacity-100 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]'
                            : 'opacity-30'
                        }`}
                      >
                        ←
                      </span>
                    )}

                    {/* 赤色丸LED番号 */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 border-red-600 bg-red-950/70 text-red-400 font-black text-xs sm:text-sm flex items-center justify-center ${
                        hasAlert
                          ? 'ring-2 ring-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                          : 'shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                      }`}
                    >
                      {train.platform}
                    </div>

                    {/* 右のりば矢印（奇数番線等） */}
                    {train.platform !== defaultLeftTrack && (
                      <span
                        className={`text-red-500 font-bold text-sm sm:text-base leading-none transition-opacity ${
                          hasAlert
                            ? blink
                              ? 'opacity-100 drop-shadow-[0_0_10px_rgba(239,68,68,1)] scale-110'
                              : 'opacity-20'
                            : isFirstRow && blink
                            ? 'opacity-100 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]'
                            : 'opacity-30'
                        }`}
                      >
                        →
                      </span>
                    )}
                  </div>

                  {/* 2. 種別表示部：写真3再現（ベタ反転LED枠） */}
                  <div className="col-span-2 flex justify-center">
                    <div
                      className={`px-1.5 py-0.5 rounded text-xs sm:text-sm font-black tracking-wider leading-none border ${ledStyle.border} ${ledStyle.bg} shadow-[0_0_8px_rgba(0,255,100,0.3)]`}
                    >
                      {lang === 'ja' ? ledStyle.labelJa : ledStyle.labelEn}
                    </div>
                  </div>

                  {/* 3. 行先表示部 ＆ 接近・乗車中点滅案内 */}
                  <div className="col-span-5 flex items-center pl-2 overflow-hidden space-x-1.5">
                    {/* 通常行先（接近時・乗車中時は点滅と交互または並列表示） */}
                    <div className="flex items-center min-w-0 overflow-hidden">
                      <span className="text-[#ff9900] font-black text-sm sm:text-lg tracking-widest truncate drop-shadow-[0_0_6px_rgba(255,153,0,0.8)]">
                        {lang === 'ja' ? train.destination.ja : train.destination.en}
                      </span>
                      {train.carModel && (
                        <span className="ml-1 text-[9px] font-mono text-amber-300 border border-amber-500/60 px-1 rounded bg-black/80 shrink-0 hidden sm:inline">
                          {train.carModel}
                        </span>
                      )}
                      {train.seatReservation === 'all_reserved' && (
                        <span className="ml-1 text-[9px] font-bold text-[#ff3333] border border-red-600 px-1 rounded bg-black hidden sm:inline">
                          全指
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4. 時刻表示部：アンバーLEDデジタル数字 ＆ 赤色LED遅延表示 */}
                  <div className="col-span-2 text-right flex flex-col items-end justify-center">
                    <span className="text-[#ffaa00] font-extrabold text-sm sm:text-lg tracking-tight font-mono drop-shadow-[0_0_6px_rgba(255,170,0,0.8)] leading-tight">
                      {train.scheduledTime}
                    </span>
                    {train.delayMinutes > 0 && (
                      <span className="text-red-500 font-bold text-[9px] sm:text-[10px] leading-none animate-pulse drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                        遅れ{train.delayMinutes}分
                      </span>
                    )}
                  </div>

                  {/* 5. 両数表示部 */}
                  <div className="col-span-1 text-center">
                    <span className="text-[#ffcc00] font-bold text-xs sm:text-sm drop-shadow-[0_0_4px_rgba(255,204,0,0.7)]">
                      {train.cars || 6}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. 流れるLED案内テロップ（ユーザー厳格指定：「接近案内や乗車中案内などは全てLED、LCDの一番下段を変更して案内するように」） */}
          {(() => {
            const bottomNotice = getBottomNoticeInfo(displayList, currentTime, stationName, direction, announcementText);
            const isApproaching = bottomNotice.state === 'approaching';
            const isBoarding = bottomNotice.state === 'boarding';

            return (
              <div
                className={`mt-2 -mx-2 px-3 py-1.5 flex items-center overflow-hidden transition-all duration-300 ${
                  isApproaching
                    ? 'bg-gradient-to-r from-red-950 via-black to-red-950 border-y-2 border-red-600 shadow-[0_0_16px_rgba(239,68,68,0.7)]'
                    : isBoarding
                    ? 'bg-gradient-to-r from-emerald-950 via-black to-emerald-950 border-y-2 border-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.7)]'
                    : 'bg-[#06080c] border-y border-zinc-800 shadow-inner'
                }`}
              >
                {/* 一面左端LED状態標示（実機LED表示板準拠） */}
                <div className="flex items-center space-x-1 shrink-0 mr-2.5 select-none">
                  {isApproaching ? (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-900 border border-red-500 text-red-200 font-mono font-black text-[11px] animate-pulse">
                      <span className="text-red-400">●</span>
                      <span>{lang === 'ja' ? '接近中' : 'APPROACH'}</span>
                    </span>
                  ) : isBoarding ? (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-900 border border-emerald-400 text-emerald-200 font-mono font-black text-[11px] animate-pulse">
                      <span className="text-emerald-400">◆</span>
                      <span>{lang === 'ja' ? '乗車中' : 'BOARDING'}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 border border-green-700 text-green-400 font-mono font-bold text-[11px]">
                      <span>■</span>
                      <span>{lang === 'ja' ? '案内' : 'INFO'}</span>
                    </span>
                  )}
                </div>

                {/* 一面全幅スクロールテロップ（端から端まで一面で文字が流れるリアルLEDマトリクス） */}
                <div className="relative overflow-hidden w-full whitespace-nowrap select-none">
                  <div
                    className={`inline-block animate-marquee-smooth font-mono font-bold tracking-widest ${
                      isApproaching
                        ? 'text-xs sm:text-sm text-red-300 drop-shadow-[0_0_8px_rgba(239,68,68,1)]'
                        : isBoarding
                        ? 'text-xs sm:text-sm text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,1)]'
                        : 'text-xs sm:text-sm text-[#ffaa00] drop-shadow-[0_0_6px_rgba(255,170,0,0.8)]'
                    }`}
                  >
                    {bottomNotice.fullTickerText}
                  </div>
                </div>

                {/* 一面右端LED点滅インジケータ */}
                {(isApproaching || isBoarding) && (
                  <div className="hidden sm:flex items-center space-x-1 shrink-0 ml-2 select-none">
                    <span className={`w-2 h-2 rounded-full ${isApproaching ? 'bg-red-500 animate-ping' : 'bg-emerald-400 animate-ping'}`} />
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* 4. 最下部 安全喚起プレート（名鉄ホーム標準ステッカー） */}
        <div className="mt-2 bg-[#f0f0f2] text-zinc-900 px-3 py-1 rounded border border-zinc-400 flex items-center justify-between text-[11px] font-bold shadow-inner">
          <span className="text-red-700 flex items-center gap-1">
            <span className="text-amber-500">⚠</span>
            <span>黄色い点字ブロックの内側までお下がりください</span>
          </span>
          <span className="text-blue-900 hidden sm:inline">
            名古屋鉄道 MEITETSU
          </span>
        </div>
      </div>
    </div>
  );
};

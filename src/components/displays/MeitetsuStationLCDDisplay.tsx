import React, { useState, useEffect } from 'react';
import { TrainService, DirectionType } from '../../types';
import { getTrainStopsInfo } from '../../utils/stationStops';
import { stationAudio } from '../../utils/audio';
import { getBottomNoticeInfo } from '../../utils/announcementHelper';

interface MeitetsuStationLCDDisplayProps {
  stationName?: string;
  direction: DirectionType;
  trains: TrainService[];
  currentTime: Date;
  onTrainClick?: (train: TrainService) => void;
  trackNumber?: string;
  directionTitleJa?: string;
  directionTitleEn?: string;
  arrowDirection?: 'left' | 'right';
  announcementText?: string;
}

/**
 * 写真再現：名鉄 名古屋駅ホーム 3段フルカラーLCD発車標
 * （アップロードされた image.png を極限まで忠実に再現）
 * 
 * 特徴：
 * 1. 最上部：黒地看板に「1 岩倉・犬山・可児 方面 / for Iwakura,Inuyama,Kani」
 * 2. 1段目（先発）：
 *    - 「先発」
 *    - 種別枠（紫「急」Express、赤「特」Ltd.Exp、水色「普」Local、緑「準」Semi Exp.等）
 *    - 行先枠（緑枠「新鵜沼」、水色枠「岩 倉」など）
 *    - 先発のみ詳細な停車駅欄（[停車駅] 桑・犬山・犬山遊園・新鵜沼 など）
 *    - 時刻（13:29）、両数（4両）
 * 3. 2段目（次発）・3段目（次々発）：同様のフォーマット
 * 4. 案内スクロールテロップ（「普通から快速急行は２階でお乗り換えください」等）
 * 5. 下部ケーシング：メタリックシルバーの筐体、中央に太い「← 1」のりば矢印
 */
export const MeitetsuStationLCDDisplay: React.FC<MeitetsuStationLCDDisplayProps> = ({
  stationName = '三河花園',
  direction,
  trains,
  currentTime,
  onTrainClick,
  trackNumber,
  directionTitleJa,
  directionTitleEn,
  arrowDirection,
  announcementText,
}) => {
  // 自動言語切替 (日本語 8s / 英語 4s)
  const [lang, setLang] = useState<'ja' | 'en'>('ja');
  useEffect(() => {
    const timer = setInterval(() => {
      setLang((prev) => (prev === 'ja' ? 'en' : 'ja'));
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // 最大3段（先発・次発・次々発）
  const displayList = trains.slice(0, 3);

  // トラック番号と方面のデフォルト
  const defaultTrack = trackNumber || (direction === 'down' ? '4' : '1');
  const defaultArrow = arrowDirection || (direction === 'down' ? 'right' : 'left');

  const defaultTitleJa = directionTitleJa || (direction === 'down'
    ? '名古屋・犬山・岐阜・津・大阪 方面'
    : '豊橋・東岡崎・豊田市・中津川 方面');
  const defaultTitleEn = directionTitleEn || (direction === 'down'
    ? 'for Nagoya, Inuyama, Gifu, Tsu, Osaka'
    : 'for Toyohashi, Higashi-Okazaki, Toyotashi');

  // 先発列車の停車駅情報
  const firstTrain = displayList[0];
  const firstStopsInfo = firstTrain ? getTrainStopsInfo(firstTrain, stationName, direction) : null;
  const firstStopsText = firstStopsInfo?.stopsJa?.length
    ? firstStopsInfo.stopsJa.slice(1).join('・')
    : firstTrain
    ? `${firstTrain.destination.ja}まで各駅に停車`
    : '';

  // 種別の色と英語表記スタイル（全種別完全対応・名鉄実物準拠）
  const getBadgeStyle = (train: TrainService) => {
    const code = (train.type?.code || '').toLowerCase();
    const nameJa = train.type?.name?.ja || '';

    if (code === 'special_rapid' || nameJa.includes('特別快速') || nameJa.includes('特快')) {
      return {
        border: 'border-[#ffe600]',
        bg: 'bg-[#d60000]',
        textColor: 'text-[#ffe600]',
        char: '特快',
        en: 'Rapid Special',
      };
    }
    if (code === 'rapid_ltd_exp' || nameJa.includes('快特') || nameJa.includes('快速特急')) {
      return {
        border: 'border-[#d60000]',
        bg: 'bg-white',
        textColor: 'text-[#d60000]',
        char: '快特',
        en: 'Rapid Ltd. Exp.',
      };
    }
    if (code === 'myu_sky' || nameJa.includes('ミュースカイ') || nameJa.includes('μ-SKY')) {
      return {
        border: 'border-[#0088ff]',
        bg: 'bg-white',
        textColor: 'text-[#005bb5]',
        char: 'μ-SKY',
        en: 'Airport Ltd. Exp.',
      };
    }
    if (code === 'shimakaze' || nameJa.includes('しまかぜ')) {
      return {
        border: 'border-[#00a3e0]',
        bg: 'bg-[#0077aa]',
        textColor: 'text-white',
        char: 'しまかぜ',
        en: 'Shimakaze',
      };
    }
    if (code === 'hinotori' || nameJa.includes('ひのとり')) {
      return {
        border: 'border-[#ffd700]',
        bg: 'bg-[#800000]',
        textColor: 'text-[#ffd700]',
        char: 'ひのとり',
        en: 'Hinotori',
      };
    }
    if (code === 'shinano' || nameJa.includes('しなの')) {
      return {
        border: 'border-[#ff6600]',
        bg: 'bg-[#cc4400]',
        textColor: 'text-white',
        char: 'しなの',
        en: 'Shinano',
      };
    }
    if (code === 'thunderbird' || nameJa.includes('サンダーバード')) {
      return {
        border: 'border-[#003399]',
        bg: 'bg-[#002266]',
        textColor: 'text-white',
        char: 'ｻﾝﾀﾞｰﾊﾞｰﾄﾞ',
        en: 'Thunderbird',
      };
    }
    if (code === 'panorama_super' || nameJa.includes('パノラマ')) {
      return {
        border: 'border-[#d60000]',
        bg: 'bg-white',
        textColor: 'text-[#d60000]',
        char: 'P-Super',
        en: 'Panorama Super',
      };
    }
    if (code === 'ltd_exp' || nameJa.includes('特急')) {
      return {
        border: 'border-[#e60012]',
        bg: 'bg-[#b8000a]',
        textColor: 'text-white',
        char: '特',
        en: 'Ltd. Exp.',
      };
    }
    if (code === 'rapid_express' || nameJa.includes('快急') || nameJa.includes('快速急行')) {
      return {
        border: 'border-[#0088ff]',
        bg: 'bg-white',
        textColor: 'text-[#005bb5]',
        char: '快急',
        en: 'Rapid Exp.',
      };
    }
    if (code === 'express' || nameJa.includes('急行')) {
      return {
        border: 'border-[#38bdf8]',
        bg: 'bg-[#005bb5]',
        textColor: 'text-white',
        char: '急',
        en: 'Express',
      };
    }
    if (code === 'semi_express' || nameJa.includes('準急')) {
      return {
        border: 'border-[#22c55e]',
        bg: 'bg-[#008a38]',
        textColor: 'text-white',
        char: '準',
        en: 'Semi Exp.',
      };
    }
    if (code === 'sub_semi_express' || nameJa.includes('区準')) {
      return {
        border: 'border-[#008a38]',
        bg: 'bg-white',
        textColor: 'text-[#008a38]',
        char: '区準',
        en: 'Sub Semi',
      };
    }
    // 普通：鼠色〜水色
    return {
      border: 'border-[#38bdf8]',
      bg: 'bg-[#164e63]',
      textColor: 'text-white',
      char: '普',
      en: 'Local',
    };
  };

  // 行先枠の色（写真再現：新鵜沼は緑枠、岩倉は水色枠、新可児は緑枠）
  const getDestBoxBorder = (train: TrainService) => {
    const d = train.destination.ja;
    if (d.includes('岩倉') || d.includes('普通')) return 'border-[#38bdf8]';
    if (d.includes('新鵜沼') || d.includes('新可児') || d.includes('岐阜') || d.includes('犬山')) return 'border-[#4ade80]';
    if (d.includes('豊橋') || d.includes('名古屋') || d.includes('賢島') || d.includes('大阪')) return 'border-[#f87171]';
    return 'border-[#38bdf8]';
  };

  return (
    <div className="w-full flex flex-col items-center select-none font-sans my-3">
      {/* 吊り下げロッド（本物の駅ホーム天吊り金具） */}
      <div className="flex justify-between w-[85%] max-w-2xl px-12 -mb-1">
        <div className="w-4 h-6 bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-800 shadow-md border-x border-zinc-900" />
        <div className="w-4 h-6 bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-800 shadow-md border-x border-zinc-900" />
      </div>

      {/* 表示器本体外枠（スチールケーシング） */}
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#40444a] via-[#2f3338] to-[#25282c] p-2.5 rounded-t-md rounded-b-lg shadow-[0_15px_35px_rgba(0,0,0,0.85)] border-2 border-[#5a5f66] relative">
        {/* 四隅のボルトネジ */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-zinc-400 border border-zinc-700 shadow-inner flex items-center justify-center text-[8px] text-zinc-800 font-mono font-bold">+</div>
        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-zinc-400 border border-zinc-700 shadow-inner flex items-center justify-center text-[8px] text-zinc-800 font-mono font-bold">+</div>
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-zinc-400 border border-zinc-700 shadow-inner flex items-center justify-center text-[8px] text-zinc-800 font-mono font-bold">+</div>
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-zinc-400 border border-zinc-700 shadow-inner flex items-center justify-center text-[8px] text-zinc-800 font-mono font-bold">+</div>

        {/* 1. 最上部方面案内看板（写真再現：黒背景に太字白文字） */}
        <div className="w-full bg-[#0a0c10] border border-zinc-700 rounded-sm py-1.5 px-3 mb-2 flex items-center justify-center space-x-3 shadow-inner">
          <span className="text-white font-extrabold text-lg sm:text-xl font-mono tracking-wider">
            {defaultTrack}
          </span>
          <div className="flex flex-col text-center">
            <span className="text-white font-bold text-sm sm:text-base tracking-widest leading-tight">
              {defaultTitleJa}
            </span>
            <span className="text-zinc-300 font-mono text-[10px] tracking-tight leading-none">
              {defaultTitleEn}
            </span>
          </div>
        </div>

        {/* 2. LCDモニター画面ベゼル */}
        <div className="bg-[#050608] border-[3px] border-[#1c1f24] rounded p-2.5 shadow-inner">
          {/* 3段発車案内リスト */}
          <div className="flex flex-col space-y-2">
            {[0, 1, 2].map((idx) => {
              const train = displayList[idx];
              const orderLabel = idx === 0 ? '先発' : idx === 1 ? '次発' : '次々発';
              const orderLabelEn = idx === 0 ? '1st' : idx === 1 ? '2nd' : '3rd';

              if (!train) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="h-16 flex items-center justify-center border-b border-zinc-800/80 text-zinc-600 text-xs font-mono"
                  >
                    -- 列車がありません --
                  </div>
                );
              }

              const badge = getBadgeStyle(train);
              const destBorder = getDestBoxBorder(train);
              const isApproaching = train.status === 'approaching';
              const isBoarding = train.status === 'boarding' || train.status === 'arrived';

              return (
                <div
                  key={train.id || idx}
                  onClick={() => {
                    stationAudio.playDepartureMelodyByRoute(train.destination.ja, train.type.code);
                    onTrainClick?.(train);
                  }}
                  className={`cursor-pointer group transition-all rounded p-1.5 border-b border-zinc-800/90 last:border-b-0 pb-2 ${
                    isApproaching
                      ? 'animate-row-approach border-l-4 border-l-amber-500 bg-amber-950/20'
                      : isBoarding
                      ? 'border-l-4 border-l-emerald-500 bg-emerald-950/20 shadow-[inset_0_0_12px_rgba(16,185,129,0.15)]'
                      : 'hover:bg-[#0c1322]'
                  }`}
                >
                  {/* メイン行：[先発ラベル/種別] [行先] [接近/乗車中] [発車時刻] [両数] */}
                  <div className="flex items-center justify-between gap-1.5 sm:gap-3">
                    {/* 左側：順序ラベル ＆ 種別ボックス */}
                    <div className="flex items-center space-x-1.5 min-w-[76px] sm:min-w-[96px]">
                      {/* 先発・次発・次々発 */}
                      <div className="flex flex-col items-center justify-center w-7 sm:w-8">
                        <span className="text-zinc-300 text-[10px] sm:text-xs font-bold leading-none">
                          {lang === 'ja' ? orderLabel : orderLabelEn}
                        </span>
                        {/* 接近/乗車中ミニインジケーター */}
                        {isApproaching && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 animate-ping" />
                        )}
                        {isBoarding && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 animate-ping" />
                        )}
                      </div>

                      {/* 種別ボックス（写真再現：色枠＋白抜き漢字＋下に英語） */}
                      <div className={`flex flex-col items-center justify-center px-1.5 sm:px-2.5 py-0.5 rounded border-2 ${badge.border} ${badge.bg} shadow-md`}>
                        <span className={`text-base sm:text-xl font-extrabold leading-none ${badge.textColor}`}>
                          {badge.char}
                        </span>
                        <span className="text-[9px] text-zinc-200 font-sans tracking-tight leading-none">
                          {badge.en}
                        </span>
                      </div>
                    </div>

                    {/* 中央：行先ボックス（写真再現：色枠囲み＋白太文字＋下に英語） ＆ 接近・乗車中バッジ */}
                    <div className="flex-1 flex items-center flex-wrap gap-1.5">
                      <div className={`flex items-center px-2.5 sm:px-4 py-0.5 rounded border-2 ${destBorder} bg-black/50 shadow-inner`}>
                        <div className="flex flex-col">
                          <span className="text-white font-extrabold text-lg sm:text-2xl tracking-widest leading-tight">
                            {train.destination.ja}
                          </span>
                          <span className="text-zinc-300 text-[10px] font-sans font-medium tracking-tight leading-none">
                            {train.destination.en}
                          </span>
                        </div>
                      </div>

                      {/* 補足注記（例：「犬山から普通」「全車指定」等） */}
                      {train.seatReservation === 'all_reserved' ? (
                        <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-600 hidden sm:inline">
                          全席指定
                        </span>
                      ) : train.destination.ja.includes('可児') ? (
                        <span className="text-[10px] text-zinc-300 font-sans hidden sm:inline">
                          犬山から普通
                        </span>
                      ) : null}

                      {/* 形式バッジ */}
                      {train.carModel && (
                        <span className="text-[10px] sm:text-[11px] font-mono font-bold text-sky-200 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-600 shrink-0 hidden sm:inline">
                          {train.carModel}
                        </span>
                      )}
                    </div>

                    {/* 右側：発車時刻（太角デジタル数字） ＆ 遅れ表示 ＆ 両数 */}
                    <div className="flex items-center space-x-2 sm:space-x-3 text-right">
                      <div className="flex flex-col items-end">
                        <div
                          className={`font-extrabold font-mono text-xl sm:text-2xl tracking-tight leading-none ${
                            isApproaching
                              ? 'text-amber-300 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                              : isBoarding
                              ? 'text-emerald-300 animate-pulse drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                              : train.delayMinutes > 0
                              ? 'text-rose-300'
                              : 'text-white'
                          }`}
                        >
                          {train.scheduledTime}
                        </div>
                        {train.delayMinutes > 0 && (
                          <div className="mt-0.5 flex items-center space-x-0.5">
                            <span className="inline-flex items-center bg-red-600 border border-red-300 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                              約{train.delayMinutes}分遅れ
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center justify-center bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded min-w-[38px]">
                        <span className="text-white font-bold text-xs sm:text-sm leading-none">
                          {train.cars || 4}両
                        </span>
                        <span className="text-[8px] text-zinc-400 leading-none">Cars</span>
                      </div>

                      {/* メロディ再生ボタン */}
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
                  </div>

                  {/* 1段目（先発）のみ：詳細停車駅欄（写真再現：[停車駅] 桑・犬山・犬山遊園・新鵜沼） */}
                  {idx === 0 && (
                    <div className="mt-1.5 pt-1 border-t border-zinc-800/60 flex items-center text-[11px] sm:text-xs text-zinc-200">
                      <span className="bg-zinc-800 text-zinc-200 font-bold px-1.5 py-0.2 rounded mr-2 text-[10px] shrink-0 border border-zinc-600">
                        停車駅
                      </span>
                      <span className="truncate tracking-wide text-zinc-100 font-medium">
                        {firstStopsText}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 下部案内スクロールテロップ（ユーザー厳格指定：「案内テロップ（一番下段）の切り替え連動は一番下一面にしてくれるとリアルです」） */}
          {(() => {
            const bottomNotice = getBottomNoticeInfo(displayList, currentTime, stationName, direction, announcementText);
            const isApproaching = bottomNotice.state === 'approaching';
            const isBoarding = bottomNotice.state === 'boarding';

            return (
              <div
                className={`mt-2.5 -mx-2.5 px-3 py-1.5 flex items-center overflow-hidden transition-all duration-300 ${
                  isApproaching
                    ? 'bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-y-2 border-red-500 shadow-[0_0_18px_rgba(239,68,68,0.7)]'
                    : isBoarding
                    ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border-y-2 border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.7)]'
                    : 'bg-gradient-to-r from-[#0d121c] via-[#080b12] to-[#0d121c] border-y border-zinc-800 shadow-inner'
                }`}
              >
                {/* 一面左端ステータス表示（駅サイネージ実機風） */}
                <div className="flex items-center space-x-1.5 shrink-0 mr-3 select-none">
                  {isApproaching ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-600 border border-red-300 text-white font-black text-xs animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.9)]">
                      <span>⚠</span>
                      <span>{lang === 'ja' ? '接近中' : 'APPROACHING'}</span>
                    </span>
                  ) : isBoarding ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 border border-emerald-300 text-white font-black text-xs animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.9)]">
                      <span>●</span>
                      <span>{lang === 'ja' ? '乗車中' : 'BOARDING'}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/80 border border-blue-600 text-blue-300 font-bold text-xs">
                      <span>ℹ</span>
                      <span>{lang === 'ja' ? 'ご案内' : 'NOTICE'}</span>
                    </span>
                  )}
                </div>

                {/* 一面全幅スクロールテロップ（端から端まで一面で文字が流れるリアル設計） */}
                <div className="relative overflow-hidden w-full whitespace-nowrap select-none">
                  <div
                    className={`inline-block animate-marquee-smooth font-mono font-bold tracking-wider ${
                      isApproaching
                        ? 'text-sm sm:text-base text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]'
                        : isBoarding
                        ? 'text-sm sm:text-base text-emerald-200 drop-shadow-[0_0_8px_rgba(167,243,208,0.9)]'
                        : 'text-xs sm:text-sm text-zinc-200 drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]'
                    }`}
                  >
                    {bottomNotice.fullTickerText}
                  </div>
                </div>

                {/* 一面右端の点滅インジケータ（実機の発光ランプ） */}
                {(isApproaching || isBoarding) && (
                  <div className="hidden sm:flex items-center space-x-1 shrink-0 ml-2 select-none">
                    <span className={`w-2 h-2 rounded-full ${isApproaching ? 'bg-red-400 animate-ping' : 'bg-emerald-400 animate-ping'}`} />
                    <span className={`text-[10px] font-mono font-black ${isApproaching ? 'text-red-300' : 'text-emerald-300'}`}>
                      {isApproaching ? 'TRACK APPROACH' : 'NOW BOARDING'}
                    </span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* 3. 下部ケーシング（写真再現：メタリックシルバーパネル ＋ 大きな「← 1」矢印とのりば番号） */}
        <div className="w-full mt-2 pt-2.5 pb-1 flex items-center justify-center bg-gradient-to-b from-[#3a3e44] to-[#2a2d32] border-t border-zinc-600 rounded-b">
          <div className="flex items-center space-x-2 text-white font-extrabold font-mono text-2xl sm:text-3xl tracking-widest drop-shadow">
            {defaultArrow === 'left' ? (
              <>
                <span className="text-3xl sm:text-4xl text-white font-sans font-black">←</span>
                <span>{defaultTrack}</span>
              </>
            ) : (
              <>
                <span>{defaultTrack}</span>
                <span className="text-3xl sm:text-4xl text-white font-sans font-black">→</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

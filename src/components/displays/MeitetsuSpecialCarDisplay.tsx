import React, { useState, useEffect } from 'react';
import { TrainService, DirectionType } from '../../types';
import { getTrainStopsInfo } from '../../utils/stationStops';

interface MeitetsuSpecialCarDisplayProps {
  stationName?: string;
  direction: DirectionType;
  trains: TrainService[];
  currentTime: Date;
  onTrainClick?: (train: TrainService) => void;
}

/**
 * 写真2完全再現：名鉄 名古屋駅 3番ホーム「特別車ご案内」LCD表示器
 * - 上部案内板: ← 3 特別車ご案内 First Class Car Information
 * - 黄色帯: 特別車 専用 のりば
 * - 3段表示（先発・次発・次々発）
 * - 種別（赤枠）、行先（赤枠＋英語併記）、時刻、特別車区分（一部特別車 / 全車特別車）、両数
 * - 先発列車には下部に「[停車駅] ...」の詳細停車駅リストを表示
 * - 下部ステッカー: ↑特別車は、まえ（金山方）から1号車・2号車…の順です。
 */
export const MeitetsuSpecialCarDisplay: React.FC<MeitetsuSpecialCarDisplayProps> = ({
  stationName = '三河花園駅',
  direction,
  trains,
  currentTime,
  onTrainClick,
}) => {
  // 特別車（一部特別車 または 全車特別車）を持つ列車を優先表示
  // 指定席あり列車を中心に、なければ一般特急や急行も表示（空表示にならないようフォールバック）
  const specialTrains = trains.filter(
    (t) => t.seatReservation === 'all_reserved' || t.seatReservation === 'partially_reserved'
  );
  const displayList = specialTrains.length >= 3 ? specialTrains.slice(0, 3) : trains.slice(0, 3);

  // 種別バッジのスタイル取得
  const getSpecialTypeBadge = (train: TrainService) => {
    const code = train.type.code;
    const name = train.type.name.ja;

    if (code === 'myu_sky' || name.includes('ミュースカイ')) {
      return {
        label: 'ミュースカイ',
        sub: 'μ-SKY Ltd.Exp.',
        isMuSky: true,
      };
    }
    if (code === 'special_rapid' || code === 'rapid_ltd_exp' || name.includes('快特') || name.includes('快速特急')) {
      return {
        label: '快特',
        sub: 'Rpd.Ltd.Exp.',
        isMuSky: false,
      };
    }
    if (code === 'shimakaze' || name.includes('しまかぜ')) {
      return {
        label: 'しまかぜ',
        sub: 'SHIMAKAZE',
        isMuSky: false,
      };
    }
    if (code === 'hinotori' || name.includes('ひのとり')) {
      return {
        label: 'ひのとり',
        sub: 'HINOTORI',
        isMuSky: false,
      };
    }
    // デフォルト特急
    return {
      label: '特',
      sub: 'Ltd.Exp.',
      isMuSky: false,
    };
  };

  // 特別車区分テキスト
  const getReservationText = (train: TrainService) => {
    if (train.seatReservation === 'all_reserved') {
      return '全車特別車';
    }
    if (train.seatReservation === 'partially_reserved') {
      return '一部特別車';
    }
    return '全車一般車';
  };

  // 先発列車の停車駅文字列を生成
  const firstTrain = displayList[0];
  const stopsInfo = firstTrain ? getTrainStopsInfo(firstTrain, '三河花園', direction) : null;
  const firstStops = stopsInfo?.stopsJa?.length
    ? stopsInfo.stopsJa.join('・')
    : firstTrain
    ? `${firstTrain.destination.ja}まで各駅に停車`
    : '';

  return (
    <div className="w-full flex flex-col items-center select-none font-sans">
      {/* 吊り下げ支柱（駅ホームの鉄骨天井感） */}
      <div className="flex space-x-32 mb-[-6px] z-0">
        <div className="w-4 h-6 bg-zinc-600 border-x border-zinc-800 shadow-inner" />
        <div className="w-4 h-6 bg-zinc-600 border-x border-zinc-800 shadow-inner" />
      </div>

      {/* 外枠ケーシング（写真2の重厚な吊り下げ式ボックス） */}
      <div className="w-full max-w-4xl bg-[#2b2d31] p-3 rounded-xl border-4 border-[#1a1b1e] shadow-2xl z-10">
        {/* 1. 最上部ヘッダー看板（写真2そのまま） */}
        <div className="bg-[#111317] text-white px-4 py-2.5 rounded-t-lg border-b-2 border-zinc-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-black">←</span>
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-black text-xl">
              {direction === 'down' ? '5' : '3'}
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-wider">特別車ご案内</span>
            <span className="text-xs sm:text-sm text-zinc-300 font-sans ml-2">
              First Class Car Information
            </span>
          </div>
          <div className="text-xs text-zinc-400 bg-zinc-800/80 px-2 py-1 rounded font-mono">
            {stationName}
          </div>
        </div>

        {/* 2. 黄色プレート帯（写真2そのままのレトロな注意標） */}
        <div className="bg-[#facc15] border-y-2 border-amber-600 py-1 px-4 text-center shadow-inner">
          <span className="text-[#b91c1c] text-xl sm:text-2xl font-black tracking-widest drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
            特別車 専用 のりば
          </span>
        </div>

        {/* 3. メインLCDスクリーン */}
        <div className="bg-[#050608] border-4 border-[#1c1e22] p-3 sm:p-4 text-white">
          {/* 只今の時刻表示 */}
          <div className="flex justify-end items-center pb-2 text-xs sm:text-sm text-zinc-400 font-mono space-x-2">
            <span>只今の時刻</span>
            <span className="text-white text-base sm:text-lg font-bold">
              {currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </span>
          </div>

          {/* 3段表示リスト */}
          <div className="space-y-3">
            {displayList.map((train, idx) => {
              const badge = getSpecialTypeBadge(train);
              const isFirst = idx === 0;
              const isApproaching = train.status === 'approaching';
              const isBoarding = train.status === 'boarding' || train.status === 'arrived';

              return (
                <div
                  key={train.id || idx}
                  onClick={() => onTrainClick?.(train)}
                  className={`bg-[#0a0d14] border rounded-lg p-3 transition cursor-pointer ${
                    isApproaching
                      ? 'border-amber-500 ring-1 ring-amber-400/60 animate-row-approach'
                      : isBoarding
                      ? 'border-emerald-500 ring-1 ring-emerald-400/60 shadow-[inset_0_0_12px_rgba(16,185,129,0.2)]'
                      : isFirst
                      ? 'border-zinc-800 ring-1 ring-red-900/40 hover:border-red-500/50'
                      : 'border-zinc-800 hover:border-red-500/50'
                  }`}
                >
                  <div className="grid grid-cols-12 gap-2 items-center">
                    {/* 先発 / 次発 / 次々発 ラベル ＆ 接近/乗車中ピン */}
                    <div className="col-span-1 flex flex-col items-center justify-center">
                      <span className="text-xs sm:text-sm font-bold text-zinc-400 [writing-mode:vertical-rl]">
                        {idx === 0 ? '先発' : idx === 1 ? '次発' : '次々発'}
                      </span>
                      {isApproaching && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 animate-ping" />
                      )}
                      {isBoarding && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 animate-ping" />
                      )}
                    </div>

                    {/* 種別（写真2の赤枠囲み） */}
                    <div className="col-span-3 flex justify-center">
                      <div className="w-full max-w-[120px] py-1 border-2 border-[#cc0000] rounded bg-black text-center flex flex-col items-center justify-center">
                        <span
                          className={`font-black tracking-wider leading-tight ${
                            badge.isMuSky
                              ? 'text-cyan-400 text-sm sm:text-base'
                              : 'text-[#ff3333] text-2xl sm:text-3xl'
                          }`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-[9px] text-[#ff8888] font-mono leading-none mt-0.5">
                          {badge.sub}
                        </span>
                      </div>
                    </div>

                    {/* 行先（写真2の赤枠囲み＋ローマ字） ＆ 接近・乗車中バッジ */}
                    <div className="col-span-4 flex flex-col items-center">
                      <div className="w-full py-1 border-2 border-[#cc0000] rounded bg-black text-center flex flex-col items-center justify-center px-2">
                        <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-wider">
                          {train.destination.ja}
                        </span>
                        <span className="text-[10px] sm:text-xs text-zinc-300 font-mono tracking-tight truncate">
                          {train.destination.en || train.destination.ja}
                        </span>
                      </div>
                      {/* 接近案内（黄色点滅） */}
                      {isApproaching && (
                        <div className="mt-1">
                          <span className="animate-approach-flash inline-flex items-center bg-amber-500 text-black text-[10px] sm:text-xs font-black px-2 py-0.5 rounded shadow">
                            <span className="w-1.5 h-1.5 rounded-full bg-black mr-1 animate-ping" />
                            <span>電車接近中</span>
                          </span>
                        </div>
                      )}
                      {/* 乗車中案内（緑色点滅） */}
                      {isBoarding && (
                        <div className="mt-1">
                          <span className="animate-boarding-flash inline-flex items-center bg-emerald-500 text-black text-[10px] sm:text-xs font-black px-2 py-0.5 rounded shadow">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1 animate-ping" />
                            <span>ご乗車になれます</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 発車時刻 */}
                    <div
                      className={`col-span-2 text-center font-mono font-bold text-2xl sm:text-3xl tracking-tight ${
                        isApproaching
                          ? 'text-amber-300 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                          : isBoarding
                          ? 'text-emerald-300 animate-pulse drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                          : 'text-white'
                      }`}
                    >
                      {train.scheduledTime}
                    </div>

                    {/* 特別車区分 ＆ 両数 ＆ 形式 */}
                    <div className="col-span-2 flex flex-col items-center justify-center text-right">
                      <span
                        className={`text-xs sm:text-sm font-bold ${
                          train.seatReservation === 'all_reserved'
                            ? 'text-cyan-300'
                            : 'text-yellow-300'
                        }`}
                      >
                        {getReservationText(train)}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-zinc-200">
                        {train.cars}両
                      </span>
                      {train.carModel && (
                        <span className="text-[10px] text-zinc-400 font-mono tracking-tight truncate max-w-full">
                          {train.carModel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 先発列車のみ：停車駅一覧帯（写真2そのままの「[停車駅] ...」および案内テロップ） */}
                  {isFirst && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center text-xs sm:text-sm text-zinc-300 bg-[#07090e] px-2.5 py-1.5 rounded overflow-hidden">
                      <span className="bg-zinc-800 text-zinc-200 font-bold px-1.5 py-0.5 rounded mr-2 shrink-0 border border-zinc-700 text-[11px]">
                        停車駅
                      </span>
                      <div className="relative overflow-hidden w-full whitespace-nowrap">
                        <div className="inline-block animate-marquee-smooth text-zinc-200 tracking-wide">
                          {(() => {
                            const detailStops = firstStops || `${train.destination.ja}まで各駅に停車`;
                            return `【${train.scheduledTime}発 ${train.type.name.ja} ${train.destination.ja}ゆき】停車駅：${detailStops} ◆ 特別車（1・2号車）は乗車券のほかにミューチケット（特別車両券）が必要です。 ◆ 普通〜快速急行は２階専用のりばでお乗り換えください。特急・特別快速は豊明駅には停車いたしません。 ◆ 点字ブロックの内側までお下がりください。`;
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. 最下部ステッカー案内（写真2そのままの案内プレート） */}
        <div className="bg-[#f4f4f5] text-zinc-900 px-3 py-2 rounded-b-lg border-t-2 border-zinc-400 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm font-bold gap-1 shadow">
          <div className="flex items-center text-amber-900">
            <span className="text-amber-600 text-base font-black mr-1">↑</span>
            <span>特別車は、まえ（金山方）から1号車・2号車…の順です。</span>
          </div>
          <div className="bg-amber-100 border border-amber-400 px-2 py-0.5 rounded text-[#b91c1c]">
            一般車は、反対側{direction === 'down' ? '④' : '②'}番ホームがのりばです。
          </div>
        </div>
      </div>
    </div>
  );
};

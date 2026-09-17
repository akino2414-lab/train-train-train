import React from 'react';
import { TrainService, TrainCategory, Language, DirectionType } from '../types';
import { TRAIN_TYPES } from '../data/trainTypes';
import { Edit3, Clock, Plus, RefreshCw, Layers } from 'lucide-react';

interface QuickTrainEditorProps {
  trains: TrainService[];
  activeLanguage: Language;
  directionType: DirectionType;
  onEditTrain: (train: TrainService) => void;
  onQuickUpdateTrain: (updatedTrain: TrainService) => void;
  onResetToDefault: () => void;
}

export const QuickTrainEditor: React.FC<QuickTrainEditorProps> = ({
  trains,
  activeLanguage,
  directionType,
  onEditTrain,
  onQuickUpdateTrain,
  onResetToDefault,
}) => {
  const displayTrains = trains.slice(0, 3);

  // Quick types to cycle or pick
  const quickCategories: TrainCategory[] = [
    'ltd_exp',       // 特急（赤地に白）
    'rapid_ltd_exp', // 快特（白地に赤）
    'special_rapid', // 特快（赤地に黄）
    'express',       // 急行（青地に白）
    'rapid_express', // 快急（白地に青）
    'semi_express',  // 準急（緑地に白）
    'local',         // 普通（鼠色地に白）
    'myu_sky',       // ミュースカイ
  ];

  const quickModels = [
    '2200系',
    '1200系',
    '3500系',
    '9500系',
    '2000系',
    '80000系',
    '50000系',
    '373系',
    '383系',
    '683系',
  ];

  const availablePlatforms =
    directionType === 'down'
      ? ['5', '6', '7', '8', '12', '13', '14', '15', '16']
      : ['1', '2', '3', '4', '9', '10', '11'];

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 bg-[#0f1422] border border-blue-950/80 rounded-2xl p-4 sm:p-5 shadow-xl text-zinc-100">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            表示中の列車を直接クイック編集
          </h2>
          <span className="text-xs text-blue-300 bg-blue-950/80 border border-blue-800 px-2.5 py-0.5 rounded-full">
            {directionType === 'down' ? '下り（4〜8番線）' : '上り（1〜3番線）'}
          </span>
        </div>

        <button
          onClick={onResetToDefault}
          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-blue-300 border border-zinc-700 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition"
          title="三河花園駅の基本ダイヤにリセット"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>初期ダイヤにリセット</span>
        </button>
      </div>

      {/* 3 Rows corresponding directly to the 3 board slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {displayTrains.map((train, idx) => {
          const rowNumber = idx + 1;
          const lcdStyle = train.type.lcdStyle || {
            bg: 'bg-zinc-700',
            text: 'text-white',
          };

          return (
            <div
              key={train.id || idx}
              className="bg-[#080d17] border border-zinc-800 hover:border-blue-900/60 rounded-xl p-3.5 flex flex-col justify-between transition group shadow-sm hover:shadow-md"
            >
              {/* Card Header: Slot indicator & Edit button */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-zinc-400 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-md bg-blue-950 text-blue-300 border border-blue-800 flex items-center justify-center font-mono text-xs font-bold">
                    {rowNumber}
                  </span>
                  <span>段目の列車</span>
                </span>
                <button
                  onClick={() => onEditTrain(train)}
                  className="text-xs bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-bold px-2 py-1 rounded-md flex items-center space-x-1 border border-blue-500/30 transition"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>詳しく編集</span>
                </button>
              </div>

              {/* Main Info Block */}
              <div className="bg-[#0d1424] rounded-lg p-2.5 border border-zinc-800 mb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {/* Track */}
                    <div className="w-7 h-7 bg-white rounded flex items-center justify-center border border-zinc-300">
                      <span className="text-base font-black text-black leading-none">
                        {train.platform}
                      </span>
                    </div>

                    {/* Type */}
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-xs shadow-sm ${lcdStyle.bg} ${lcdStyle.text} ${
                        lcdStyle.border ? `border ${lcdStyle.border}` : ''
                      }`}
                    >
                      {train.type.name.ja}
                    </span>

                    {/* Seat Reservation */}
                    {train.seatReservation === 'partially_reserved' && (
                      <span className="bg-white border border-[#d60000] text-[#d60000] text-[9px] font-bold px-1 rounded">
                        一部指定
                      </span>
                    )}
                    {train.seatReservation === 'all_reserved' && (
                      <span className="bg-[#d60000] text-white text-[9px] font-bold px-1 rounded">
                        全車指定
                      </span>
                    )}
                  </div>

                  {/* Scheduled Time */}
                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-white">
                      {train.scheduledTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-1 border-t border-zinc-800/80">
                  <div className="flex items-baseline space-x-1.5">
                    {train.stationNumber && (
                      <span className="text-[10px] bg-[#005bb5] text-white px-1 rounded font-bold">
                        {train.stationNumber}
                      </span>
                    )}
                    <span className="text-lg font-extrabold text-white">
                      {train.destination.ja}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {train.cars}両
                    </span>
                  </div>

                  {/* Form/Model plate */}
                  {train.carModel && (
                    <span className="text-xs bg-[#202b3f] text-blue-200 border border-[#3b4b6b] px-1.5 py-0.5 rounded font-mono font-bold">
                      {train.carModel}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Toggles: Platform, Type, Seat, Model */}
              <div className="space-y-2 text-xs">
                {/* 1. Quick Platform selection */}
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] text-zinc-400 w-12">のりば:</span>
                  <div className="flex space-x-1 flex-1">
                    {availablePlatforms.map((p) => (
                      <button
                        key={p}
                        onClick={() => onQuickUpdateTrain({ ...train, platform: p })}
                        className={`flex-1 py-1 rounded text-xs font-black transition ${
                          train.platform === p
                            ? 'bg-white text-black shadow'
                            : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Quick Seat Reservation toggle */}
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] text-zinc-400 w-12">指定席:</span>
                  <div className="grid grid-cols-3 gap-1 flex-1">
                    <button
                      onClick={() =>
                        onQuickUpdateTrain({
                          ...train,
                          seatReservation: 'none',
                          specialCarNote: undefined,
                        })
                      }
                      className={`py-0.5 text-[10px] rounded border font-semibold ${
                        train.seatReservation === 'none' || !train.seatReservation
                          ? 'bg-blue-950 text-blue-300 border-blue-600'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      なし
                    </button>
                    <button
                      onClick={() =>
                        onQuickUpdateTrain({
                          ...train,
                          seatReservation: 'partially_reserved',
                          specialCarNote: { ja: '一部指定席車', en: 'Partially Reserved' },
                        })
                      }
                      className={`py-0.5 text-[10px] rounded border font-semibold ${
                        train.seatReservation === 'partially_reserved'
                          ? 'bg-amber-950 text-amber-300 border-amber-600'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      一部指定
                    </button>
                    <button
                      onClick={() =>
                        onQuickUpdateTrain({
                          ...train,
                          seatReservation: 'all_reserved',
                          specialCarNote: { ja: '全車指定席車', en: 'All Reserved' },
                        })
                      }
                      className={`py-0.5 text-[10px] rounded border font-semibold ${
                        train.seatReservation === 'all_reserved'
                          ? 'bg-red-950 text-red-300 border-red-600'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      全車指定
                    </button>
                  </div>
                </div>

                {/* 3. Quick Model (形式) selection */}
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] text-zinc-400 w-12">形式:</span>
                  <div className="flex flex-wrap gap-1 flex-1">
                    {quickModels.slice(0, 4).map((m) => (
                      <button
                        key={m}
                        onClick={() => onQuickUpdateTrain({ ...train, carModel: m })}
                        className={`px-1.5 py-0.5 text-[10px] rounded font-mono ${
                          train.carModel === m
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Quick Status & Delay Toggle (接近中・遅延のクイック切替) */}
                <div className="flex items-center space-x-1 pt-1 border-t border-zinc-850">
                  <span className="text-[11px] text-zinc-400 w-12">運行演出:</span>
                  <div className="grid grid-cols-3 gap-1 flex-1">
                    {/* 定刻 */}
                    <button
                      onClick={() =>
                        onQuickUpdateTrain({
                          ...train,
                          status: 'on_time',
                          delayMinutes: 0,
                        })
                      }
                      className={`py-0.5 text-[10px] rounded border font-semibold ${
                        train.status === 'on_time' && train.delayMinutes === 0
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      定刻
                    </button>

                    {/* 接近中 (点滅) */}
                    <button
                      onClick={() =>
                        onQuickUpdateTrain({
                          ...train,
                          status: train.status === 'approaching' ? 'on_time' : 'approaching',
                        })
                      }
                      className={`py-0.5 text-[10px] rounded border font-semibold flex items-center justify-center space-x-0.5 ${
                        train.status === 'approaching'
                          ? 'bg-amber-400 text-black border-amber-300 font-black animate-pulse'
                          : 'bg-zinc-900 text-amber-400 border-zinc-800'
                      }`}
                    >
                      <span>接近中</span>
                    </button>

                    {/* 遅延 */}
                    <button
                      onClick={() => {
                        const newDelay = train.delayMinutes > 0 ? 0 : 5;
                        onQuickUpdateTrain({
                          ...train,
                          delayMinutes: newDelay,
                          status: newDelay > 0 ? 'delayed' : 'on_time',
                        });
                      }}
                      className={`py-0.5 text-[10px] rounded border font-semibold ${
                        train.delayMinutes > 0
                          ? 'bg-rose-950 text-rose-300 border-rose-600 font-black animate-pulse'
                          : 'bg-zinc-900 text-rose-400 border-zinc-800'
                      }`}
                    >
                      {train.delayMinutes > 0 ? `遅れ${train.delayMinutes}分` : '遅延+5分'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

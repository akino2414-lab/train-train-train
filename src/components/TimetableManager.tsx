import React from 'react';
import { TrainService, DirectionType, LanguageText } from '../types';
import {
  Plus,
  Clock,
  ArrowUp,
  ArrowDown,
  Zap,
  Edit3,
  Trash2,
  ListOrdered,
  Layers,
  ArrowUpDown,
  Train,
} from 'lucide-react';

interface TimetableManagerProps {
  currentDirection: DirectionType;
  onChangeDirection: (dir: DirectionType) => void;
  downTrains: TrainService[];
  upTrains: TrainService[];
  onEditTrain: (train: TrainService) => void;
  onOpenAddTrain: (dir?: DirectionType) => void;
  onDeleteTrain: (trainId: string) => void;
  onMoveTrain: (dir: DirectionType, index: number, direction: 'up' | 'down') => void;
  onPromoteToTop: (dir: DirectionType, index: number) => void;
  onSortByTime: (dir: DirectionType) => void;
}

export const TimetableManager: React.FC<TimetableManagerProps> = ({
  currentDirection,
  onChangeDirection,
  downTrains,
  upTrains,
  onEditTrain,
  onOpenAddTrain,
  onDeleteTrain,
  onMoveTrain,
  onPromoteToTop,
  onSortByTime,
}) => {
  const activeTrains = currentDirection === 'down' ? downTrains : upTrains;

  return (
    <section className="w-full max-w-6xl mx-auto mt-6 bg-[#0a0f1d] border border-blue-950/80 rounded-2xl p-4 sm:p-6 shadow-xl text-zinc-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-700 flex items-center justify-center text-blue-400">
              <ListOrdered className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>登録ダイヤ全一覧・運行順序管理</span>
                <span className="text-xs bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded-full border border-blue-700 font-mono">
                  全{activeTrains.length}本登録
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                LCD発車標には<span className="text-emerald-400 font-bold">1〜3段目</span>の列車が表示されます。4段目以降は待機ダイヤです。
              </p>
            </div>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Direction toggle tabs */}
          <div className="flex items-center bg-[#050811] p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => onChangeDirection('down')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                currentDirection === 'down'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>下り（4〜8番線）</span>
              <span className="text-[10px] bg-blue-950/80 px-1.5 py-0.2 rounded font-mono">
                {downTrains.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onChangeDirection('up')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                currentDirection === 'up'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>上り（1〜3番線）</span>
              <span className="text-[10px] bg-emerald-950/80 px-1.5 py-0.2 rounded font-mono">
                {upTrains.length}
              </span>
            </button>
          </div>

          {/* Sort by time */}
          <button
            type="button"
            onClick={() => onSortByTime(currentDirection)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 flex items-center space-x-1.5 transition"
            title="発車時刻の早い順に自動で並び替えます"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span>時刻順に整列</span>
          </button>

          {/* Add train */}
          <button
            type="button"
            onClick={() => onOpenAddTrain(currentDirection)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>新しい列車を登録する</span>
          </button>
        </div>
      </div>

      {/* Train List Table / Rows */}
      {activeTrains.length === 0 ? (
        <div className="text-center py-10 bg-[#070b14] rounded-xl border border-dashed border-zinc-800">
          <Train className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
          <p className="text-sm font-bold text-zinc-400">現在登録されている列車はありません</p>
          <button
            type="button"
            onClick={() => onOpenAddTrain(currentDirection)}
            className="mt-3 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg inline-flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>最初の列車を登録する</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {activeTrains.map((train, idx) => {
            const isDisplayedOnLCD = idx < 3;
            const slotBadge =
              idx === 0
                ? { label: 'LCD 1段目 先発', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' }
                : idx === 1
                ? { label: 'LCD 2段目 次発', color: 'bg-sky-500/20 text-sky-300 border-sky-500/50' }
                : idx === 2
                ? { label: 'LCD 3段目 次々発', color: 'bg-blue-500/20 text-blue-300 border-blue-500/50' }
                : { label: `${idx + 1}番目 待機ダイヤ`, color: 'bg-zinc-800/80 text-zinc-400 border-zinc-700' };

            const lcdStyle = train.type.lcdStyle || {
              bg: 'bg-zinc-700',
              text: 'text-white',
            };

            return (
              <div
                key={train.id || idx}
                className={`p-3 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isDisplayedOnLCD
                    ? 'bg-[#0d1424] border-blue-900/60 shadow-sm'
                    : 'bg-[#060911] border-zinc-800 opacity-85 hover:opacity-100'
                }`}
              >
                {/* Left info */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Slot indicator */}
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-md border flex items-center space-x-1 font-mono ${slotBadge.color}`}
                  >
                    {isDisplayedOnLCD && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />}
                    <span>{slotBadge.label}</span>
                  </span>

                  {/* Track */}
                  <div className="w-7 h-7 rounded bg-white text-black font-black flex items-center justify-center text-sm border border-zinc-300 shadow-sm font-sans">
                    {train.platform || '-'}
                  </div>

                  {/* Type */}
                  <div
                    className={`px-2 py-0.5 rounded text-xs font-bold font-sans shadow-sm ${lcdStyle.bg} ${lcdStyle.text}`}
                  >
                    {train.type.name.ja}
                  </div>

                  {/* Special note */}
                  {train.seatReservation === 'partially_reserved' && (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                      一部指定席
                    </span>
                  )}
                  {train.seatReservation === 'all_reserved' && (
                    <span className="text-[10px] font-bold text-red-300 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800">
                      全車指定席
                    </span>
                  )}

                  {/* Time */}
                  <div className="flex items-center space-x-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-base font-bold text-white tracking-tight">
                      {train.scheduledTime}
                    </span>
                    {train.delayMinutes > 0 && (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-1 rounded border border-rose-800 animate-pulse">
                        +{train.delayMinutes}分遅れ
                      </span>
                    )}
                    {train.status === 'approaching' && (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-1.5 rounded border border-amber-700 animate-pulse">
                        接近中
                      </span>
                    )}
                  </div>

                  {/* Destination */}
                  <div className="flex items-center space-x-1.5">
                    {train.stationNumber && (
                      <span className="text-[10px] font-bold bg-[#005bb5] text-white px-1 rounded">
                        {train.stationNumber}
                      </span>
                    )}
                    {train.hasAirportIcon && <span className="text-sky-400 text-xs">✈</span>}
                    <span className="text-sm font-extrabold text-white">
                      {train.destination.ja}
                    </span>
                    <span className="text-xs text-zinc-400 font-sans">
                      {train.destination.en}
                    </span>
                  </div>

                  {/* Cars & Model */}
                  <div className="text-xs text-zinc-400 flex items-center space-x-2">
                    <span className="border border-zinc-700 rounded px-1 text-[11px]">
                      {train.cars}両
                    </span>
                    {train.carModel && (
                      <span className="bg-zinc-800 text-blue-300 px-1.5 rounded text-[11px] font-mono">
                        {train.carModel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right controls: Promote, Move, Edit, Delete */}
                <div className="flex items-center space-x-1.5 justify-end">
                  {/* Quick promote to top (1段目に繰り上げ) */}
                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => onPromoteToTop(currentDirection, idx)}
                      className="px-2 py-1 text-[11px] font-bold rounded bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/80 flex items-center space-x-1 transition"
                      title="この列車を1段目（先発）に繰り上げます"
                    >
                      <Zap className="w-3 h-3" />
                      <span className="hidden sm:inline">1段目に繰上</span>
                    </button>
                  )}

                  {/* Move Up */}
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => onMoveTrain(currentDirection, idx, 'up')}
                    className={`p-1.5 rounded border transition ${
                      idx === 0
                        ? 'text-zinc-700 border-zinc-900 cursor-not-allowed'
                        : 'text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border-zinc-700'
                    }`}
                    title="順序を上げる"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    disabled={idx === activeTrains.length - 1}
                    onClick={() => onMoveTrain(currentDirection, idx, 'down')}
                    className={`p-1.5 rounded border transition ${
                      idx === activeTrains.length - 1
                        ? 'text-zinc-700 border-zinc-900 cursor-not-allowed'
                        : 'text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border-zinc-700'
                    }`}
                    title="順序を下げる"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => onEditTrain(train)}
                    className="p-1.5 rounded text-blue-300 hover:text-white bg-blue-950/60 hover:bg-blue-900 border border-blue-800 transition"
                    title="詳しく編集"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => onDeleteTrain(train.id)}
                    className="p-1.5 rounded text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-900/80 transition"
                    title="ダイヤから削除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

import React from 'react';
import {
  Clock,
  Volume2,
  VolumeX,
  Plus,
  Bell,
  Play,
  RotateCcw,
  Train,
  ArrowDownCircle,
  ArrowUpCircle,
  LayoutGrid,
  Languages,
} from 'lucide-react';
import { DirectionType, BoardViewMode, Language } from '../types';

interface BoardControlsProps {
  currentDirection: DirectionType;
  onChangeDirection: (dir: DirectionType) => void;
  viewMode: BoardViewMode;
  onChangeViewMode: (mode: BoardViewMode) => void;
  activeLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isSimulatedTime: boolean;
  onToggleSimulatedTime: () => void;
  simulatedSpeed: number;
  onChangeSimulatedSpeed: (speed: number) => void;
  autoUpdateEnabled: boolean;
  onToggleAutoUpdate: () => void;
  onAlignScheduleToCurrentTime: () => void;
  onTriggerApproach: () => void;
  onTriggerDeparture: () => void;
  onToggleDelay: () => void;
  onResetSchedule: () => void;
  onOpenAddTrain: () => void;
}

export const BoardControls: React.FC<BoardControlsProps> = ({
  currentDirection,
  onChangeDirection,
  viewMode,
  onChangeViewMode,
  activeLanguage,
  onSelectLanguage,
  soundEnabled,
  onToggleSound,
  isSimulatedTime,
  onToggleSimulatedTime,
  simulatedSpeed,
  onChangeSimulatedSpeed,
  autoUpdateEnabled,
  onToggleAutoUpdate,
  onAlignScheduleToCurrentTime,
  onTriggerApproach,
  onTriggerDeparture,
  onToggleDelay,
  onResetSchedule,
  onOpenAddTrain,
}) => {
  return (
    <div
      id="station-controls-panel"
      className="w-full bg-[#0d1322] border border-blue-950/80 rounded-2xl p-4 md:p-6 shadow-2xl space-y-5 text-zinc-100"
    >
      {/* 1. 最重要: 上り・下りの切り替え ＆ 画面表示切替 */}
      <div className="bg-[#070b14] border border-blue-900/60 rounded-xl p-3 sm:p-4">
        <label className="flex items-center text-xs font-bold text-blue-300 mb-2 space-x-2">
          <Train className="w-4 h-4 text-amber-400" />
          <span>三河花園駅 • 上り・下り 運行方面の切り替え</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
          {/* 下り */}
          <button
            type="button"
            onClick={() => {
              onChangeDirection('down');
              onChangeViewMode('single_down');
            }}
            className={`p-3 rounded-xl border-2 text-left transition flex items-start space-x-3 ${
              viewMode === 'single_down' || (viewMode !== 'dual' && currentDirection === 'down')
                ? 'bg-blue-950/80 border-blue-500 text-white shadow-lg ring-2 ring-blue-500/30'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <ArrowDownCircle className={`w-6 h-6 mt-0.5 flex-shrink-0 ${currentDirection === 'down' ? 'text-blue-400' : 'text-zinc-500'}`} />
            <div>
              <div className="font-extrabold text-sm sm:text-base flex items-center space-x-1.5">
                <span>下り 方面</span>
                <span className="text-xs bg-blue-600 text-white px-1.5 py-0.2 rounded font-mono">4〜8番線</span>
              </div>
              <div className="text-xs text-blue-200 font-medium mt-0.5">
                名古屋・犬山・岐阜・津・大阪 方面
              </div>
              <div className="text-[10px] text-zinc-400">for Nagoya, Inuyama, Gifu, Tsu, Osaka</div>
            </div>
          </button>

          {/* 上り */}
          <button
            type="button"
            onClick={() => {
              onChangeDirection('up');
              onChangeViewMode('single_up');
            }}
            className={`p-3 rounded-xl border-2 text-left transition flex items-start space-x-3 ${
              viewMode === 'single_up' || (viewMode !== 'dual' && currentDirection === 'up')
                ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg ring-2 ring-emerald-500/30'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <ArrowUpCircle className={`w-6 h-6 mt-0.5 flex-shrink-0 ${currentDirection === 'up' ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <div>
              <div className="font-extrabold text-sm sm:text-base flex items-center space-x-1.5">
                <span>上り 方面</span>
                <span className="text-xs bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono">1〜3番線</span>
              </div>
              <div className="text-xs text-emerald-200 font-medium mt-0.5">
                豊橋・東岡崎・豊田市・浜松 方面
              </div>
              <div className="text-[10px] text-zinc-400">for Toyohashi, Higashi-Okazaki, Hamamatsu</div>
            </div>
          </button>

          {/* 2画面並列表示（写真と同じツインLCD） */}
          <button
            type="button"
            onClick={() => onChangeViewMode('dual')}
            className={`p-3 rounded-xl border-2 text-left transition flex items-start space-x-3 ${
              viewMode === 'dual'
                ? 'bg-amber-950/80 border-amber-500 text-white shadow-lg ring-2 ring-amber-500/30'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <LayoutGrid className={`w-6 h-6 mt-0.5 flex-shrink-0 ${viewMode === 'dual' ? 'text-amber-400' : 'text-zinc-500'}`} />
            <div>
              <div className="font-extrabold text-sm sm:text-base flex items-center space-x-1.5">
                <span>2画面並列（写真再現）</span>
                <span className="text-xs bg-amber-500 text-black px-1.5 py-0.2 rounded font-bold">推奨</span>
              </div>
              <div className="text-xs text-amber-200 font-medium mt-0.5">
                下りと上りを写真のように横並びで表示
              </div>
              <div className="text-[10px] text-zinc-400">Dual Screen Mode as in photo</div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. 言語切り替え（日・英のみ） ＆ 列車追加 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* 言語（中国語と韓国語は除外） */}
        <div className="bg-[#070b14] p-3 rounded-xl border border-zinc-800">
          <label className="text-xs font-bold text-zinc-400 mb-1.5 flex items-center space-x-1.5">
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <span>表示言語（日・英のみ対応）</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onSelectLanguage('ja')}
              className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                activeLanguage === 'ja'
                  ? 'bg-blue-600 border-blue-400 text-white shadow'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              🇯🇵 日本語
            </button>
            <button
              onClick={() => onSelectLanguage('en')}
              className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                activeLanguage === 'en'
                  ? 'bg-blue-600 border-blue-400 text-white shadow'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* 列車追加 */}
        <div className="bg-[#070b14] p-3 rounded-xl border border-zinc-800 flex flex-col justify-between">
          <label className="text-xs font-bold text-zinc-400 mb-1.5 flex items-center space-x-1.5">
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>新規列車の追加</span>
          </label>
          <button
            onClick={onOpenAddTrain}
            className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-md flex items-center justify-center space-x-1 transition"
          >
            <Plus className="w-4 h-4" />
            <span>新しい列車を登録する</span>
          </button>
        </div>

        {/* 音声・サウンド */}
        <div className="bg-[#070b14] p-3 rounded-xl border border-zinc-800 flex flex-col justify-between">
          <label className="text-xs font-bold text-zinc-400 mb-1.5 flex items-center space-x-1.5">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>効果音設定</span>
          </label>
          <button
            onClick={onToggleSound}
            className={`w-full py-1.5 rounded-lg text-xs font-bold border flex items-center justify-center space-x-1.5 transition ${
              soundEnabled
                ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? '駅メロディ・放送 ON' : 'ミュート中 OFF'}</span>
          </button>
        </div>
      </div>

      {/* 3. 運行シミュレーション時計・自動更新コントロール (ユーザー要望: 時間が来たら自動で更新) */}
      <div className="bg-[#0a0f1d] p-3 sm:p-4 rounded-xl border border-blue-900/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-blue-300" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-extrabold text-white flex items-center space-x-2">
              <span>時刻連動 自動更新</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  autoUpdateEnabled
                    ? 'bg-emerald-500 text-black animate-pulse'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {autoUpdateEnabled ? 'AUTO ON (自動発車)' : 'OFF (手動)'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              発車時刻になると接近放送・自動発車・次発繰り上げをリアルタイムで実行します
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 自動更新トグル */}
          <button
            type="button"
            onClick={onToggleAutoUpdate}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center space-x-1.5 shadow-sm ${
              autoUpdateEnabled
                ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white shadow-emerald-900/40'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                autoUpdateEnabled ? 'bg-white animate-ping' : 'bg-zinc-500'
              }`}
            />
            <span>{autoUpdateEnabled ? '自動更新 有効' : '自動更新を有効化'}</span>
          </button>

          {/* ダイヤ時刻を現在時刻に合わせるワンタップボタン */}
          <button
            type="button"
            onClick={onAlignScheduleToCurrentTime}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-900/50 hover:bg-blue-800 text-blue-200 hover:text-white border border-blue-700 flex items-center space-x-1 transition"
            title="現在の時計時刻に合わせて直近の発車時刻をセットします"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>直近時刻にダイヤ同期</span>
          </button>

          {/* 時計シミュレーション速度 (1倍 / 5倍 / 10倍 / 30倍) */}
          <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            <span className="text-[10px] text-zinc-500 px-1 font-mono">時間進行:</span>
            <button
              type="button"
              onClick={() => {
                if (isSimulatedTime) {
                  onToggleSimulatedTime();
                }
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                !isSimulatedTime
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              実時間 (1x)
            </button>
            {[5, 10, 30].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => {
                  if (!isSimulatedTime) {
                    onToggleSimulatedTime();
                  }
                  onChangeSimulatedSpeed(speed);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition ${
                  isSimulatedTime && simulatedSpeed === speed
                    ? 'bg-amber-500 text-black font-extrabold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. 駅シミュレーション・手動演出アクションバー */}
      <div className="bg-[#070b14] p-3 sm:p-4 rounded-xl border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-zinc-400">手動演出シミュレーション:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 接近チャイム */}
          <button
            onClick={onTriggerApproach}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40 flex items-center space-x-1 transition"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>接近放送・点滅</span>
          </button>

          {/* 発車メロディ */}
          <button
            onClick={onTriggerDeparture}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/40 flex items-center space-x-1 transition"
          >
            <Play className="w-3.5 h-3.5" />
            <span>発車メロディ・出発</span>
          </button>

          {/* 遅延トグル */}
          <button
            onClick={onToggleDelay}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 flex items-center space-x-1 transition"
          >
            <span>遅延 (+5分)</span>
          </button>

          {/* 初期ダイヤリセット */}
          <button
            onClick={onResetSchedule}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white border border-zinc-700 flex items-center space-x-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ダイヤリセット</span>
          </button>
        </div>
      </div>
    </div>
  );
};

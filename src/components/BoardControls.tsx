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
  onProgramDelay?: (minutes: number, target: 'first' | 'all') => void;
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
  onProgramDelay,
  onResetSchedule,
  onOpenAddTrain,
}) => {
  const [delayInputMinutes, setDelayInputMinutes] = React.useState<number>(10);
  const [delayTarget, setDelayTarget] = React.useState<'first' | 'all'>('first');
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

      {/* 4. 駅シミュレーション・手動演出アクションバー ＆ 遅延時間プログラミング */}
      <div className="bg-[#070b14] p-3 sm:p-4 rounded-xl border border-zinc-800 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
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

        {/* 5. 遅れ時間プログラム（何分遅れでも即座に設定・シミュレーション可能） */}
        <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-rose-300">遅れ時間のプログラム設定:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 適用対象セレクタ */}
            <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setDelayTarget('first')}
                className={`px-2 py-1 rounded font-bold transition ${
                  delayTarget === 'first'
                    ? 'bg-zinc-700 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                先頭列車のみ
              </button>
              <button
                type="button"
                onClick={() => setDelayTarget('all')}
                className={`px-2 py-1 rounded font-bold transition ${
                  delayTarget === 'all'
                    ? 'bg-zinc-700 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                全列車一括
              </button>
            </div>

            {/* 分数直接入力 */}
            <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1">
              <input
                type="number"
                min="0"
                max="180"
                value={delayInputMinutes}
                onChange={(e) => setDelayInputMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-12 bg-black border border-zinc-600 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-rose-300 text-right focus:outline-none focus:border-rose-400"
              />
              <span className="text-xs text-zinc-300 font-bold">分遅れ</span>
            </div>

            {/* 増減ボタン */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setDelayInputMinutes((prev) => Math.max(0, prev - 5))}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono font-bold border border-zinc-700 transition"
                title="5分減らす"
              >
                -5分
              </button>
              <button
                type="button"
                onClick={() => setDelayInputMinutes((prev) => Math.min(180, prev + 5))}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono font-bold border border-zinc-700 transition"
                title="5分増やす"
              >
                +5分
              </button>
            </div>

            {/* プリセットボタン */}
            {[0, 3, 5, 10, 15, 30].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setDelayInputMinutes(preset);
                  if (onProgramDelay) {
                    onProgramDelay(preset, delayTarget);
                  }
                }}
                className={`px-2 py-1 rounded text-xs font-mono font-bold transition border ${
                  preset === 0
                    ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border-rose-800/80'
                }`}
                title={preset === 0 ? '定刻復旧（遅れ0分）' : `${preset}分遅延`}
              >
                {preset === 0 ? '定刻(0分)' : `+${preset}分`}
              </button>
            ))}

            {/* 反映実行ボタン */}
            <button
              type="button"
              onClick={() => {
                if (onProgramDelay) {
                  onProgramDelay(delayInputMinutes, delayTarget);
                } else {
                  onToggleDelay();
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_12px_rgba(225,29,72,0.5)] flex items-center space-x-1.5 transition active:scale-95"
            >
              <span>{delayInputMinutes === 0 ? '定刻に復旧' : `${delayInputMinutes}分遅延を適用`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

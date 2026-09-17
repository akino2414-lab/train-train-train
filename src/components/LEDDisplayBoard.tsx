import React, { useState } from 'react';
import { BoardMode, DisplayTheme, Language, StationPreset, TrainService } from '../types';
import { getLangText, HEADER_TEXTS } from '../utils/lang';
import { toCircledNumber } from './TrainEditModal';
import { Volume2, VolumeX, Edit3, Globe, Sparkles, Info } from 'lucide-react';
import { getBottomNoticeInfo } from '../utils/announcementHelper';

interface LEDDisplayBoardProps {
  station: StationPreset;
  trains: TrainService[];
  currentTime: Date;
  activeLanguage: Language;
  mode: BoardMode;
  theme: DisplayTheme;
  autoCycleLanguage: boolean;
  cycleProgress: number; // 0 - 100%
  onRowClick?: (train: TrainService) => void;
  onEditSignboard?: () => void;
  onEditTicker?: () => void;
  onSelectLanguage?: (lang: Language) => void;
  onToggleAutoCycle?: () => void;
}

export const LEDDisplayBoard: React.FC<LEDDisplayBoardProps> = ({
  station,
  trains,
  currentTime,
  activeLanguage,
  mode,
  theme,
  autoCycleLanguage,
  cycleProgress,
  onRowClick,
  onEditSignboard,
  onEditTicker,
  onSelectLanguage,
  onToggleAutoCycle,
}) => {
  // Format time (HH:MM:SS)
  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');

  // Announcement text for bottom LED ticker
  const announcementText =
    station.announcements.length > 0
      ? getLangText(station.announcements[0], activeLanguage)
      : '電車からお降りの際はホームと電車の間にご注意ください';

  // Get localized header titles
  const getHeaderLabels = () => {
    switch (activeLanguage) {
      case 'en':
        return { track: 'Track', type: 'Type', destination: 'Destination', time: 'Time', cars: 'Cars' };
      case 'zh':
        return { track: 'のりば', type: '種別', destination: '行先', time: '発車時刻', cars: '両' };
      case 'ko':
        return { track: 'のりば', type: '種別', destination: '行先', time: '発車時刻', cars: '両' };
      default:
        return { track: 'のりば', type: '種別', destination: '行先', time: '発車時刻', cars: '両' };
    }
  };

  const headerLabels = getHeaderLabels();

  // Helper to space out short Japanese destinations like in real boards (e.g. "岩 倉", "名 古 屋")
  const formatDestinationText = (dest: string, lang: Language) => {
    if (lang !== 'ja') return dest;
    const clean = dest.replace(/\s+/g, '');
    if (clean.length === 2) {
      return `${clean[0]}　${clean[1]}`;
    }
    if (clean.length === 3 && (clean === '新鵜沼' || clean === '新可児')) {
      // Often kept tighter for 3-kanji station names
      return dest;
    }
    return dest;
  };

  // Helper to space out 2-character types like "急 行", "普 通"
  const formatTypeText = (typeName: string, lang: Language) => {
    if (lang !== 'ja') return typeName;
    const clean = typeName.replace(/\s+/g, '');
    if (clean.length === 2 && (clean === '急行' || clean === '普通' || clean === '準急' || clean === '快速')) {
      return `${clean[0]}　${clean[1]}`;
    }
    return typeName;
  };

  // Display at most 3 slots to match the authentic 3-row station board in the photo
  const displayTrains = trains.slice(0, 3);
  // Pad if less than 3
  while (displayTrains.length < 3) {
    displayTrains.push({
      id: `empty-${displayTrains.length}`,
      type: {
        code: 'local',
        name: { ja: '', en: '', zh: '', ko: '' },
        shortName: { ja: '', en: '', zh: '', ko: '' },
        badgeBg: '',
        badgeText: '',
        ledColor: 'orange',
      },
      destination: { ja: '', en: '', zh: '', ko: '' },
      scheduledTime: '',
      platform: '',
      cars: undefined,
      delayMinutes: 0,
      status: 'on_time',
    });
  }

  return (
    <div id="station-display-board-wrapper" className="w-full select-none max-w-5xl mx-auto">
      {/* --- Overhead Suspension Hardware / Hanging Brackets (Realistic Station Feel) --- */}
      <div className="flex justify-between items-end px-16 sm:px-24 mb-[-2px] relative z-20">
        <div className="flex flex-col items-center">
          <div className="w-3.5 h-6 bg-gradient-to-r from-zinc-700 via-zinc-400 to-zinc-700 shadow-md border-x border-zinc-800" />
          <div className="w-8 h-2.5 bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-600 rounded-xs shadow-inner flex items-center justify-around px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 border border-zinc-600" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 border border-zinc-600" />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-3.5 h-6 bg-gradient-to-r from-zinc-700 via-zinc-400 to-zinc-700 shadow-md border-x border-zinc-800" />
          <div className="w-8 h-2.5 bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-600 rounded-xs shadow-inner flex items-center justify-around px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 border border-zinc-600" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 border border-zinc-600" />
          </div>
        </div>
      </div>

      {/* --- Main Board Outer Housing (Meitetsu Blue Enclosure) --- */}
      <div
        id="station-display-casing"
        className="w-full rounded-xl overflow-hidden meitetsu-housing transition-all duration-300 shadow-2xl relative"
      >
        {/* === TOP SIGNBOARD PANEL: "犬山・可児 方面 / for Inuyama,Kani" === */}
        <div
          id="meitetsu-top-signboard"
          className="meitetsu-sign-panel px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between text-white relative group border-b-2 border-[#091a38]"
        >
          {/* Subtle metal rivet accents on left and right */}
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-300 border border-zinc-500 shadow-inner opacity-70" />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-300 border border-zinc-500 shadow-inner opacity-70" />

          {/* Left: Direction Sign (Large White Japanese + English subtitle exactly as in photo) */}
          <div className="flex flex-col pl-3">
            <div className="flex items-baseline space-x-3">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-wider drop-shadow-sm font-sans">
                {getLangText(station.direction, activeLanguage) || '犬山・可児 方面'}
              </span>
              {onEditSignboard && (
                <button
                  onClick={onEditSignboard}
                  className="opacity-0 group-hover:opacity-100 transition text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded flex items-center space-x-1"
                  title="看板の方面・駅名を変更"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>変更</span>
                </button>
              )}
            </div>
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-blue-100/90 font-sans mt-0.5">
              {station.direction.en || 'for Inuyama,Kani'}
            </span>
          </div>

          {/* Right: Digital Realtime Clock & Multilingual Switcher */}
          <div className="flex items-center space-x-2.5 sm:space-x-4 pr-3 mt-2 sm:mt-0 ml-auto">
            {/* Multilingual Selector Buttons */}
            <div className="flex items-center bg-black/40 rounded-lg p-1 border border-white/20 backdrop-blur-xs">
              {(['ja', 'en', 'zh', 'ko'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => onSelectLanguage && onSelectLanguage(l)}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                    activeLanguage === l
                      ? 'bg-amber-400 text-black shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={`${l.toUpperCase()}表示に切り替え`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
              {onToggleAutoCycle && (
                <button
                  onClick={onToggleAutoCycle}
                  className={`ml-1 px-1.5 py-0.5 rounded text-[11px] flex items-center space-x-1 transition ${
                    autoCycleLanguage
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="多言語自動巡回のON/OFF"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${autoCycleLanguage ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'}`} />
                  <span className="text-[10px]">AUTO</span>
                </button>
              )}
            </div>

            {/* Authentic Digital Clock */}
            <div className="flex items-center bg-black/70 border border-zinc-700/80 rounded-lg px-2.5 py-1 shadow-inner">
              <span className="font-led led-text-amber text-lg sm:text-xl font-bold tracking-widest">
                {hours}
                <span className="animate-pulse">:</span>
                {minutes}
                <span className="text-xs opacity-75 ml-1">:{seconds}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Multilingual Cycle Progress Bar */}
        {autoCycleLanguage && (
          <div className="w-full bg-[#071326] h-1 overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(251,191,36,0.6)]"
              style={{ width: `${cycleProgress}%` }}
            />
          </div>
        )}

        {/* === HEADER COLUMN BAR: 「のりば」「種別」「行先」「発車時刻」「両」 === */}
        <div
          id="meitetsu-header-columns"
          className="meitetsu-header-bar grid grid-cols-12 gap-1 sm:gap-2 px-3 sm:px-6 py-2 text-white/90 text-sm sm:text-base font-bold tracking-wider"
        >
          {/* のりば */}
          <div className="col-span-2 text-center flex items-center justify-center font-sans">
            <span>{headerLabels.track}</span>
          </div>

          {/* 種別 */}
          <div className="col-span-2 text-center flex items-center justify-center font-sans">
            <span>{headerLabels.type}</span>
          </div>

          {/* 行先 */}
          <div className="col-span-4 pl-3 sm:pl-6 flex items-center font-sans">
            <span>{headerLabels.destination}</span>
          </div>

          {/* 発車時刻 */}
          <div className="col-span-2 text-center flex items-center justify-center font-sans">
            <span>{headerLabels.time}</span>
          </div>

          {/* 両 */}
          <div className="col-span-2 text-center flex items-center justify-center font-sans">
            <span>{headerLabels.cars}</span>
          </div>
        </div>

        {/* === MAIN 3-TIER LED SCREEN SLOTS === */}
        <div
          id="led-screen-body"
          className="led-matrix-bg p-2 sm:p-4 divide-y-2 divide-black/90 relative"
        >
          {/* Subtle LED Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/[0.015] to-transparent opacity-40 z-10" />

          {displayTrains.map((train, index) => {
            const hasData = Boolean(train.scheduledTime || train.platform);
            const isClickable = Boolean(onRowClick);
            const isApproaching = train.status === 'approaching';
            const isBoarding = train.status === 'boarding' || train.status === 'arrived';

            // Type color matching photo:
            // 快特 -> red
            // 急行 -> orange
            // 普通 -> orange
            const ledColorClass =
              train.type.ledColor === 'red'
                ? 'led-text-red'
                : train.type.ledColor === 'green'
                ? 'led-text-green'
                : train.type.ledColor === 'blue'
                ? 'led-text-blue'
                : train.type.ledColor === 'white'
                ? 'led-text-white'
                : 'led-text-orange';

            const rawDest = getLangText(train.destination, activeLanguage);
            const formattedDest = formatDestinationText(rawDest, activeLanguage);
            const formattedType = formatTypeText(
              getLangText(train.type.name, activeLanguage),
              activeLanguage
            );

            return (
              <div
                key={train.id || index}
                onClick={() => isClickable && hasData && onRowClick?.(train)}
                className={`grid grid-cols-12 gap-1 sm:gap-2 px-2 sm:px-4 py-3 sm:py-4 items-center transition-all font-led group relative ${
                  isClickable && hasData
                    ? 'hover:bg-zinc-900/70 cursor-pointer'
                    : ''
                } ${
                  isApproaching
                    ? 'bg-red-950/20 shadow-[inset_0_0_15px_rgba(239,68,68,0.2)]'
                    : isBoarding
                    ? 'bg-emerald-950/20 shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]'
                    : ''
                }`}
                title={hasData ? 'クリックしてこの行を直接編集' : undefined}
              >
                {/* 1. のりば (Circled Platform Number in Amber LED: ①, ②) */}
                <div className="col-span-2 flex justify-center items-center">
                  {hasData && (
                    <span
                      className={`text-3xl sm:text-4xl font-bold tracking-tight transform hover:scale-110 transition-transform ${
                        isApproaching
                          ? 'led-text-red animate-led-blink'
                          : isBoarding
                          ? 'led-text-green animate-led-blink'
                          : 'led-text-amber'
                      }`}
                    >
                      {toCircledNumber(train.platform)}
                    </span>
                  )}
                </div>

                {/* 2. 種別 (快特 in Red, 急行/普通 in Amber) */}
                <div className="col-span-2 flex justify-center items-center">
                  {hasData && (
                    <span
                      className={`${ledColorClass} text-xl sm:text-2xl md:text-3xl font-bold tracking-widest drop-shadow-sm whitespace-nowrap`}
                    >
                      {formattedType}
                    </span>
                  )}
                </div>

                {/* 3. 行先 + 特記事項 + 接近/乗車中案内 (新鵜沼 一部特別車 / 新 鵜 沼 / 岩 倉) */}
                <div className="col-span-4 flex items-baseline flex-wrap gap-2 pl-2 sm:pl-5">
                  {hasData && (
                    <>
                      <span className="led-text-amber text-xl sm:text-2xl md:text-3xl font-bold tracking-wider drop-shadow-sm">
                        {formattedDest}
                      </span>
                      {/* Special Car Note (e.g. 「一部特別車」 in Red LED) */}
                      {train.specialCarNote && (
                        <span className="led-text-red text-xs sm:text-sm md:text-base font-bold ml-1 tracking-tight animate-pulse">
                          {getLangText(train.specialCarNote, activeLanguage)}
                        </span>
                      )}
                      {/* 接近の案内点滅表示 */}
                      {isApproaching && (
                        <span className="led-text-red text-xs sm:text-sm font-bold ml-1.5 animate-led-blink border border-red-500/80 px-1 py-0.2 rounded bg-black/80">
                          {activeLanguage === 'en' ? '[APPROACHING]' : '[電車接近中]'}
                        </span>
                      )}
                      {/* 乗車中の表示点滅表示 */}
                      {isBoarding && (
                        <span className="led-text-green text-xs sm:text-sm font-bold ml-1.5 animate-led-blink border border-emerald-500/80 px-1 py-0.2 rounded bg-black/80">
                          {activeLanguage === 'en' ? '[BOARDING]' : '[ご乗車中]'}
                        </span>
                      )}
                      {/* Delayed alert badge if train is late */}
                      {train.delayMinutes > 0 && (
                        <span className="led-text-orange text-xs sm:text-sm font-bold ml-2 animate-led-blink">
                          [遅れ{train.delayMinutes}分]
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* 4. 発車時刻 (10:18, 10:24, 10:26 in Amber LED Digital Dots) */}
                <div className="col-span-2 flex justify-center items-center">
                  {hasData && (
                    <span
                      className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest font-led ${
                        isApproaching
                          ? 'led-text-orange animate-pulse'
                          : isBoarding
                          ? 'led-text-green animate-pulse'
                          : 'led-text-amber'
                      }`}
                    >
                      {train.scheduledTime}
                    </span>
                  )}
                </div>

                {/* 5. 両 (8両, 4両, 2両) */}
                <div className="col-span-2 flex justify-center items-baseline space-x-0.5 sm:space-x-1">
                  {hasData && train.cars && (
                    <>
                      <span className="led-text-amber text-2xl sm:text-3xl md:text-4xl font-bold">
                        {train.cars}
                      </span>
                      <span className="led-text-amber text-xs sm:text-sm md:text-base font-bold opacity-90">
                        {activeLanguage === 'en' ? 'cars' : '両'}
                      </span>
                    </>
                  )}
                </div>

                {/* Quick edit hover indicator */}
                {hasData && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-amber-500/90 text-black px-2 py-0.5 rounded text-[11px] font-sans font-bold shadow-md pointer-events-none">
                    <Edit3 className="w-3 h-3" />
                    <span>編集</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* === 4TH TIER: BOTTOM TICKER INFO DISPLAY （ユーザー厳格指定：「接近案内や乗車中案内などは全てLED、LCDの一番下段を変更して案内するように」） === */}
        {(() => {
          const bottomNotice = getBottomNoticeInfo(trains, currentTime, station.name.ja, 'down', announcementText);
          const isApproaching = bottomNotice.state === 'approaching';
          const isBoarding = bottomNotice.state === 'boarding';

          return (
            <div
              id="meitetsu-ticker-row"
              className={`bg-black border-t-2 px-3 sm:px-5 py-2.5 flex items-center space-x-3 overflow-hidden font-led relative z-10 transition-colors ${
                isApproaching
                  ? 'border-red-600 shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                  : isBoarding
                  ? 'border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                  : 'border-zinc-900'
              }`}
            >
              {/* Left: Notice Badge */}
              <div
                className={`flex-shrink-0 flex items-center space-x-1.5 px-2.5 py-1 rounded border shadow-sm ${
                  isApproaching
                    ? 'bg-red-950/90 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                    : isBoarding
                    ? 'bg-emerald-950/90 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : 'bg-emerald-950/80 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${bottomNotice.pingBg} animate-ping`} />
                <span
                  className={`text-xs sm:text-sm font-bold tracking-wider ${
                    isApproaching ? 'text-red-300' : isBoarding ? 'text-emerald-300' : 'led-text-green'
                  }`}
                >
                  {activeLanguage === 'en' ? bottomNotice.badgeEn : bottomNotice.badgeJa}
                </span>
              </div>

              {/* Scrolling Ticker Text */}
              <div className="flex-1 overflow-hidden whitespace-nowrap relative h-6 flex items-center">
                <div
                  className={`ticker-content text-base sm:text-lg font-bold tracking-wide ${
                    isApproaching
                      ? 'text-red-300 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                      : isBoarding
                      ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                      : 'led-text-amber'
                  }`}
                >
                  {bottomNotice.fullTickerText}
                </div>
              </div>

              {/* Edit Ticker Button */}
              {onEditTicker && (
                <button
                  onClick={onEditTicker}
                  className="flex-shrink-0 text-xs text-zinc-400 hover:text-amber-400 p-1 rounded hover:bg-zinc-800 transition"
                  title="テロップの文言を編集"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

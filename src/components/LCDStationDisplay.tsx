import React from 'react';
import { DirectionType, Language, TrainService } from '../types';
import { getLangText, HEADER_TEXTS } from '../utils/lang';
import { getBottomNoticeInfo } from '../utils/announcementHelper';

interface LCDStationDisplayProps {
  stationName: string;
  directionType: DirectionType;
  directionTitle: string;
  directionTitleEn: string;
  trains: TrainService[];
  currentTime: Date;
  activeLanguage: Language;
  announcementText: string;
  onRowClick?: (train: TrainService) => void;
  onEditDirection?: () => void;
  onEditTicker?: () => void;
  isCompact?: boolean;
}

export const LCDStationDisplay: React.FC<LCDStationDisplayProps> = ({
  stationName,
  directionType,
  directionTitle,
  directionTitleEn,
  trains,
  currentTime,
  activeLanguage,
  announcementText,
  onRowClick,
  onEditDirection,
  onEditTicker,
  isCompact = false,
}) => {
  // Format current time HH:MM
  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');

  // Space out 2-character station names (e.g. "豊　橋", "常　滑", "河　和", "豊　明") just like in the photo
  const formatDestinationJa = (dest: string) => {
    const clean = dest.replace(/\s+/g, '');
    if (clean.length === 2) {
      return `${clean[0]}　${clean[1]}`;
    }
    return dest;
  };

  // Space out 2-character types like "急　行", "普　通", "特　急"
  const formatTypeJa = (typeName: string) => {
    const clean = typeName.replace(/\s+/g, '');
    if (clean.length === 2) {
      return `${clean[0]}　${clean[1]}`;
    }
    return typeName;
  };

  // Exactly 3 rows as shown in the real LCD photo
  const displayRows = trains.slice(0, 3);
  while (displayRows.length < 3) {
    displayRows.push({
      id: `empty-${displayRows.length}`,
      type: {
        code: 'local',
        name: { ja: '', en: '' },
        shortName: { ja: '', en: '' },
        badgeBg: '',
        badgeText: '',
        lcdStyle: { bg: 'bg-transparent', text: 'text-transparent' },
        ledColor: 'white',
      },
      destination: { ja: '', en: '' },
      scheduledTime: '',
      platform: '',
      delayMinutes: 0,
      status: 'on_time',
    });
  }

  return (
    <div className="flex flex-col w-full bg-[#050811] text-white rounded-lg overflow-hidden shadow-2xl border-4 border-[#1b2230] select-none font-sans">
      {/* 1. TOP HEADER BAR: Authentic Meitetsu Deep Blue with Direction Title & Digital Clock */}
      <div className="bg-gradient-to-r from-[#003882] via-[#004e9c] to-[#003882] px-4 py-2 sm:px-6 sm:py-3 flex items-center justify-between border-b-2 border-[#132845] relative">
        <div
          className="flex flex-col cursor-pointer group hover:opacity-90 transition-opacity"
          onClick={onEditDirection}
          title="クリックして方面看板を編集"
        >
          <div className="flex items-center space-x-2">
            {directionTitle.includes('空港') && (
              <span className="text-xl sm:text-2xl text-white">✈</span>
            )}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-wider text-white drop-shadow-sm font-['Hiragino_Kaku_Gothic_ProN',_'Noto_Sans_JP',_sans-serif]">
              {directionTitle}
            </h2>
          </div>
          <span className="text-xs sm:text-sm text-blue-100 font-medium tracking-wide">
            {directionTitleEn}
          </span>
        </div>

        {/* Real-Time Station Digital Clock Box (Photo Authentic White Box with Blue/Dark Header) */}
        <div className="bg-white rounded-md px-3 py-1 sm:px-4 sm:py-1.5 flex flex-col items-center justify-center shadow-md border border-zinc-300 min-w-[90px] sm:min-w-[110px]">
          <div className="text-[10px] sm:text-[11px] font-bold text-[#003882] tracking-tighter leading-tight">
            現在時刻
          </div>
          <div className="text-xl sm:text-2xl font-black text-black tracking-widest font-mono leading-tight">
            {hours}:{minutes}
            <span className="text-xs text-zinc-500 font-normal ml-0.5 opacity-80">{seconds}</span>
          </div>
        </div>
      </div>

      {/* 2. COLUMN HEADERS BAR: Authentic Light Blue / White Bar */}
      <div className="bg-[#dbe7f6] text-[#002b66] text-xs sm:text-sm font-extrabold px-3 sm:px-5 py-1.5 flex items-center justify-between border-b border-zinc-400">
        {/* Track */}
        <div className="w-12 sm:w-16 text-center">
          <div>のりば</div>
          <div className="text-[10px] sm:text-[11px] font-semibold text-[#003b8e] -mt-0.5">Track</div>
        </div>

        {/* Type & Seat Reservation */}
        <div className="w-28 sm:w-36 text-center">
          <div>種別</div>
          <div className="text-[10px] sm:text-[11px] font-semibold text-[#003b8e] -mt-0.5">Type</div>
        </div>

        {/* Destination & Via */}
        <div className="flex-1 text-left pl-3 sm:pl-6">
          <div>行先・経由</div>
          <div className="text-[10px] sm:text-[11px] font-semibold text-[#003b8e] -mt-0.5">Destination / via</div>
        </div>

        {/* Departure Time */}
        <div className="w-20 sm:w-28 text-center">
          <div>発車時刻</div>
          <div className="text-[10px] sm:text-[11px] font-semibold text-[#003b8e] -mt-0.5">Time</div>
        </div>

        {/* Number of Cars */}
        <div className="w-16 sm:w-20 text-center">
          <div>両数</div>
          <div className="text-[10px] sm:text-[11px] font-semibold text-[#003b8e] -mt-0.5">Cars</div>
        </div>

        {/* Train Model / Car Series (User requested: "また右隅っこに形式（6000系など）も表示できるようにしたい") */}
        <div className="w-16 sm:w-24 text-center">
          <div>形式</div>
          <div className="text-[10px] sm:text-[11px] font-semibold text-[#003b8e] -mt-0.5">Model</div>
        </div>
      </div>

      {/* 3. THREE TRAIN DISPLAY ROWS (Matches photo's 3 slots) */}
      <div className="flex flex-col divide-y-2 divide-zinc-800 bg-[#070b13]">
        {displayRows.map((train, idx) => {
          const isEmpty = !train.scheduledTime;
          const lcdStyle = train.type.lcdStyle || {
            bg: 'bg-zinc-700',
            text: 'text-white',
          };

          const isApproaching = train.status === 'approaching' || train.status === 'arrived' || train.status === 'boarding';
          const isDelayed = train.delayMinutes > 0 || train.status === 'delayed';

          return (
            <div
              key={train.id || idx}
              onClick={() => !isEmpty && onRowClick?.(train)}
              className={`flex items-center justify-between px-2 sm:px-5 py-2.5 sm:py-3.5 transition-all min-h-[68px] sm:min-h-[82px] relative overflow-hidden ${
                isEmpty
                  ? 'opacity-20'
                  : isApproaching
                  ? 'animate-row-approach cursor-pointer border-l-4 border-amber-400'
                  : isDelayed
                  ? 'bg-[#18090b] cursor-pointer hover:bg-[#200c0f] border-l-4 border-rose-500'
                  : 'cursor-pointer hover:bg-[#121929] active:bg-[#162137]'
              }`}
            >
              {/* --- のりば (Track): Authentic White Rounded Rectangle with Bold Dark Number --- */}
              <div className="w-12 sm:w-16 flex items-center justify-center">
                {!isEmpty && train.platform && (
                  <div
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg shadow-sm border flex items-center justify-center transition-all ${
                      isApproaching
                        ? 'bg-amber-400 border-amber-300 ring-2 ring-amber-400 animate-pulse'
                        : 'bg-white border-zinc-300'
                    }`}
                  >
                    <span
                      className={`text-xl sm:text-2xl font-black font-sans leading-none ${
                        isApproaching ? 'text-black' : 'text-[#0f172a]'
                      }`}
                    >
                      {train.platform}
                    </span>
                  </div>
                )}
              </div>

              {/* --- 種別 (Type) & 指定席車 (Reserved Car Note): Exactly like photo --- */}
              <div className="w-28 sm:w-36 flex flex-col items-center justify-center space-y-0.5">
                {!isEmpty && (
                  <>
                    <div className="flex items-center space-x-1 justify-center w-full">
                      {/* Train Type Badge */}
                      <div
                        className={`px-2.5 py-1 rounded-[4px] font-bold text-sm sm:text-base tracking-wider shadow-sm flex items-center justify-center min-w-[58px] sm:min-w-[68px] ${lcdStyle.bg} ${lcdStyle.text} ${
                          lcdStyle.border ? `border ${lcdStyle.border}` : ''
                        }`}
                      >
                        {formatTypeJa(getLangText(train.type.name, 'ja'))}
                      </div>

                      {/* 指定席車表記: 写真の「一部特別車」同様、種別の右横に小さく白背景赤枠で表示 */}
                      {train.seatReservation === 'partially_reserved' && (
                        <div className="bg-white border border-[#d60000] text-[#d60000] text-[9px] sm:text-[10px] font-extrabold px-1 py-0.5 rounded leading-tight text-center whitespace-nowrap shadow-sm">
                          <div>一部</div>
                          <div>指定席車</div>
                        </div>
                      )}
                      {train.seatReservation === 'all_reserved' && (
                        <div className="bg-[#d60000] border border-white text-white text-[9px] sm:text-[10px] font-extrabold px-1 py-0.5 rounded leading-tight text-center whitespace-nowrap shadow-sm">
                          <div>全車</div>
                          <div>指定席車</div>
                        </div>
                      )}
                      {!train.seatReservation && train.specialCarNote && (
                        <div className="bg-white border border-[#d60000] text-[#d60000] text-[9px] sm:text-[10px] font-extrabold px-1 py-0.5 rounded leading-tight text-center whitespace-nowrap shadow-sm">
                          <div>{train.specialCarNote.ja}</div>
                        </div>
                      )}
                    </div>

                    {/* English Subtext for Type */}
                    <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium tracking-tight">
                      {train.type.name.en}
                    </span>
                  </>
                )}
              </div>

              {/* --- 行先・経由 (Destination & Via): Station Number + Airport Icon + Station Name --- */}
              <div className="flex-1 flex flex-col justify-center pl-3 sm:pl-6">
                {!isEmpty && (
                  <>
                    <div className="flex items-center space-x-2">
                      {/* Station Number Badge (e.g. [NH 01], [TA 24], [TK 04]) */}
                      {train.stationNumber && (
                        <div
                          className={`text-[10px] sm:text-xs font-black text-white px-1.5 py-0.5 rounded shadow-sm tracking-tighter ${
                            train.stationNumberBg || 'bg-[#005bb5]'
                          }`}
                        >
                          {train.stationNumber}
                        </div>
                      )}

                      {/* Airport Plane Icon if Central Japan Int'l Airport */}
                      {(train.hasAirportIcon || train.destination.ja.includes('空港')) && (
                        <span className="text-base sm:text-lg text-sky-400">✈</span>
                      )}

                      {/* Station Name (Big bold Japanese font spaced out) */}
                      <span className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-white tracking-wide font-['Hiragino_Kaku_Gothic_ProN',_'Noto_Sans_JP',_sans-serif]">
                        {formatDestinationJa(getLangText(train.destination, 'ja'))}
                      </span>

                      {/* Train status warning if approaching or delayed */}
                      {train.status === 'approaching' && (
                        <span className="bg-amber-400 text-black text-xs px-2.5 py-0.5 rounded font-black animate-approach-flash flex items-center space-x-1 border border-amber-300">
                          <span className="w-2 h-2 rounded-full bg-black inline-block animate-ping" />
                          <span>電車接近中</span>
                        </span>
                      )}
                      {(train.status === 'boarding' || train.status === 'arrived') && (
                        <span className="bg-emerald-500 text-black text-xs px-2.5 py-0.5 rounded font-black animate-boarding-flash flex items-center space-x-1 border border-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-white inline-block animate-ping" />
                          <span>ご乗車中</span>
                        </span>
                      )}
                      {train.delayMinutes > 0 && (
                        <span className="bg-rose-600 text-white text-xs px-2.5 py-0.5 rounded font-black animate-delay-flash flex items-center space-x-1 border border-rose-300">
                          <span className="w-2 h-2 rounded-full bg-yellow-300 inline-block animate-ping" />
                          <span>約{train.delayMinutes}分遅れ</span>
                        </span>
                      )}
                    </div>

                    {/* English Subtitle */}
                    <span className="text-[11px] sm:text-xs text-zinc-400 font-medium tracking-wide flex items-center space-x-2">
                      <span>{train.destination.en}</span>
                      {train.status === 'approaching' && (
                        <span className="text-amber-400 font-bold text-[10px] animate-pulse">
                          • Approaching
                        </span>
                      )}
                      {train.delayMinutes > 0 && (
                        <span className="text-rose-400 font-bold text-[10px] animate-pulse">
                          • Delayed approx {train.delayMinutes} min
                        </span>
                      )}
                    </span>
                  </>
                )}
              </div>

              {/* --- 発車時刻 (Time): Bright Clean White Sans-Serif Numbers with delay strikethrough if delayed --- */}
              <div className="w-20 sm:w-28 text-center flex flex-col items-center justify-center">
                {!isEmpty && (
                  <>
                    <span
                      className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${
                        isApproaching
                          ? 'text-amber-300 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                          : isDelayed
                          ? 'text-rose-300 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                          : 'text-white'
                      }`}
                    >
                      {train.scheduledTime}
                    </span>
                    {train.delayMinutes > 0 && (
                      <span className="text-[10px] sm:text-[11px] font-bold text-rose-400 font-mono -mt-1 animate-pulse">
                        +約{train.delayMinutes}分
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* --- 両数 (Cars): Photo-Authentic White Rounded Border Box --- */}
              <div className="w-16 sm:w-20 flex flex-col items-center justify-center">
                {!isEmpty && train.cars && (
                  <>
                    <div className="border-2 border-white rounded-md px-2 py-0.5 text-center min-w-[48px] sm:min-w-[56px] shadow-sm">
                      <span className="text-base sm:text-lg font-black text-white tracking-tight">
                        {train.cars}両
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium mt-0.5">
                      {train.cars} Cars
                    </span>
                  </>
                )}
              </div>

              {/* --- 形式 (Car Model / Series - 右隅っこ): e.g. 6000系, 1200系, 2200系 --- */}
              <div className="w-16 sm:w-24 flex flex-col items-center justify-center">
                {!isEmpty && train.carModel ? (
                  <div className="bg-gradient-to-b from-[#243048] to-[#162032] border border-[#3b4b6b] text-blue-200 text-xs sm:text-sm font-bold px-2 py-1 rounded shadow text-center tracking-tight">
                    {train.carModel}
                  </div>
                ) : (
                  !isEmpty && <span className="text-xs text-zinc-600">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. BOTTOM TICKER: ユーザー厳格指定「接近案内や乗車中案内などは全てLED、LCDの一番下段を変更して案内するように」 */}
      {(() => {
        const bottomNotice = getBottomNoticeInfo(trains, currentTime, stationName, directionType, announcementText);
        const isAlert = bottomNotice.state === 'approaching' || bottomNotice.state === 'boarding';
        const displayNoticeText = bottomNotice.fullTickerText;
        const charCount = displayNoticeText?.length || 80;
        const scrollDuration = Math.max(60, Math.round(charCount * 0.3));

        return (
          <div
            className={`border-t-2 px-3 py-2 flex items-center overflow-hidden cursor-pointer transition-colors ${
              bottomNotice.state === 'approaching'
                ? 'bg-red-950/90 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                : bottomNotice.state === 'boarding'
                ? 'bg-emerald-950/90 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'bg-black border-zinc-800 hover:bg-zinc-950'
            }`}
            onClick={onEditTicker}
            title="クリックして案内テロップを編集"
          >
            <div className="flex items-center space-x-2 flex-shrink-0 mr-3">
              <span className={`w-2.5 h-2.5 rounded-full ${bottomNotice.pingBg} ${isAlert ? 'animate-ping' : ''}`} />
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded border shadow-sm ${bottomNotice.badgeBg} ${bottomNotice.badgeBorder} ${bottomNotice.badgeText}`}
              >
                {activeLanguage === 'en' ? bottomNotice.badgeEn : bottomNotice.badgeJa}
              </span>
            </div>
            <div className="overflow-hidden relative w-full whitespace-nowrap select-none">
              <div
                className={`animate-ticker-continuous text-sm sm:text-base font-bold tracking-wider ${
                  bottomNotice.state === 'approaching'
                    ? 'text-red-200 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                    : bottomNotice.state === 'boarding'
                    ? 'text-emerald-200 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                    : 'text-[#ffea00] drop-shadow-[0_0_8px_rgba(255,234,0,0.5)]'
                }`}
                style={{ '--ticker-duration': `${scrollDuration}s` } as React.CSSProperties}
              >
                <div className="flex-shrink-0 pr-16">
                  {displayNoticeText}
                </div>
                <div className="flex-shrink-0 pr-16" aria-hidden="true">
                  {displayNoticeText}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

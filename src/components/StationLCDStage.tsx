import React, { useMemo } from 'react';
import { LCDStationDisplay } from './LCDStationDisplay';
import { TrainService, Language, LanguageText, DirectionType } from '../types';
import { generateDirectionTickerAnnouncement } from '../utils/stationStops';

interface StationLCDStageProps {
  viewMode: 'dual' | 'single_down' | 'single_up';
  currentDirection: DirectionType;
  downTrains: TrainService[];
  upTrains: TrainService[];
  currentTime: Date;
  activeLanguage: Language;
  directionDownTitle: LanguageText;
  directionUpTitle: LanguageText;
  announcements?: LanguageText[];
  onRowClick: (train: TrainService) => void;
  onEditDirectionDown?: () => void;
  onEditDirectionUp?: () => void;
  onEditTicker?: () => void;
}

export const StationLCDStage: React.FC<StationLCDStageProps> = ({
  viewMode,
  currentDirection,
  downTrains,
  upTrains,
  currentTime,
  activeLanguage,
  directionDownTitle,
  directionUpTitle,
  announcements,
  onRowClick,
  onEditDirectionDown,
  onEditDirectionUp,
  onEditTicker,
}) => {
  // ユーザー要件：「上りと下りで停車駅案内は分けて」
  // 下り方面の停車駅案内
  const downTickerAnnouncement = useMemo(() => {
    return generateDirectionTickerAnnouncement(downTrains, 'down', activeLanguage === 'en' ? 'en' : 'ja');
  }, [downTrains, activeLanguage]);

  // 上り方面の停車駅案内
  const upTickerAnnouncement = useMemo(() => {
    return generateDirectionTickerAnnouncement(upTrains, 'up', activeLanguage === 'en' ? 'en' : 'ja');
  }, [upTrains, activeLanguage]);

  // 案内表示器（ボトムテロップ）テキストの決定（上り・下りそれぞれ独立）
  const downTickerText = useMemo(() => {
    if (announcements && announcements.length > 0 && announcements[0]?.ja) {
      return activeLanguage === 'en' ? (announcements[0]?.en || announcements[0]?.ja) : announcements[0]?.ja;
    }
    return activeLanguage === 'en' ? downTickerAnnouncement.en : downTickerAnnouncement.ja;
  }, [announcements, activeLanguage, downTickerAnnouncement]);

  const upTickerText = useMemo(() => {
    if (announcements && announcements.length > 0 && announcements[0]?.ja) {
      return activeLanguage === 'en' ? (announcements[0]?.en || announcements[0]?.ja) : announcements[0]?.ja;
    }
    return activeLanguage === 'en' ? upTickerAnnouncement.en : upTickerAnnouncement.ja;
  }, [announcements, activeLanguage, upTickerAnnouncement]);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* 1. Station Ceiling & Hanging Mount Hardware */}
      <div className="w-full max-w-6xl flex flex-col items-center">
        {/* Slotted metallic ceiling beam */}
        <div className="w-full h-7 bg-gradient-to-b from-[#404652] via-[#666f7d] to-[#2c323d] border-b border-zinc-950 flex items-center justify-around px-8 shadow-inner overflow-hidden rounded-t-lg">
          <div className="flex space-x-2 opacity-40">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="w-1.5 h-4 bg-zinc-900 rounded-sm" />
            ))}
          </div>
        </div>

        {/* Hanging Steel Brackets / Arms */}
        <div className="w-full flex justify-around px-16 -mb-1 z-10">
          <div className="flex space-x-12">
            <div className="w-4 h-6 bg-gradient-to-r from-zinc-800 via-zinc-900 to-black border-x border-zinc-700 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            </div>
            <div className="w-4 h-6 bg-gradient-to-r from-zinc-800 via-zinc-900 to-black border-x border-zinc-700 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            </div>
          </div>
          {viewMode === 'dual' && (
            <div className="flex space-x-12">
              <div className="w-4 h-6 bg-gradient-to-r from-zinc-800 via-zinc-900 to-black border-x border-zinc-700 shadow-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              </div>
              <div className="w-4 h-6 bg-gradient-to-r from-zinc-800 via-zinc-900 to-black border-x border-zinc-700 shadow-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main LCD Displays Stage */}
      <div className="w-full max-w-6xl">
        {viewMode === 'dual' ? (
          /* 写真完全再現：左右2画面並列（左:下り 4〜8番線 / 右:上り 1〜3番線） */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 p-2.5 sm:p-3 bg-[#020408] rounded-xl border border-zinc-800 shadow-2xl">
            {/* 左画面: 下り方面（名古屋・犬山・岐阜・津・大阪・鳥羽・賢島） */}
            <div className="flex flex-col">
              <div className="text-[11px] text-blue-400 font-bold px-2 py-0.5 mb-1 flex items-center justify-between">
                <span>◀ 4〜8番線 下り方面（下り停車駅テロップ）</span>
                <span className="text-[10px] text-zinc-500">クリックで編集可能</span>
              </div>
              <LCDStationDisplay
                stationName="三河花園駅"
                directionType="down"
                directionTitle={directionDownTitle.ja}
                directionTitleEn={directionDownTitle.en}
                trains={downTrains}
                currentTime={currentTime}
                activeLanguage={activeLanguage}
                announcementText={downTickerText}
                onRowClick={onRowClick}
                onEditDirection={onEditDirectionDown}
                onEditTicker={onEditTicker}
              />
            </div>

            {/* 右画面: 上り方面（豊橋・東岡崎・豊田市・中津川・松本・浜松・愛知大学前） */}
            <div className="flex flex-col">
              <div className="text-[11px] text-emerald-400 font-bold px-2 py-0.5 mb-1 flex items-center justify-between">
                <span>1〜3番線 上り方面（上り停車駅テロップ） ▶</span>
                <span className="text-[10px] text-zinc-500">クリックで編集可能</span>
              </div>
              <LCDStationDisplay
                stationName="三河花園駅"
                directionType="up"
                directionTitle={directionUpTitle.ja}
                directionTitleEn={directionUpTitle.en}
                trains={upTrains}
                currentTime={currentTime}
                activeLanguage={activeLanguage}
                announcementText={upTickerText}
                onRowClick={onRowClick}
                onEditDirection={onEditDirectionUp}
                onEditTicker={onEditTicker}
              />
            </div>
          </div>
        ) : (
          /* 単一画面表示（下りのみ、または上りのみ） */
          <div className="w-full p-2 bg-[#020408] rounded-xl border border-zinc-800 shadow-2xl">
            {currentDirection === 'down' ? (
              <LCDStationDisplay
                stationName="三河花園駅"
                directionType="down"
                directionTitle={directionDownTitle.ja}
                directionTitleEn={directionDownTitle.en}
                trains={downTrains}
                currentTime={currentTime}
                activeLanguage={activeLanguage}
                announcementText={downTickerText}
                onRowClick={onRowClick}
                onEditDirection={onEditDirectionDown}
                onEditTicker={onEditTicker}
              />
            ) : (
              <LCDStationDisplay
                stationName="三河花園駅"
                directionType="up"
                directionTitle={directionUpTitle.ja}
                directionTitleEn={directionUpTitle.en}
                trains={upTrains}
                currentTime={currentTime}
                activeLanguage={activeLanguage}
                announcementText={upTickerText}
                onRowClick={onRowClick}
                onEditDirection={onEditDirectionUp}
                onEditTicker={onEditTicker}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

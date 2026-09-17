import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  MIKAWA_HANAZONO_PRESET,
  COMBINED_DOWN_TRAINS,
  COMBINED_UP_TRAINS,
} from './data/stationPresets';
import {
  BoardViewMode,
  DirectionType,
  Language,
  TrainService,
  LanguageText,
} from './types';
import { StationLCDStage } from './components/StationLCDStage';
import { QuickTrainEditor } from './components/QuickTrainEditor';
import { BoardControls } from './components/BoardControls';
import { TrainEditModal, TrainPlacement } from './components/TrainEditModal';
import { SignboardEditModal } from './components/SignboardEditModal';
import { TickerEditModal } from './components/TickerEditModal';
import { TimetableManager } from './components/TimetableManager';
import { KintetsuLCDDisplay } from './components/displays/KintetsuLCDDisplay';
import { MeitetsuStationLCDDisplay } from './components/displays/MeitetsuStationLCDDisplay';
import { MeitetsuPlatformLEDDisplay } from './components/displays/MeitetsuPlatformLEDDisplay';
import { MeitetsuSpecialCarDisplay } from './components/displays/MeitetsuSpecialCarDisplay';
import { stationAudio } from './utils/audio';
import { initializeTrainsWithCurrentTime, advanceScheduleByTime } from './utils/timeAdjuster';

/**
 * 画面スタイル（ユーザー要望：「名鉄ホームでなくタイプで書き換えて」＆ 写真の再現）
 * 1. 'meitetsu_photo_lcd': 名鉄タイプ 3段LCD（名鉄名古屋駅ホーム3段フルカラーLCD完全再現）
 * 2. 'meitetsu_led': 名鉄タイプ 3段LED（名鉄ホーム3段フルLED発車標・のりば矢印点滅＆上部青看板）
 * 3. 'station_lcd': 本線改札口 LCD（名鉄標準仕様大型コンコースLCD）
 * 4. 'kintetsu_lcd': 近鉄タイプ 3段LCD（近鉄3段フルカラーLCD・種別カラーピル＆四角のりば）
 * 5. 'special_car': 名鉄タイプ 特別車案内LED（特別車ご案内・First Class Information）
 */
export type DisplayPage = 'meitetsu_photo_lcd' | 'meitetsu_led' | 'station_lcd' | 'kintetsu_lcd' | 'special_car';

/**
 * フロア・のりば階層区分（ユーザー厳格指定）：
 * - '4f_limited': 4階 特急・特別快速・指定席のりば
 *     上り9〜11番線（9: 豊田市・中津川・松本、10: 全車指定、11: 一般車）
 *     下り12〜16番線（12: 一般車、13: 全車指定、14: 豊田市・中津川・松本から、15・16: 始発・折り返し）
 *     ※豊明駅は全列車通過。遅延時は退避・番線変更有り。
 * - '2f_local': 2階 普通〜快速急行のりば（上り1〜4番線 / 下り5〜8番線）
 * - 'all_concourse': 1階 総合改札口（全列車案内）
 */
export type StationFloor = '4f_limited' | '2f_local' | 'all_concourse';

export default function App() {
  const station = MIKAWA_HANAZONO_PRESET;

  // 1. 画面スタイル切替
  const [activePage, setActivePage] = useState<DisplayPage>('meitetsu_photo_lcd');

  // 2. フロア区分切替（ユーザー要件：普通〜快速急行は上り1〜4番線／下り5〜8番線、特急・特別快速は4階）
  const [activeFloor, setActiveFloor] = useState<StationFloor>('4f_limited');

  // 3. 上り・下り ＆ 画面表示モード
  const [viewMode, setViewMode] = useState<BoardViewMode>('dual');
  const [currentDirection, setCurrentDirection] = useState<DirectionType>('down');

  // 4. ダイヤ状態（4倍増便・全種類高密度ダイヤ）
  const [downTrains, setDownTrains] = useState<TrainService[]>(() =>
    initializeTrainsWithCurrentTime(COMBINED_DOWN_TRAINS, new Date(), 'down')
  );
  const [upTrains, setUpTrains] = useState<TrainService[]>(() =>
    initializeTrainsWithCurrentTime(COMBINED_UP_TRAINS, new Date(), 'up')
  );

  // 接近放送・発車ベル済みの列車ID追跡
  const announcedTrainIds = useRef<Set<string>>(new Set());
  const departedTrainIds = useRef<Set<string>>(new Set());

  // トースト通知
  const [feedbackToast, setFeedbackToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  useEffect(() => {
    if (!feedbackToast) return;
    const timer = setTimeout(() => setFeedbackToast(null), 4500);
    return () => clearTimeout(timer);
  }, [feedbackToast]);

  // 方面タイトル
  const [directionDownTitle, setDirectionDownTitle] = useState<LanguageText>(station.directionDown.title);
  const [directionUpTitle, setDirectionUpTitle] = useState<LanguageText>(station.directionUp.title);
  const [announcements, setAnnouncements] = useState<LanguageText[]>(() => station.announcements || []);

  // 時計状態
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [isSimulatedTime, setIsSimulatedTime] = useState<boolean>(false);
  const [simulatedSpeed, setSimulatedSpeed] = useState<number>(1);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState<boolean>(true);
  const [activeLanguage, setActiveLanguage] = useState<Language>('ja');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // 編集モーダル
  const [isTrainModalOpen, setIsTrainModalOpen] = useState<boolean>(false);
  const [editingTrain, setEditingTrain] = useState<TrainService | null>(null);
  const [editingTargetDirection, setEditingTargetDirection] = useState<DirectionType>('down');
  const [isSignboardModalOpen, setIsSignboardModalOpen] = useState<boolean>(false);
  const [editingSignboardDir, setEditingSignboardDir] = useState<DirectionType>('down');
  const [isTickerModalOpen, setIsTickerModalOpen] = useState<boolean>(false);

  // 時計タイマー（1秒ごとに更新、倍速時は simulatedSpeed 倍進む）
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (!isSimulatedTime) return new Date();
        return new Date(prev.getTime() + 1000 * simulatedSpeed);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSimulatedTime, simulatedSpeed]);

  // =========================================================================
  // 自動更新 ＆ 接近放送・発車ベル運行エンジン（高速タイムワープ＆倍速完全対応）
  // ユーザー要件：「自動更新が更新されていない時間経過スピードを速くしても対応できるようにして 絶対に動くようにして」
  // =========================================================================
  useEffect(() => {
    if (!autoUpdateEnabled) return;

    const now = currentTime || new Date();
    const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    // 1. 下り・上りダイヤのタイムワープ対応・発車済み列車の即座前進＆同数補充
    setDownTrains((prev) => {
      const advanced = advanceScheduleByTime(prev, COMBINED_DOWN_TRAINS, now, 'down');
      return advanced;
    });

    setUpTrains((prev) => {
      const advanced = advanceScheduleByTime(prev, COMBINED_UP_TRAINS, now, 'up');
      return advanced;
    });

    // 2. 接近放送・発車ベル（直近の先頭列車）
    const checkAudio = (trains: TrainService[], dir: DirectionType, defaultTrack: string) => {
      const first = trains[0];
      if (!first) return;
      const [th, tm] = first.scheduledTime.split(':').map(Number);
      const trainSeconds = th * 3600 + tm * 60 + (first.delayMinutes || 0) * 60;
      const diff = trainSeconds - currentSeconds;

      // 接近放送（発車60秒前〜10秒前）
      const approachWindow = Math.max(60, 20 * simulatedSpeed);
      if (diff <= approachWindow && diff > 5 && !announcedTrainIds.current.has(first.id)) {
        announcedTrainIds.current.add(first.id);
        if (soundEnabled && simulatedSpeed <= 5) {
          stationAudio.announceApproach(first, first.platform || defaultTrack);
        }
      }

      // 発車メロディ（発車時刻直前・発車時）
      const departWindow = Math.max(10, 10 * simulatedSpeed);
      if (diff <= 5 && diff > -departWindow && !departedTrainIds.current.has(first.id)) {
        departedTrainIds.current.add(first.id);
        if (soundEnabled && simulatedSpeed <= 5) {
          stationAudio.playDepartureMelodyByRoute(first.destination.ja, first.type.code);
        }
      }
    };

    checkAudio(downTrains, 'down', activeFloor === '4f_limited' ? '12' : '5');
    checkAudio(upTrains, 'up', activeFloor === '4f_limited' ? '9' : '1');

  }, [currentTime, autoUpdateEnabled, simulatedSpeed, soundEnabled, activeFloor]);

  // =========================================================================
  // ユーザー要件に基づくダイヤの階層フィルタリング
  // - 4階：特急・特別快速・全車指定席車（普通〜快速急行は非表示・2階乗り換え案内）
  // - 2階：普通〜快速急行（上り1〜4番線／下り5〜8番線）
  // - 総合改札口：全列車
  // =========================================================================
  const isLocalToRapidExp = (train: TrainService) => {
    const c = train.type.code;
    return (
      c === 'local' ||
      c === 'semi_express' ||
      c === 'sub_semi_express' ||
      c === 'express' ||
      c === 'rapid_express'
    );
  };

  const filteredDownTrains = useMemo(() => {
    if (activeFloor === '4f_limited') {
      // 4階：特急・特別快速・全車指定席優等専用
      return downTrains.filter((t) => !isLocalToRapidExp(t));
    }
    if (activeFloor === '2f_local') {
      // 2階：普通〜快速急行 専用
      return downTrains.filter((t) => isLocalToRapidExp(t));
    }
    return downTrains; // 総合改札口
  }, [downTrains, activeFloor]);

  const filteredUpTrains = useMemo(() => {
    if (activeFloor === '4f_limited') {
      // 4階：特急・特別快速・指定席優等専用
      return upTrains.filter((t) => !isLocalToRapidExp(t));
    }
    if (activeFloor === '2f_local') {
      // 2階：普通〜快速急行 専用
      return upTrains.filter((t) => isLocalToRapidExp(t));
    }
    return upTrains; // 総合改札口
  }, [upTrains, activeFloor]);

  // =========================================================================
  // ユーザー厳格指定に基づくリアルタイム案内文（4階9〜11番線・12〜16番線、退避・番線変更情報）
  // =========================================================================
  const dynamicAnnouncementDown = useMemo(() => {
    const delayed = filteredDownTrains.filter((t) => (t.delayMinutes || 0) > 0);
    const changed = filteredDownTrains.filter((t) => t.isPlatformChanged);

    let alertPart = '';
    if (changed.length > 0) {
      alertPart += `【番線変更のおしらせ】${changed.map((t) => `${t.scheduledTime}発 ${t.destination.ja}ゆきは発車番線が${t.platform}番線へ変更となりました`).join('。')} `;
    }
    if (delayed.length > 0) {
      alertPart += `【ダイヤ乱れ】下り線一部列車に最大${Math.max(...delayed.map((t) => t.delayMinutes))}分の遅れが発生しています。退避・番線変更にご注意ください。 `;
    }

    if (activeFloor === '4f_limited') {
      return `${alertPart}【4階下りホームのご案内】9〜16番線は全て特急・特別快速の専用です。12〜14番線がメインホームです（12番線：一般特急 / 13番線：全車指定特急 / 14番線：豊田市・松本・浜松からの直通帰着便 / 15・16番線：当駅始発・待機列車）。名古屋行は全て下りホームから発車します。特急・特別快速は豊明駅を通過します。`;
    }
    if (activeFloor === '2f_local') {
      return `${alertPart}【2階下りホームのご案内】5・6・7・8番線（普通・準急・急行・快速急行）。特急・特別快速・全車指定席車は9〜16番線（4階のりば）へお乗り換えください。`;
    }
    return `${alertPart}【総合改札口案内】普通〜快速急行は2階のりば（上り1〜4番線／下り5〜8番線）、特急・特別快速は全て9番線以降の専用のりばです（上り9〜11番線／下り12〜16番線）。`;
  }, [filteredDownTrains, activeFloor]);

  const dynamicAnnouncementUp = useMemo(() => {
    const delayed = filteredUpTrains.filter((t) => (t.delayMinutes || 0) > 0);
    const changed = filteredUpTrains.filter((t) => t.isPlatformChanged);

    let alertPart = '';
    if (changed.length > 0) {
      alertPart += `【番線変更のおしらせ】${changed.map((t) => `${t.scheduledTime}発 ${t.destination.ja}ゆきは発車番線が${t.platform}番線へ変更となりました`).join('。')} `;
    }
    if (delayed.length > 0) {
      alertPart += `【ダイヤ乱れ】上り線一部列車に最大${Math.max(...delayed.map((t) => t.delayMinutes))}分の遅れが発生しています。退避・番線変更にご注意ください。 `;
    }

    if (activeFloor === '4f_limited') {
      return `${alertPart}【4階上りホームのご案内】9〜16番線は全て特急・特別快速の専用です。9番線：特急・特別快速 浜松行、特急 愛知大学前行、豊田市・松本方面 / 10番線：全車指定席（ひのとり豊橋行・停車駅：東岡崎、豊橋） / 11番線：一般特急・特別快速。`;
    }
    if (activeFloor === '2f_local') {
      return `${alertPart}【2階上りホームのご案内】1・2・3・4番線（普通・準急・急行・快速急行）。特急・特別快速（9〜11番線）は4階のりばへお乗り換えください。`;
    }
    return `${alertPart}【総合改札口案内】普通〜快速急行は2階のりば（上り1〜4番線／下り5〜8番線）、特急・特別快速は全て9番線以降の専用のりばです（上り9〜11番線／下り12〜16番線）。`;
  }, [filteredUpTrains, activeFloor]);

  // 音声切り替え
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    stationAudio.setEnabled(next);
  };

  // 時刻合わせ
  const handleAlignScheduleToCurrentTime = () => {
    const now = new Date();
    setCurrentTime(now);
    setDownTrains(initializeTrainsWithCurrentTime(COMBINED_DOWN_TRAINS, now, 'down'));
    setUpTrains(initializeTrainsWithCurrentTime(COMBINED_UP_TRAINS, now, 'up'));
    setFeedbackToast({
      message: '全ダイヤを現在時刻に合わせて自動再設定しました！',
      type: 'success',
    });
  };

  // 接近放送トリガー
  const handleTriggerApproach = (direction: DirectionType) => {
    const targetTrains = direction === 'down' ? filteredDownTrains : filteredUpTrains;
    const train = targetTrains[0];
    if (train) {
      stationAudio.playDepartureMelodyByRoute(train.destination.ja, train.type.code);
      setFeedbackToast({
        message: `【列車接近】${direction === 'down' ? '下り' : '上り'} ${train.scheduledTime}発 ${train.destination.ja}ゆきの発車メロディを吹鳴しました`,
        type: 'info',
      });
    }
  };

  // 発車ベルトリガー
  const handleTriggerDeparture = (direction: DirectionType) => {
    const targetTrains = direction === 'down' ? filteredDownTrains : filteredUpTrains;
    const train = targetTrains[0];
    if (train) {
      stationAudio.playDepartureMelodyByRoute(train.destination.ja, train.type.code);
      setFeedbackToast({
        message: `【発車案内】${train.destination.ja}ゆきの発車メロディを再生しました`,
        type: 'info',
      });
    }
  };

  // 遅延トグル（簡易）
  const handleToggleDelay = (direction: DirectionType = currentDirection, trainIndex: number = 0) => {
    const setter = direction === 'down' ? setDownTrains : setUpTrains;
    setter((prev) => {
      return prev.map((t, idx) => {
        if (idx === trainIndex) {
          const newDelay = t.delayMinutes > 0 ? 0 : 10;
          return {
            ...t,
            delayMinutes: newDelay,
            status: newDelay > 0 ? 'delayed' : 'on_time',
          };
        }
        return t;
      });
    });
  };

  // 遅延時間プログラム（分数指定・先頭または全列車）
  const handleProgramDelay = (minutes: number, target: 'first' | 'all' = 'first') => {
    const setter = currentDirection === 'down' ? setDownTrains : setUpTrains;
    setter((prev) => {
      return prev.map((t, idx) => {
        if (target === 'all' || idx === 0) {
          return {
            ...t,
            delayMinutes: minutes,
            status: minutes > 0 ? 'delayed' : 'on_time',
          };
        }
        return t;
      });
    });

    setFeedbackToast({
      message:
        minutes === 0
          ? `【遅れ解消】${currentDirection === 'down' ? '下り' : '上り'}${target === 'all' ? '全列車' : '先頭列車'}を定刻（遅延0分）に復旧しました`
          : `【遅延プログラム】${currentDirection === 'down' ? '下り' : '上り'}${target === 'all' ? '全列車' : '先頭列車'}に 約${minutes}分 の遅延を設定しました`,
      type: minutes === 0 ? 'success' : 'info',
    });
  };

  // 個別列車の遅延時間更新
  const handleSetTrainDelay = (trainId: string, minutes: number) => {
    const updateInList = (list: TrainService[]) =>
      list.map((t) =>
        t.id === trainId
          ? {
              ...t,
              delayMinutes: minutes,
              status: (minutes > 0 ? 'delayed' : 'on_time') as any,
            }
          : t
      );

    setDownTrains((prev) => updateInList(prev));
    setUpTrains((prev) => updateInList(prev));

    setFeedbackToast({
      message:
        minutes === 0
          ? '対象列車を定刻（遅れ0分）に戻しました'
          : `対象列車の遅れを 約${minutes}分 に設定しました`,
      type: minutes === 0 ? 'success' : 'info',
    });
  };

  // ダイヤリセット
  const handleResetSchedule = () => {
    const base = currentTime || new Date();
    setDownTrains(initializeTrainsWithCurrentTime(COMBINED_DOWN_TRAINS, base, 'down'));
    setUpTrains(initializeTrainsWithCurrentTime(COMBINED_UP_TRAINS, base, 'up'));
  };

  // 列車クリック編集
  const handleRowClick = (train: TrainService) => {
    const isDown = downTrains.some((t) => t.id === train.id);
    setEditingTargetDirection(isDown ? 'down' : 'up');
    setEditingTrain(train);
    setIsTrainModalOpen(true);
  };

  // 新規列車追加
  const handleOpenAddTrain = (dir?: DirectionType) => {
    setEditingTargetDirection(dir || currentDirection);
    setEditingTrain(null);
    setIsTrainModalOpen(true);
  };

  // 列車保存
  const handleSaveTrain = (
    savedTrain: TrainService,
    targetDirection: DirectionType = editingTargetDirection,
    placement: TrainPlacement = 'time_sort'
  ) => {
    const isDown = targetDirection === 'down';
    const updateTarget = isDown ? setDownTrains : setUpTrains;

    updateTarget((prev) => {
      const existsIndex = prev.findIndex((t) => t.id === savedTrain.id);
      let updated: TrainService[];
      if (existsIndex >= 0) {
        updated = prev.map((t) => (t.id === savedTrain.id ? savedTrain : t));
      } else {
        if (placement === 'first') {
          updated = [savedTrain, ...prev];
        } else if (placement === 'slot2') {
          if (prev.length === 0) updated = [savedTrain];
          else updated = [prev[0], savedTrain, ...prev.slice(1)];
        } else if (placement === 'slot3') {
          if (prev.length <= 1) updated = [...prev, savedTrain];
          else updated = [prev[0], prev[1], savedTrain, ...prev.slice(2)];
        } else if (placement === 'last') {
          updated = [...prev, savedTrain];
        } else {
          updated = [...prev, savedTrain].sort((a, b) => {
            return (a.scheduledTime || '99:99').localeCompare(b.scheduledTime || '99:99');
          });
        }
      }
      return updated;
    });

    setCurrentDirection(targetDirection);
    setFeedbackToast({
      message: `【反映完了】${targetDirection === 'down' ? '下り' : '上り'} ${savedTrain.type.name.ja} ${savedTrain.destination.ja}ゆき (${savedTrain.scheduledTime}発) をダイヤに追加しました！`,
      type: 'success',
    });
  };

  // 列車削除
  const handleDeleteTrain = (trainId: string) => {
    setDownTrains((prev) => prev.filter((t) => t.id !== trainId));
    setUpTrains((prev) => prev.filter((t) => t.id !== trainId));
    setFeedbackToast({
      message: '列車をダイヤから削除しました。',
      type: 'info',
    });
  };

  // ダイヤ並び替え（ユーザー要望：読み込みごと・ボタン操作で並び順を変更）
  const handleReshuffleSchedule = () => {
    setDownTrains(initializeTrainsWithCurrentTime(COMBINED_DOWN_TRAINS, new Date(), 'down'));
    setUpTrains(initializeTrainsWithCurrentTime(COMBINED_UP_TRAINS, new Date(), 'up'));
    setFeedbackToast({
      message: 'ダイヤの並び順をランダムにシャッフルし、直近時刻から再編成しました！',
      type: 'success',
    });
  };

  // クイック更新
  const handleQuickUpdateTrain = (updatedTrain: TrainService) => {
    const isDown = downTrains.some((t) => t.id === updatedTrain.id);
    if (isDown) {
      setDownTrains((prev) => prev.map((t) => (t.id === updatedTrain.id ? updatedTrain : t)));
    } else {
      setUpTrains((prev) => prev.map((t) => (t.id === updatedTrain.id ? updatedTrain : t)));
    }
  };

  const activeTrainsForQuickEdit = currentDirection === 'down' ? filteredDownTrains : filteredUpTrains;

  return (
    <div className="min-h-screen bg-[#060911] text-zinc-100 flex flex-col items-center justify-start p-3 sm:p-5 lg:p-6 font-sans">
      {/* Top Header */}
      <header className="w-full max-w-7xl flex flex-wrap items-center justify-between pb-3 border-b border-blue-950/80 mb-3 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.9)] animate-pulse" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>三河花園駅</span>
              <span className="text-xs font-bold text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded border border-blue-800">
                発車標運行システム
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              名鉄名古屋本線・近鉄直通連絡線 • 3系統発車メロディ搭載
            </p>
          </div>
        </div>

        {/* 共通操作バー */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={handleReshuffleSchedule}
            className="px-3 py-1.5 rounded-lg font-bold bg-indigo-600/90 hover:bg-indigo-600 text-white border border-indigo-400/50 shadow flex items-center gap-1.5 transition"
            title="ダイヤの並び順をランダム変更"
          >
            <span>🔀</span>
            <span>ダイヤ並び替え</span>
          </button>

          {/* 表示レイアウト：上り下り両方（dual） or 片方 */}
          <div className="flex items-center bg-[#101420] p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setViewMode('dual')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                viewMode === 'dual'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🔄 上下両方表示
            </button>
            <button
              onClick={() => {
                setViewMode('single_down');
                setCurrentDirection('down');
              }}
              className={`px-2 py-1 rounded text-xs font-bold transition ${
                viewMode === 'single_down'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              下りのみ
            </button>
            <button
              onClick={() => {
                setViewMode('single_up');
                setCurrentDirection('up');
              }}
              className={`px-2 py-1 rounded text-xs font-bold transition ${
                viewMode === 'single_up'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              上りのみ
            </button>
          </div>
        </div>
      </header>

      {/* 1. フロア・のりば選択バー（ユーザー要件：「特急・特別快速乗り場は、４階です」「普通～快速急行は上り１～4番線下り５～8番線です」「普通から快速急行は２階で乗り換えてください」） */}
      <div className="w-full max-w-7xl mb-3 bg-[#0a101d] border-2 border-amber-600/40 rounded-xl p-2.5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center space-x-2">
            <span className="text-amber-400 font-extrabold text-sm flex items-center gap-1.5">
              <span>🏢</span>
              <span>駅フロア / のりば選択：</span>
            </span>
            <span className="text-xs text-zinc-400">
              {activeFloor === '4f_limited' && '【4階のりば】特急・特別快速・全席指定席専用（※豊明駅は全列車通過／普通〜快速急行は2階でお乗り換え）'}
              {activeFloor === '2f_local' && '【2階のりば】普通・準急・急行・快速急行 専用ホーム（上り1〜4番線／下り5〜8番線）'}
              {activeFloor === 'all_concourse' && '【1階 総合改札口】全階層・全列車総合案内'}
            </span>
          </div>

          {/* 運行ステータス ＆ クイックアクション */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>自動更新＆自動放送稼働中</span>
            </span>
            <button
              type="button"
              onClick={() => {
                const now = currentTime || new Date();
                setDownTrains((prev) => (prev.length > 0 ? prev.slice(1) : prev));
                setUpTrains((prev) => (prev.length > 0 ? prev.slice(1) : prev));
                setFeedbackToast({ message: '先頭列車を発車させ、次発列車へ繰り上げました！', type: 'info' });
              }}
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-bold transition flex items-center gap-1 border border-zinc-600"
              title="発車を待たずに次の列車へ進めます"
            >
              <span>⏭️</span>
              <span>次発へ繰り上げ</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const targetTrain = currentDirection === 'down' ? downTrains[0] : upTrains[0];
                if (targetTrain) {
                  stationAudio.announceApproach(targetTrain, targetTrain.platform || (currentDirection === 'down' ? '5' : '2'));
                  setFeedbackToast({ message: `📢 ${targetTrain.type.name.ja} ${targetTrain.destination.ja}ゆき の接近自動放送を再生しました`, type: 'success' });
                }
              }}
              className="px-2 py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 rounded text-xs font-bold transition flex items-center gap-1 border border-amber-600"
              title="現在の先頭列車の接近アナウンスとチャイムを鳴らします"
            >
              <span>📢</span>
              <span>接近放送テスト</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveFloor('4f_limited')}
            className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm text-left flex flex-col justify-center transition border ${
              activeFloor === '4f_limited'
                ? 'bg-gradient-to-r from-red-950 to-red-900 text-white border-red-500 shadow-md ring-1 ring-red-500'
                : 'bg-[#121622] text-zinc-300 border-zinc-800 hover:bg-[#1a2030] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>⭐</span>
              <span>4階 特急・特別快速専用のりば（9〜16番線）</span>
            </span>
            <span className="text-[10px] text-amber-300 font-normal">
              上り9〜11番線（9浜松・松本/10ひのとり豊橋/11一般）／下り12〜16番線（12〜14番線メイン/15-16待機）
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFloor('2f_local')}
            className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm text-left flex flex-col justify-center transition border ${
              activeFloor === '2f_local'
                ? 'bg-gradient-to-r from-emerald-950 to-emerald-900 text-white border-emerald-500 shadow-md ring-1 ring-emerald-500'
                : 'bg-[#121622] text-zinc-300 border-zinc-800 hover:bg-[#1a2030] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>🚉</span>
              <span>2階 普通〜快速急行 専用のりば（1〜8番線）</span>
            </span>
            <span className="text-[10px] text-emerald-300 font-normal">
              上り1〜4番線／下り5〜8番線（普通・準急・急行・快速急行）
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFloor('all_concourse')}
            className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm text-left flex flex-col justify-center transition border ${
              activeFloor === 'all_concourse'
                ? 'bg-gradient-to-r from-blue-950 to-blue-900 text-white border-blue-500 shadow-md ring-1 ring-blue-500'
                : 'bg-[#121622] text-zinc-300 border-zinc-800 hover:bg-[#1a2030] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>🏛️</span>
              <span>1階 総合改札口（全列車一括表示）</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-normal">
              2階・4階すべての列車を一括表示
            </span>
          </button>
        </div>
      </div>

      {/* 2. 表示器タイプ切替ナビゲーションバー（ユーザー要望：「名鉄ホームでなくタイプで書き換えて」＆ 写真の再現） */}
      <nav className="w-full max-w-7xl mb-4 bg-[#0d121d] border border-blue-900/60 rounded-xl p-2 shadow-xl">
        <div className="flex items-center justify-between mb-1.5 px-2 text-[11px] font-bold text-zinc-400">
          <span className="flex items-center gap-1 text-blue-300">
            <span>📺</span>
            <span>表示器タイプ切替（実物写真完全再現 ＆ 左右2画面並列対応）：</span>
          </span>
          <span className="text-amber-400 font-mono">同一ダイヤ連動・全タイプ上り下り両方表示可能</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {/* 写真再現：名鉄タイプ 3段LCD */}
          <button
            type="button"
            onClick={() => setActivePage('meitetsu_photo_lcd')}
            className={`px-3 py-2.5 rounded-lg font-bold text-xs sm:text-sm text-left flex flex-col justify-center transition border ${
              activePage === 'meitetsu_photo_lcd'
                ? 'bg-gradient-to-r from-amber-950 to-amber-900 text-white border-amber-400 shadow-md ring-1 ring-amber-400'
                : 'bg-[#131926] text-zinc-300 border-zinc-800 hover:bg-[#1a2335] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>🎫</span>
              <span className="truncate">名鉄タイプ 3段LCD</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-normal">
              写真再現：黒看板＆停車駅帯＆下部矢印
            </span>
          </button>

          {/* 写真再現：名鉄タイプ 3段LED */}
          <button
            type="button"
            onClick={() => setActivePage('meitetsu_led')}
            className={`px-3 py-2.5 rounded-lg font-bold text-xs sm:text-sm text-left flex flex-col justify-center transition border ${
              activePage === 'meitetsu_led'
                ? 'bg-gradient-to-r from-emerald-950 to-emerald-900 text-white border-emerald-400 shadow-md ring-1 ring-emerald-400'
                : 'bg-[#131926] text-zinc-300 border-zinc-800 hover:bg-[#1a2335] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>🚥</span>
              <span className="truncate">名鉄タイプ 3段LED</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-normal">
              写真3再現：上部青看板・赤丸LED・接近矢印
            </span>
          </button>

          {/* 本線改札口 LCD */}
          <button
            type="button"
            onClick={() => setActivePage('station_lcd')}
            className={`px-3 py-2.5 rounded-lg font-bold text-xs sm:text-sm text-left flex flex-col justify-center transition border ${
              activePage === 'station_lcd'
                ? 'bg-gradient-to-r from-blue-950 to-blue-900 text-white border-blue-400 shadow-md ring-1 ring-blue-400'
                : 'bg-[#131926] text-zinc-300 border-zinc-800 hover:bg-[#1a2335] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>🖥️</span>
              <span className="truncate">本線改札口 LCD</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-normal">
              名鉄仕様大型フルカラーコンコースLCD
            </span>
          </button>

          {/* 近鉄タイプ 3段LCD */}
          <button
            type="button"
            onClick={() => setActivePage('kintetsu_lcd')}
            className={`px-3 py-2.5 rounded-lg font-bold text-xs sm:text-sm text-left flex flex-col justify-center transition border ${
              activePage === 'kintetsu_lcd'
                ? 'bg-gradient-to-r from-red-950 to-red-900 text-white border-red-400 shadow-md ring-1 ring-red-400'
                : 'bg-[#131926] text-zinc-300 border-zinc-800 hover:bg-[#1a2335] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>🚅</span>
              <span className="truncate">近鉄タイプ 3段LCD</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-normal">
              写真1再現：種別ピル＆白角丸四角のりば
            </span>
          </button>

          {/* 写真再現：名鉄タイプ 特別車案内LED */}
          <button
            type="button"
            onClick={() => setActivePage('special_car')}
            className={`px-3 py-2.5 rounded-lg font-bold text-xs sm:text-sm text-left flex flex-col justify-center transition border ${
              activePage === 'special_car'
                ? 'bg-gradient-to-r from-purple-950 to-purple-900 text-white border-purple-400 shadow-md ring-1 ring-purple-400'
                : 'bg-[#131926] text-zinc-300 border-zinc-800 hover:bg-[#1a2335] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>👑</span>
              <span className="truncate">特別車案内 LED</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-normal">
              写真2再現：特別車ご案内・全車/一部特別車
            </span>
          </button>
        </div>
      </nav>

      {/* Feedback Toast */}
      {feedbackToast && (
        <div
          className={`w-full max-w-7xl mb-4 px-4 py-3 rounded-xl border flex items-center justify-between text-sm font-bold shadow-lg transition-all ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-emerald-950/50'
              : feedbackToast.type === 'error'
              ? 'bg-red-950/90 border-red-500 text-red-200 shadow-red-950/50'
              : 'bg-blue-950/90 border-blue-500 text-blue-200 shadow-blue-950/50'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-base">{feedbackToast.type === 'success' ? '✅' : 'ℹ️'}</span>
            <span>{feedbackToast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="text-xs opacity-70 hover:opacity-100 px-2 py-1 rounded bg-black/30"
          >
            閉じる
          </button>
        </div>
      )}

      {/* メイン発車標ステージ（上り下り両方見れるレイアウトを全スタイルで実現！） */}
      <main className="w-full max-w-7xl flex flex-col items-center">
        {/* ================================================================= */}
        {/* 1. 写真再現：名鉄タイプ 3段フルカラーLCD発車標（写真 image.png 完全再現） */}
        {/* ================================================================= */}
        {activePage === 'meitetsu_photo_lcd' && (
          <div className="w-full flex flex-col items-center">
            {viewMode === 'dual' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                {/* 左側：下り（名古屋・犬山・岐阜・津・大阪・賢島方面） */}
                <MeitetsuStationLCDDisplay
                  stationName={station.name.ja}
                  direction="down"
                  trains={filteredDownTrains}
                  currentTime={currentTime}
                  onTrainClick={handleRowClick}
                  trackNumber={activeFloor === '4f_limited' ? '12' : '5'}
                  arrowDirection="right"
                  directionTitleJa="岩倉・犬山・可児・津・大阪 方面"
                  directionTitleEn="for Iwakura, Inuyama, Kani, Tsu, Osaka"
                  announcementText={dynamicAnnouncementDown}
                />

                {/* 右側：上り（豊橋・豊川稲荷・東岡崎・中津川・松本方面） */}
                <MeitetsuStationLCDDisplay
                  stationName={station.name.ja}
                  direction="up"
                  trains={filteredUpTrains}
                  currentTime={currentTime}
                  onTrainClick={handleRowClick}
                  trackNumber={activeFloor === '4f_limited' ? '9' : '1'}
                  arrowDirection="left"
                  directionTitleJa="豊橋・豊川稲荷・東岡崎・中津川 方面"
                  directionTitleEn="for Toyohashi, Toyokawa-Inari, Higashi-Okazaki"
                  announcementText={dynamicAnnouncementUp}
                />
              </div>
            ) : (
              <MeitetsuStationLCDDisplay
                stationName={station.name.ja}
                direction={currentDirection}
                trains={currentDirection === 'down' ? filteredDownTrains : filteredUpTrains}
                currentTime={currentTime}
                onTrainClick={handleRowClick}
                trackNumber={
                  activeFloor === '4f_limited'
                    ? (currentDirection === 'down' ? '12' : '9')
                    : (currentDirection === 'down' ? '5' : '1')
                }
                arrowDirection={currentDirection === 'down' ? 'right' : 'left'}
                announcementText={currentDirection === 'down' ? dynamicAnnouncementDown : dynamicAnnouncementUp}
              />
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. 写真再現：名鉄タイプ 3段LED発車標（写真3再現） */}
        {/* ================================================================= */}
        {activePage === 'meitetsu_led' && (
          <div className="w-full flex flex-col items-center">
            {viewMode === 'dual' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                {/* 下り */}
                <MeitetsuPlatformLEDDisplay
                  stationName={station.name.ja}
                  direction="down"
                  trains={filteredDownTrains}
                  currentTime={currentTime}
                  onTrainClick={handleRowClick}
                  trackNumberLeft={activeFloor === '4f_limited' ? '12' : '5'}
                  trackNumberRight={activeFloor === '4f_limited' ? '13' : '6'}
                  destinationSummaryJa="名古屋・犬山・岐阜・津・大阪 方面"
                  destinationSummaryEn="for Nagoya, Inuyama, Gifu, Tsu, Osaka"
                  announcementText={dynamicAnnouncementDown}
                />
                {/* 上り */}
                <MeitetsuPlatformLEDDisplay
                  stationName={station.name.ja}
                  direction="up"
                  trains={filteredUpTrains}
                  currentTime={currentTime}
                  onTrainClick={handleRowClick}
                  trackNumberLeft={activeFloor === '4f_limited' ? '9' : '1'}
                  trackNumberRight={activeFloor === '4f_limited' ? '10' : '2'}
                  destinationSummaryJa="豊橋・豊川稲荷・東岡崎・中津川 方面"
                  destinationSummaryEn="for Toyohashi, Toyokawa-Inari, Higashi-Okazaki"
                  announcementText={dynamicAnnouncementUp}
                />
              </div>
            ) : (
              <MeitetsuPlatformLEDDisplay
                stationName={station.name.ja}
                direction={currentDirection}
                trains={currentDirection === 'down' ? filteredDownTrains : filteredUpTrains}
                currentTime={currentTime}
                onTrainClick={handleRowClick}
                trackNumberLeft={
                  activeFloor === '4f_limited'
                    ? (currentDirection === 'down' ? '12' : '9')
                    : (currentDirection === 'down' ? '5' : '1')
                }
                trackNumberRight={
                  activeFloor === '4f_limited'
                    ? (currentDirection === 'down' ? '13' : '10')
                    : (currentDirection === 'down' ? '6' : '2')
                }
                announcementText={currentDirection === 'down' ? dynamicAnnouncementDown : dynamicAnnouncementUp}
              />
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. 写真再現：近鉄タイプ 3段フルカラーLCD発車標（写真1再現） */}
        {/* ================================================================= */}
        {activePage === 'kintetsu_lcd' && (
          <div className="w-full flex flex-col items-center">
            {viewMode === 'dual' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                {/* 下り */}
                <div className="flex flex-col items-center">
                  <div className="text-sm font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                    <span>▼ 下り（津・大阪・鳥羽・賢島・名古屋方面）</span>
                  </div>
                  <KintetsuLCDDisplay
                    stationName={station.name.ja}
                    direction="down"
                    trains={filteredDownTrains}
                    currentTime={currentTime}
                    onTrainClick={handleRowClick}
                    announcementText={dynamicAnnouncementDown}
                  />
                </div>
                {/* 上り */}
                <div className="flex flex-col items-center">
                  <div className="text-sm font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                    <span>▲ 上り（豊橋・豊川稲荷・東岡崎・中津川・松本方面）</span>
                  </div>
                  <KintetsuLCDDisplay
                    stationName={station.name.ja}
                    direction="up"
                    trains={filteredUpTrains}
                    currentTime={currentTime}
                    onTrainClick={handleRowClick}
                    announcementText={dynamicAnnouncementUp}
                  />
                </div>
              </div>
            ) : (
              <KintetsuLCDDisplay
                stationName={station.name.ja}
                direction={currentDirection}
                trains={currentDirection === 'down' ? filteredDownTrains : filteredUpTrains}
                currentTime={currentTime}
                onTrainClick={handleRowClick}
                announcementText={currentDirection === 'down' ? dynamicAnnouncementDown : dynamicAnnouncementUp}
              />
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. 本線改札口 大型フルカラーLCD発車標（名鉄仕様左右2画面並列） */}
        {/* ================================================================= */}
        {activePage === 'station_lcd' && (
          <div className="w-full flex flex-col items-center">
            <StationLCDStage
              viewMode={viewMode}
              currentDirection={currentDirection}
              downTrains={filteredDownTrains}
              upTrains={filteredUpTrains}
              currentTime={currentTime}
              activeLanguage={activeLanguage}
              directionDownTitle={directionDownTitle}
              directionUpTitle={directionUpTitle}
              announcements={announcements}
              onRowClick={handleRowClick}
              onEditDirectionDown={() => {
                setEditingSignboardDir('down');
                setIsSignboardModalOpen(true);
              }}
              onEditDirectionUp={() => {
                setEditingSignboardDir('up');
                setIsSignboardModalOpen(true);
              }}
              onEditTicker={() => setIsTickerModalOpen(true)}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* 5. 写真再現：名鉄タイプ 特別車案内LED（写真2再現） */}
        {/* ================================================================= */}
        {activePage === 'special_car' && (
          <div className="w-full flex flex-col items-center">
            {viewMode === 'dual' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                {/* 下り */}
                <div className="flex flex-col items-center">
                  <div className="text-sm font-bold text-purple-300 mb-1 flex items-center gap-1.5">
                    <span>▼ 下り 特別車案内（名古屋・岐阜・犬山・津方面）</span>
                  </div>
                  <MeitetsuSpecialCarDisplay
                    stationName={station.name.ja}
                    direction="down"
                    trains={filteredDownTrains}
                    currentTime={currentTime}
                    onTrainClick={handleRowClick}
                  />
                </div>
                {/* 上り */}
                <div className="flex flex-col items-center">
                  <div className="text-sm font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                    <span>▲ 上り 特別車案内（豊橋・豊川稲荷・中津川方面）</span>
                  </div>
                  <MeitetsuSpecialCarDisplay
                    stationName={station.name.ja}
                    direction="up"
                    trains={filteredUpTrains}
                    currentTime={currentTime}
                    onTrainClick={handleRowClick}
                  />
                </div>
              </div>
            ) : (
              <MeitetsuSpecialCarDisplay
                stationName={station.name.ja}
                direction={currentDirection}
                trains={currentDirection === 'down' ? filteredDownTrains : filteredUpTrains}
                currentTime={currentTime}
                onTrainClick={handleRowClick}
              />
            )}
          </div>
        )}

        {/* ガイド注記 */}
        <div className="text-xs text-zinc-400 flex flex-wrap items-center justify-between w-full px-2 mt-3 gap-2">
          <span className="flex items-center gap-1">
            <span>💡</span>
            <span>行をクリックすると列車の種別・行先・時刻・両数・遅延を直接編集できます。</span>
          </span>
          <span className="text-amber-400 font-medium">
            🎵 行内または🎵ボタンで「近鉄」「JR」「名鉄」固有の発車メロディが流れます
          </span>
        </div>

        {/* クイック列車エディター */}
        <div className="w-full mt-4">
          <QuickTrainEditor
            trains={activeTrainsForQuickEdit}
            activeLanguage={activeLanguage}
            directionType={currentDirection}
            onEditTrain={handleRowClick}
            onQuickUpdateTrain={handleQuickUpdateTrain}
            onResetToDefault={handleResetSchedule}
          />
        </div>

        {/* インタラクティブ操作パネル */}
        <div className="w-full mt-5">
          <BoardControls
            currentDirection={currentDirection}
            onChangeDirection={setCurrentDirection}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            activeLanguage={activeLanguage}
            onSelectLanguage={setActiveLanguage}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            isSimulatedTime={isSimulatedTime}
            onToggleSimulatedTime={() => setIsSimulatedTime(!isSimulatedTime)}
            simulatedSpeed={simulatedSpeed}
            onChangeSimulatedSpeed={setSimulatedSpeed}
            autoUpdateEnabled={autoUpdateEnabled}
            onToggleAutoUpdate={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
            onAlignScheduleToCurrentTime={handleAlignScheduleToCurrentTime}
            onTriggerApproach={handleTriggerApproach}
            onTriggerDeparture={handleTriggerDeparture}
            onToggleDelay={handleToggleDelay}
            onProgramDelay={handleProgramDelay}
            onResetSchedule={handleResetSchedule}
            onOpenAddTrain={handleOpenAddTrain}
          />
        </div>

        {/* 全ダイヤ一覧・運行管理 */}
        <div className="w-full">
          <TimetableManager
            currentDirection={currentDirection}
            onChangeDirection={(dir) => {
              setCurrentDirection(dir);
              if (viewMode !== 'dual') {
                setViewMode(dir === 'down' ? 'single_down' : 'single_up');
              }
            }}
            downTrains={downTrains}
            upTrains={upTrains}
            onAddTrain={handleOpenAddTrain}
            onEditTrain={handleRowClick}
            onDeleteTrain={handleDeleteTrain}
            onUpdateTrainDelay={handleSetTrainDelay}
            onMoveTrain={(dir, idx, d) => {
              const setter = dir === 'down' ? setDownTrains : setUpTrains;
              setter((prev) => {
                const next = [...prev];
                const targetIdx = d === 'up' ? idx - 1 : idx + 1;
                if (targetIdx < 0 || targetIdx >= next.length) return prev;
                const temp = next[idx];
                next[idx] = next[targetIdx];
                next[targetIdx] = temp;
                return next;
              });
            }}
            onPromoteToTop={(dir, idx) => {
              const setter = dir === 'down' ? setDownTrains : setUpTrains;
              setter((prev) => {
                const next = [...prev];
                if (idx < 0 || idx >= next.length) return prev;
                const [item] = next.splice(idx, 1);
                return [item, ...next];
              });
            }}
            onSortByTime={(dir) => {
              const setter = dir === 'down' ? setDownTrains : setUpTrains;
              setter((prev) =>
                [...prev].sort((a, b) => (a.scheduledTime || '99:99').localeCompare(b.scheduledTime || '99:99'))
              );
            }}
          />
        </div>
      </main>

      {/* モーダル群 */}
      <TrainEditModal
        isOpen={isTrainModalOpen}
        onClose={() => setIsTrainModalOpen(false)}
        train={editingTrain}
        onSave={handleSaveTrain}
        onSaveTrain={handleSaveTrain}
        targetDirection={editingTargetDirection}
      />

      <SignboardEditModal
        isOpen={isSignboardModalOpen}
        onClose={() => setIsSignboardModalOpen(false)}
        direction={editingSignboardDir}
        currentTitle={editingSignboardDir === 'down' ? directionDownTitle : directionUpTitle}
        onSaveTitle={(dir, newTitle) => {
          if (dir === 'down') setDirectionDownTitle(newTitle);
          else setDirectionUpTitle(newTitle);
        }}
      />

      <TickerEditModal
        isOpen={isTickerModalOpen}
        onClose={() => setIsTickerModalOpen(false)}
        currentAnnouncement={announcements[0] || { ja: '', en: '' }}
        downTrains={downTrains}
        upTrains={upTrains}
        onSave={(newAnnouncement) => setAnnouncements([newAnnouncement])}
      />
    </div>
  );
}

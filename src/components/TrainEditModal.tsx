import React, { useState, useEffect, useMemo } from 'react';
import { TRAIN_TYPES } from '../data/trainTypes';
import { TrainCategory, TrainService, TrainStatus, SeatReservationType, DirectionType } from '../types';
import { autoTranslateStation } from '../utils/stationTranslator';
import { getTrainStopsInfo } from '../utils/stationStops';
import { VEHICLE_MODELS, VehicleModelData, canCoupleVehicles, getCoupledVehicles, isAllReservedVehicleModel } from '../data/vehicleModels';
import { X, Check, Clock, Trash2, Train, Layers, Sparkles, ArrowUpDown, Zap, Info, Plus, Minus } from 'lucide-react';

export const toCircledNumber = (numStr: string): string => {
  const map: Record<string, string> = {
    '1': '①',
    '2': '②',
    '3': '③',
    '4': '④',
    '5': '⑤',
    '6': '⑥',
    '7': '⑦',
    '8': '⑧',
    '9': '⑨',
    '10': '⑩',
    '11': '⑪',
    '12': '⑫',
    '13': '⑬',
    '14': '⑭',
    '15': '⑮',
    '16': '⑯',
  };
  return map[numStr] || numStr;
};

export type TrainPlacement = 'time_sort' | 'first' | 'slot2' | 'slot3' | 'last';

interface TrainEditModalProps {
  train: TrainService | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (train: TrainService, targetDirection: DirectionType, placement: TrainPlacement) => void;
  onSaveTrain?: (train: TrainService, targetDirection: DirectionType, placement: TrainPlacement) => void;
  onDelete?: (trainId: string) => void;
  availablePlatforms?: string[];
  directionType?: DirectionType;
  targetDirection?: DirectionType;
}

export const TrainEditModal: React.FC<TrainEditModalProps> = ({
  train,
  isOpen,
  onClose,
  onSave,
  onSaveTrain,
  onDelete,
  availablePlatforms = [
    '1', '2', '3', '4', '5', '6', '7', '8',
    '9', '10', '11', '12', '13', '14', '15', '16',
  ],
  directionType = 'down',
  targetDirection,
}) => {
  // Top-level hooks
  const [selectedDirection, setSelectedDirection] = useState<DirectionType>(targetDirection || directionType);
  const [placement, setPlacement] = useState<TrainPlacement>('time_sort');

  const [typeKey, setTypeKey] = useState<TrainCategory>('ltd_exp');
  const [destJa, setDestJa] = useState('名古屋');
  const [destEn, setDestEn] = useState('Nagoya');
  const [stationNumber, setStationNumber] = useState('NH36');
  const [hasAirportIcon, setHasAirportIcon] = useState(false);
  const [seatReservation, setSeatReservation] = useState<SeatReservationType>('partially_reserved');

  const [time, setTime] = useState('19:35');
  const [platform, setPlatform] = useState('4');
  const [cars, setCars] = useState(6);
  const [carModel, setCarModel] = useState('2200系');
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [status, setStatus] = useState<TrainStatus>('on_time');

  // 車両形式フィルタータブ
  const [vehicleCategoryFilter, setVehicleCategoryFilter] = useState<string>('ALL');

  // Sync / Reset state when modal opens or train/direction changes
  useEffect(() => {
    if (!isOpen) return;

    if (train) {
      setSelectedDirection(directionType);
      setPlacement('time_sort');
      setTypeKey(train.type.code || 'ltd_exp');
      setDestJa(train.destination.ja || '');
      setDestEn(train.destination.en || '');
      setStationNumber(train.stationNumber || '');
      setHasAirportIcon(train.hasAirportIcon || false);
      setSeatReservation(
        train.seatReservation ||
          (train.specialCarNote?.ja?.includes('一部')
            ? 'partially_reserved'
            : train.specialCarNote?.ja?.includes('全車')
            ? 'all_reserved'
            : 'none')
      );
      setTime(train.scheduledTime || '19:35');
      setPlatform(train.platform || (directionType === 'down' ? '4' : '1'));
      setCars(train.cars || 6);
      setCarModel(train.carModel || '2200系');
      setDelayMinutes(train.delayMinutes || 0);
      setStatus(train.status || 'on_time');
    } else {
      // New train clean reset
      const isDown = directionType === 'down';
      setSelectedDirection(directionType);
      setPlacement('time_sort');
      setTypeKey('ltd_exp');
      setDestJa(isDown ? '名古屋' : '豊橋');
      setDestEn(isDown ? 'Nagoya' : 'Toyohashi');
      setStationNumber(isDown ? 'NH36' : 'NH01');
      setHasAirportIcon(false);
      setSeatReservation('partially_reserved');

      // Smart default time
      const now = new Date();
      const nextMin = Math.ceil((now.getMinutes() + 5) / 5) * 5;
      const targetMin = nextMin % 60;
      const targetHr = (now.getHours() + Math.floor(nextMin / 60)) % 24;
      setTime(`${String(targetHr).padStart(2, '0')}:${String(targetMin).padStart(2, '0')}`);

      setPlatform(isDown ? '4' : '1');
      setCars(6);
      setCarModel(isDown ? '2200系' : '1200系');
      setDelayMinutes(0);
      setStatus('on_time');
    }
  }, [isOpen, train, directionType]);

  // Handle direction switch inside the modal
  const handleDirectionChange = (newDir: DirectionType) => {
    setSelectedDirection(newDir);
    if (!train) {
      if (newDir === 'down') {
        setPlatform('4');
        if (destJa === '豊橋') {
          handleSelectDest('名古屋', 'Nagoya', 'NH36');
        }
        if (carModel === '1200系') setCarModel('2200系');
      } else {
        setPlatform('1');
        if (destJa === '名古屋') {
          handleSelectDest('豊橋', 'Toyohashi', 'NH01');
        }
        if (carModel === '2200系') setCarModel('1200系');
      }
    } else {
      if (newDir === 'down' && ['1', '2', '3'].includes(platform)) {
        setPlatform('4');
      } else if (newDir === 'up' && ['4', '5', '6', '7', '8'].includes(platform)) {
        setPlatform('1');
      }
    }
  };

  // When Destination JA changes, auto-fill En
  const handleDestJaChange = (newJa: string) => {
    setDestJa(newJa);
    const translated = autoTranslateStation(newJa);
    setDestEn(translated.en);

    // Auto set airport icon or station number
    if (newJa.includes('空港') || newJa.includes('中部国際')) {
      setHasAirportIcon(true);
      setStationNumber('TA24');
    } else {
      setHasAirportIcon(false);
      if (newJa === '名古屋') setStationNumber('NH36');
      else if (newJa === '岐阜') setStationNumber('NH60');
      else if (newJa === '犬山') setStationNumber('IY15');
      else if (newJa === '豊橋') setStationNumber('NH01');
      else if (newJa === '豊川稲荷') setStationNumber('TK04');
      else if (newJa === '東岡崎') setStationNumber('NH13');
      else if (newJa === '豊田市') setStationNumber('MY07');
      else if (newJa === '浜松') setStationNumber('CA34');
      else if (newJa === '津') setStationNumber('E39');
      else if (newJa.includes('大阪上本町')) setStationNumber('D03');
      else if (newJa.includes('難波') || newJa.includes('大阪')) setStationNumber('A01');
      else if (newJa.includes('鳥羽')) setStationNumber('M78');
      else if (newJa.includes('宇治山田')) setStationNumber('M74');
      else if (newJa.includes('五十鈴川')) setStationNumber('M75');
      else if (newJa.includes('賢島')) setStationNumber('M93');
      else if (newJa.includes('中津川')) setStationNumber('CF19');
      else if (newJa.includes('松本')) setStationNumber('36');
      else if (newJa.includes('愛知大学前')) setStationNumber('18-04');
    }

    // 【要件ルール】
    // 豊田市方面に行く便はみんな1番線から発着
    if (newJa.includes('豊田市') || newJa.includes('中津川') || newJa.includes('松本')) {
      setSelectedDirection('up');
      setPlatform('1');
    }
    // 豊田市方面から帰ってきた便はみな6番線から発着
    if (newJa.includes('豊田市発')) {
      setSelectedDirection('down');
      setPlatform('6');
    }
  };

  const handleSelectDest = (
    ja: string,
    en: string,
    num: string,
    airport = false,
    forcedPlatform?: string
  ) => {
    setDestJa(ja);
    setDestEn(en);
    setStationNumber(num);
    setHasAirportIcon(airport);

    // 【要件ルール】
    // 9番線は全席指定であっても豊田市、松本、中津川に行くのであれば、絶対9番線
    // 14番線も同じで全席指定であっても豊田市、松本、中津川から帰ってきたのであれば絶対14番線
    if (ja.includes('豊田市') || ja.includes('中津川') || ja.includes('松本')) {
      setSelectedDirection('up');
      setPlatform('9');
    } else if (forcedPlatform) {
      setPlatform(forcedPlatform);
      if (['5', '6', '7', '8', '12', '13', '14', '15', '16'].includes(forcedPlatform)) {
        setSelectedDirection('down');
      } else {
        setSelectedDirection('up');
      }
    } else if (ja.includes('豊田市発') || ja.includes('中津川発') || ja.includes('松本発')) {
      setSelectedDirection('down');
      setPlatform('14');
    }
  };

  // 車両モデル選択時の連動ハンドラ
  const handleSelectVehicleModel = (v: VehicleModelData) => {
    setCarModel(v.model);
    if (v.cars && v.cars.length > 0) {
      // ユーザーのPDF表に準拠した両数
      setCars(v.cars[0]);
    }
    // ユーザー指示「さっきのPDFで全席指定と備考に書いてあるものは全席指定で動かしていいからね」
    if (v.remarks?.includes('全席指定') || v.seatType === 'all_reserved' || isAllReservedVehicleModel(v.model)) {
      setSeatReservation('all_reserved');
    } else {
      setSeatReservation(v.seatType);
    }

    // 車両形式に応じた種別の自動連動
    if (v.id === 'kintetsu-80000') {
      setTypeKey('hinotori');
    } else if (v.id === 'kintetsu-50000') {
      setTypeKey('shimakaze');
    } else if (v.id === 'kintetsu-23000') {
      setTypeKey('ise_shima_liner');
    } else if (v.id === 'kintetsu-30000') {
      setTypeKey('vistacar');
    } else if (v.id === 'kintetsu-21000' || v.id === 'kintetsu-21020') {
      setTypeKey('urban_liner');
    } else if (v.id === 'jr-383') {
      setTypeKey('shinano');
    } else if (v.id === 'jr-683') {
      setTypeKey('thunderbird');
    } else if (v.id === 'meitetsu-2000') {
      setTypeKey('myu_sky');
    } else if (v.id === 'meitetsu-1200' || v.id === 'meitetsu-1000') {
      setTypeKey('ltd_exp');
    }

    // 豊田管轄の場合は1番線推奨
    if (v.jurisdiction.includes('豊田') && selectedDirection === 'up') {
      setPlatform('1');
    }
  };

  // Quick time adjustments
  const handleAddMinutes = (minutesToAdd: number) => {
    const [hStr, mStr] = time.split(':');
    let h = parseInt(hStr, 10) || 0;
    let m = parseInt(mStr, 10) || 0;
    m += minutesToAdd;
    while (m >= 60) {
      m -= 60;
      h = (h + 1) % 24;
    }
    setTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  const handleSetCurrentTime = () => {
    const now = new Date();
    setTime(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );
  };

  const currentTypeInfo = TRAIN_TYPES[typeKey] || TRAIN_TYPES.ltd_exp;

  const handleSave = () => {
    let finalSeatRes = seatReservation;
    if (finalSeatRes === 'none' && isAllReservedVehicleModel(carModel)) {
      finalSeatRes = 'all_reserved';
    }

    let specialNote = undefined;
    if (finalSeatRes === 'partially_reserved') {
      specialNote = { ja: '一部指定席車', en: 'Partially Reserved' };
    } else if (finalSeatRes === 'all_reserved') {
      specialNote = { ja: '全車指定席車', en: 'All Reserved' };
    }

    const updated: TrainService = {
      id: train?.id || `train-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      trainNumber: train?.trainNumber || `${Math.floor(100 + Math.random() * 899)}`,
      type: currentTypeInfo,
      destination: {
        ja: destJa || (selectedDirection === 'down' ? '名古屋' : '豊橋'),
        en: destEn || (selectedDirection === 'down' ? 'Nagoya' : 'Toyohashi'),
      },
      stationNumber: stationNumber.trim() || undefined,
      hasAirportIcon,
      scheduledTime: time || '19:35',
      platform: platform || (selectedDirection === 'down' ? '4' : '1'),
      cars: Number(cars) || 6,
      carModel: carModel.trim() || undefined,
      seatReservation: finalSeatRes,
      specialCarNote: specialNote,
      delayMinutes: Number(delayMinutes) || 0,
      status: delayMinutes > 0 ? 'delayed' : status,
      isUserModified: true, // ユーザー手動編集フラグ（自動生成による上書き防止）
    };

    const saveFn = onSave || onSaveTrain;
    if (saveFn) {
      saveFn(updated, selectedDirection, placement);
    }
    onClose();
  };

  // General train types (user specified order)
  const generalTypes: TrainCategory[] = [
    'special_rapid',    // 特別快速（特快）: 赤地に黄色
    'rapid_ltd_exp',    // 快速特急（快特）: 白地に赤（甲特急相当）
    'ltd_exp',          // 特急: 赤地に白（乙特急相当）
    'rapid_express',    // 快速急行（快急）: 白地に青
    'express',          // 急行: 青地に白（快速相当）
    'semi_express',     // 準急: 緑地に白
    'sub_semi_express', // 区間準急（区準）: 白地に緑
    'local',            // 普通: 鼠色地に白
  ];

  // Named Types
  const namedTypes: TrainCategory[] = [
    'hinotori',         // ひのとり: 白地に赤（甲特急）
    'shimakaze',        // しまかぜ: 白地に水色（観光特急）
    'ise_shima_liner',  // 伊勢志摩ライナー: 白地に赤（乙特急）
    'urban_liner',      // アーバンライナー: 黒地に白（乙特急）
    'vistacar',         // ビスタカー: 白地にオレンジ（乙特急）
    'myu_sky',          // ミュースカイ: 白地に赤
    'panorama_super',   // パノラマSuper: 白地に赤
    'panorama_car',     // パノラマカー: 白地に赤
    'thunderbird',      // サンダーバード: 白地に赤
    'shinano',          // しなの: 白地にオレンジ
    'ace_upper',        // ACE
    'ace_lower',        // Ace
    'snack_car',        // スナックカー
    'sunny_car',        // サニーカー
  ];

  // フィルタ済み車両形式一覧
  const filteredVehicles = useMemo(() => {
    if (vehicleCategoryFilter === 'ALL') return VEHICLE_MODELS;
    return VEHICLE_MODELS.filter((v) => v.category === vehicleCategoryFilter);
  }, [vehicleCategoryFilter]);

  // 現在選択中の基準車両モデル
  const currentBaseVehicle = useMemo(() => {
    return VEHICLE_MODELS.find(
      (v) => carModel === v.model || carModel.startsWith(v.model + '+') || carModel.includes(v.model)
    );
  }, [carModel]);

  // 連結可能な車両候補（ユーザー指定厳格ルール：指定席同士、一般車同士、名鉄・近鉄・JR相互可能）
  const couplingCandidates = useMemo(() => {
    if (!currentBaseVehicle) return [];
    return getCoupledVehicles(currentBaseVehicle).filter(
      (v) => v.model !== currentBaseVehicle.model
    );
  }, [currentBaseVehicle]);

  const handleCouple = (partner: VehicleModelData) => {
    if (!currentBaseVehicle) return;
    const combinedModel = `${currentBaseVehicle.model}+${partner.model}`;
    setCarModel(combinedModel);
    const baseCars = currentBaseVehicle.cars[0] || 4;
    const partnerCars = partner.cars[0] || 2;
    setCars(baseCars + partnerCars);
  };

  const handleDecouple = () => {
    if (currentBaseVehicle) {
      setCarModel(currentBaseVehicle.model);
      setCars(currentBaseVehicle.cars[0] || 4);
    }
  };

  if (!isOpen) return null;

  // プレビュー用の停車駅案内
  const previewStops = getTrainStopsInfo(
    {
      id: 'preview',
      type: currentTypeInfo,
      destination: { ja: destJa, en: destEn },
      scheduledTime: time,
      platform,
      cars,
      carModel,
      seatReservation,
      delayMinutes,
      status,
    },
    '三河花園',
    selectedDirection
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f1422] border-2 border-blue-900/60 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#003882] to-[#004e9c] px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between border-b border-blue-950">
          <div className="flex items-center space-x-2.5">
            <Train className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center space-x-2">
                <span>{train ? '列車表示の編集' : '新規列車の登録'}</span>
                <span className="text-xs bg-amber-400 text-black px-2 py-0.5 rounded font-extrabold">
                  {selectedDirection === 'down' ? '下り（4〜8番線）' : '上り（1〜3番線）'}
                </span>
              </h2>
              <p className="text-xs text-blue-200">
                三河花園駅 • 名鉄・近鉄・JR準拠 フルカラーLCD発車標
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white bg-blue-950/60 hover:bg-blue-900 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-zinc-100 flex-1">
          {/* --- リアルタイムLCDプレビュー --- */}
          <div className="bg-[#050811] p-3 rounded-lg border border-zinc-800 shadow-inner">
            <div className="text-[11px] font-bold text-blue-300 mb-1 flex items-center justify-between">
              <span>🖥️ LCD表示プレビュー（1行分）</span>
              <span className="text-zinc-500">入力内容がリアルタイムに反映されます</span>
            </div>
            <div className="flex items-center justify-between bg-[#0c121d] px-3 py-2.5 rounded border border-zinc-700">
              {/* のりば */}
              <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center border border-zinc-300">
                <span className="text-2xl font-black text-black leading-none">{platform}</span>
              </div>

              {/* 種別 & 指定席車 */}
              <div className="flex items-center space-x-1.5 px-2">
                <div
                  className={`px-2.5 py-1 rounded text-sm font-extrabold shadow-sm ${currentTypeInfo.lcdStyle.bg} ${currentTypeInfo.lcdStyle.text} ${
                    currentTypeInfo.lcdStyle.border ? `border ${currentTypeInfo.lcdStyle.border}` : ''
                  }`}
                >
                  {currentTypeInfo.name.ja}
                </div>
                {seatReservation === 'partially_reserved' && (
                  <div className="bg-white border border-[#d60000] text-[#d60000] text-[9px] font-extrabold px-1 py-0.5 rounded text-center leading-tight">
                    <div>一部</div>
                    <div>指定席車</div>
                  </div>
                )}
                {seatReservation === 'all_reserved' && (
                  <div className="bg-[#d60000] border border-white text-white text-[9px] font-extrabold px-1 py-0.5 rounded text-center leading-tight">
                    <div>全車</div>
                    <div>指定席車</div>
                  </div>
                )}
              </div>

              {/* 行先 */}
              <div className="flex-1 px-3 flex items-center space-x-2">
                <span className="text-xl font-black tracking-wider text-white">
                  {destJa}
                </span>
                {hasAirportIcon && (
                  <span className="text-xs bg-sky-500 text-white px-1.5 py-0.5 rounded font-bold">
                    ✈
                  </span>
                )}
                {stationNumber && (
                  <span className="text-[10px] font-bold text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                    {stationNumber}
                  </span>
                )}
              </div>

              {/* 発車時刻 */}
              <div className="text-right px-2 font-mono">
                <div className="text-xl font-black text-white">{time}</div>
                <div className="text-[10px] text-zinc-400">{cars}両</div>
              </div>

              {/* 形式バッジ（右端） */}
              {carModel && (
                <div className="ml-2 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-600 text-xs font-bold text-amber-300">
                  {carModel}
                </div>
              )}
            </div>

            {/* 停車駅プレビュー */}
            <div className="mt-2 text-[11px] text-zinc-400 bg-black/40 p-2 rounded border border-zinc-800/80">
              <span className="text-amber-300 font-bold">【停車駅案内】</span>
              <span>三河花園からの停車駅：{previewStops.stopsJa.join('、')}</span>
              {previewStops.crossNoteJa && (
                <span className="text-cyan-300 ml-1 font-semibold">{previewStops.crossNoteJa}</span>
              )}
              <div className="text-zinc-500 text-[10px] mt-0.5">{previewStops.seatNoticeJa}</div>
            </div>
          </div>

          {/* 1. 方面切替 & ダイヤ配置 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0a0f1d] p-3 rounded-lg border border-zinc-800">
            <div>
              <label className="text-xs font-bold text-blue-200 block mb-1">
                ① 運行方面（上り / 下り）
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectionChange('down')}
                  className={`py-2 px-2 rounded-lg border font-bold text-xs flex items-center justify-center space-x-1 transition ${
                    selectedDirection === 'down'
                      ? 'bg-blue-600 border-blue-400 text-white shadow'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>下り (4〜8番線)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectionChange('up')}
                  className={`py-2 px-2 rounded-lg border font-bold text-xs flex items-center justify-center space-x-1 transition ${
                    selectedDirection === 'up'
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>上り (1〜3番線)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-blue-200 block mb-1">
                ② 表示位置（先発・次発・時刻順）
              </label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value as TrainPlacement)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="time_sort">🕒 発車時刻順に自動配置（推奨）</option>
                <option value="first">🥇 1段目（先発）に最優先表示</option>
                <option value="slot2">🥈 2段目（次発）に割り込み配置</option>
                <option value="slot3">🥉 3段目（次々発）に配置</option>
                <option value="last">🔻 最後尾に追加</option>
              </select>
            </div>
          </div>

          {/* 2. 種別選択 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-blue-200 flex items-center justify-between">
              <span>③ 列車種別（名鉄・近鉄・JR跨ぎ対応）</span>
              <span className="text-[11px] text-zinc-400">甲特急=快特、乙特急=特急、急行=快速</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {generalTypes.map((tCode) => {
                const info = TRAIN_TYPES[tCode];
                const isSelected = typeKey === tCode;
                return (
                  <button
                    key={tCode}
                    type="button"
                    onClick={() => setTypeKey(tCode)}
                    className={`py-1.5 px-1 rounded-lg border font-bold text-xs text-center transition-all ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-[1.02]'
                        : 'border-zinc-700 hover:border-zinc-500 opacity-90'
                    } ${info.lcdStyle.bg} ${info.lcdStyle.text}`}
                  >
                    <span>{info.name.ja}</span>
                  </button>
                );
              })}
            </div>
            {/* 特急愛称 */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 pt-1">
              {namedTypes.slice(0, 7).map((tCode) => {
                const info = TRAIN_TYPES[tCode];
                const isSelected = typeKey === tCode;
                return (
                  <button
                    key={tCode}
                    type="button"
                    onClick={() => setTypeKey(tCode)}
                    className={`py-1 px-1 rounded border text-[11px] font-bold text-center truncate ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/40 shadow'
                        : 'border-zinc-700 opacity-80 hover:opacity-100'
                    } ${info.lcdStyle.bg} ${info.lcdStyle.text}`}
                  >
                    {info.name.ja}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. 指定席車表記 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-blue-200">
              ④ 指定席車表記（全車指定席車、一部指定席車、なし（一般））
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSeatReservation('all_reserved')}
                className={`py-2 px-3 rounded-lg border-2 font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all ${
                  seatReservation === 'all_reserved'
                    ? 'bg-red-950 border-red-500 text-red-200 ring-2 ring-red-500/30'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <span>全車指定席車</span>
                {seatReservation === 'all_reserved' && <Check className="w-4 h-4 text-red-400" />}
              </button>

              <button
                type="button"
                onClick={() => setSeatReservation('partially_reserved')}
                className={`py-2 px-3 rounded-lg border-2 font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all ${
                  seatReservation === 'partially_reserved'
                    ? 'bg-amber-950 border-amber-500 text-amber-200 ring-2 ring-amber-500/30'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <span>一部指定席車</span>
                {seatReservation === 'partially_reserved' && <Check className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => setSeatReservation('none')}
                className={`py-2 px-3 rounded-lg border-2 font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all ${
                  seatReservation === 'none'
                    ? 'bg-blue-950 border-blue-500 text-blue-200 ring-2 ring-blue-500/30'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <span>なし（一般）</span>
                {seatReservation === 'none' && <Check className="w-4 h-4 text-blue-400" />}
              </button>
            </div>
          </div>

          {/* 4. 行先クイック選択（要件の追加行先を含む） */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-blue-200 flex items-center justify-between">
              <span>⑤ 行先クイック選択（近鉄・JR・豊田市・渥美線準拠）</span>
              <span className="text-[11px] text-amber-400 font-semibold">
                ※豊田市方面は1番線、豊田市発は6番線に自動連動
              </span>
            </label>

            {/* 下り方面候補 */}
            <div className="space-y-1">
              <div className="text-[11px] text-zinc-400 flex items-center space-x-2">
                <span className="text-blue-400 font-bold">
                  下り方面候補 (名古屋・犬山・岐阜・津・大阪・近鉄方面):
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectDest('名古屋', 'Nagoya', 'NH36')}
                  className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold border border-zinc-700"
                >
                  名古屋
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDest('岐阜', 'Gifu', 'NH60')}
                  className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold border border-zinc-700"
                >
                  岐阜
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDest('新鵜沼', 'Shin-Unuma', 'IY17')}
                  className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold border border-zinc-700"
                >
                  新鵜沼
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDest('犬山', 'Inuyama', 'IY15')}
                  className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold border border-zinc-700"
                >
                  犬山
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDest('中部国際空港', 'Centrair', 'TA24', true)}
                  className="px-2.5 py-1 text-xs rounded bg-sky-950 hover:bg-sky-900 text-sky-200 font-semibold border border-sky-800 flex items-center space-x-1"
                >
                  <span>✈ 中部国際空港</span>
                </button>
                {/* 豊田市方面から帰ってきた便（6番線発着） */}
                <button
                  type="button"
                  onClick={() => handleSelectDest('名古屋', 'Nagoya', 'NH36', false, '6')}
                  className="px-2.5 py-1 text-xs rounded bg-purple-950/80 hover:bg-purple-900 text-purple-200 font-semibold border border-purple-700"
                >
                  名古屋 (豊田市発・6番線)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDest('岐阜', 'Gifu', 'NH60', false, '6')}
                  className="px-2.5 py-1 text-xs rounded bg-purple-950/80 hover:bg-purple-900 text-purple-200 font-semibold border border-purple-700"
                >
                  岐阜 (豊田市発・6番線)
                </button>
              </div>

              {/* 近鉄直通便 */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-amber-300 font-bold self-center mr-1">近鉄直通:</span>
                <button
                  type="button"
                  onClick={() => handleSelectDest('大阪上本町', 'Osaka-Uehommachi', 'D03')}
                  className="px-2.5 py-1 text-xs rounded bg-red-950/80 hover:bg-red-900 text-red-200 font-semibold border border-red-700"
                >
                  大阪上本町 (ひのとり等)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDest('大阪（難波）', 'Osaka (Namba)', 'A01')}
                  className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold border border-zinc-700"
                >
                  大阪（難波）
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDest('賢島', 'Kashikojima', 'M93')}
                  className="px-2.5 py-1 text-xs rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-200 font-semibold border border-cyan-700"
                >
                  賢島 (しまかぜ等)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDest('鳥羽', 'Toba', 'M78')}
                  className="px-2.5 py-1 text-xs rounded bg-blue-950 hover:bg-blue-900 text-blue-200 font-semibold border border-blue-700"
                >
                  鳥羽
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDest('宇治山田', 'Uji-Yamada', 'M74')}
                  className="px-2.5 py-1 text-xs rounded bg-blue-950 hover:bg-blue-900 text-blue-200 font-semibold border border-blue-700"
                >
                  宇治山田
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDest('五十鈴川', 'Isuzugawa', 'M75')}
                  className="px-2.5 py-1 text-xs rounded bg-blue-950 hover:bg-blue-900 text-blue-200 font-semibold border border-blue-700"
                >
                  五十鈴川
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDest('津', 'Tsu', 'E39')}
                  className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold border border-zinc-700"
                >
                  津
                </button>
              </div>
            </div>

            {/* 上り方面候補 */}
            <div className="space-y-1 pt-1.5 border-t border-zinc-800">
              <div className="text-[11px] text-zinc-400 flex items-center space-x-2">
                <span className="text-emerald-400 font-bold">
                  上り方面候補 (豊橋・東岡崎・豊田市・中津川・松本・浜松・愛知大学前):
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {/* 豊田市方面（1番線発着） */}
                <button
                  type="button"
                  onClick={() => handleSelectDest('豊田市', 'Toyotashi', 'MY07', false, '1')}
                  className="px-2.5 py-1 text-xs rounded bg-amber-950 hover:bg-amber-900 text-amber-200 font-bold border border-amber-600 shadow-sm"
                >
                  豊田市 (1番線)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDest('中津川', 'Nakatsugawa', 'CF19', false, '1')}
                  className="px-2.5 py-1 text-xs rounded bg-amber-950 hover:bg-amber-900 text-amber-200 font-bold border border-amber-600 shadow-sm"
                >
                  中津川 (1番線)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDest('松本', 'Matsumoto', '36', false, '1')}
                  className="px-2.5 py-1 text-xs rounded bg-amber-950 hover:bg-amber-900 text-amber-200 font-bold border border-amber-600 shadow-sm"
                >
                  松本 (1番線)
                </button>
                {/* 渥美線シャトル（朝8:30〜9:10） */}
                <button
                  type="button"
                  onClick={() => handleSelectDest('愛知大学前', 'Aichi Univ.-mae', '18-04')}
                  className="px-2.5 py-1 text-xs rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-200 font-bold border border-emerald-600"
                >
                  愛知大学前 (朝渥美線シャトル)
                </button>
                {/* JR直通浜松 */}
                <button
                  type="button"
                  onClick={() => handleSelectDest('浜松', 'Hamamatsu', 'CA34')}
                  className="px-2.5 py-1 text-xs rounded bg-orange-950 hover:bg-orange-900 text-orange-200 font-semibold border border-orange-700"
                >
                  浜松 (特急は豊橋・浜松停車)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDest('豊橋', 'Toyohashi', 'NH01')}
                  className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold border border-zinc-700"
                >
                  豊橋
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDest('東岡崎', 'Higashi-Okazaki', 'NH13')}
                  className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold border border-zinc-700"
                >
                  東岡崎
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDest('豊川稲荷', 'Toyokawa-Inari', 'TK04')}
                  className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold border border-zinc-700"
                >
                  豊川稲荷
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDest('伊奈', 'Ina', 'NH02')}
                  className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold border border-zinc-700"
                >
                  伊奈
                </button>
              </div>
            </div>

            {/* Destination inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] text-zinc-400">日本語行先</span>
                <input
                  type="text"
                  value={destJa}
                  onChange={(e) => handleDestJaChange(e.target.value)}
                  placeholder="例: 名古屋、豊田市、大阪上本町、愛知大学前"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:border-blue-500 focus:outline-none mt-0.5"
                />
              </div>
              <div>
                <span className="text-[11px] text-zinc-400">英語行先 (ローマ字)</span>
                <input
                  type="text"
                  value={destEn}
                  onChange={(e) => setDestEn(e.target.value)}
                  placeholder="例: Nagoya, Toyotashi, Osaka-Uehommachi"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none mt-0.5 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 5. のりば選択 (2階: 1〜8番線 / 4階: 9〜16番線) */}
          <div className="space-y-2 bg-[#0d1322] p-3 rounded-lg border border-blue-900/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-blue-200">
                ⑥ 発車のりば（2階 1〜8番線 / 4階 9〜16番線）
              </label>
              <span className="text-[11px] text-amber-300 font-bold">
                ★ 9番線: 豊田市/松本/中津川行 | 14番線: 豊田市/松本/中津川発
              </span>
            </div>

            {/* 2階ホーム */}
            <div>
              <div className="text-[11px] text-zinc-400 font-semibold mb-1 flex items-center justify-between">
                <span>【2階ホーム】上り（1〜4番線） / 下り（5〜8番線）</span>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {['1', '2', '3', '4', '5', '6', '7', '8'].map((p) => {
                  const isSelected = platform === p;
                  const isUp = ['1', '2', '3', '4'].includes(p);
                  const isCurrentDirPlatform = selectedDirection === 'down' ? !isUp : isUp;

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`py-1.5 rounded-lg border font-black text-sm flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-white text-black border-amber-400 shadow-md ring-2 ring-amber-400/50 scale-105'
                          : isCurrentDirPlatform
                          ? isUp
                            ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200 hover:border-emerald-400'
                            : 'bg-blue-950/60 border-blue-600 text-blue-200 hover:border-blue-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <span>{p}</span>
                      <span className="text-[8px] font-normal opacity-80">
                        {isUp ? '上り' : '下り'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4階ホーム */}
            <div className="pt-1.5 border-t border-zinc-800">
              <div className="text-[11px] text-zinc-400 font-semibold mb-1 flex items-center justify-between">
                <span>【4階ホーム】上り（9〜11番線） / 下り（12〜16番線）</span>
                <span className="text-[10px] text-zinc-500">15/16: 始発・折返</span>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {[
                  { num: '9', label: '豊田/松本/中津', role: 'up' },
                  { num: '10', label: '上り全指', role: 'up' },
                  { num: '11', label: '上り一般', role: 'up' },
                  { num: '12', label: '下り一般', role: 'down' },
                  { num: '13', label: '下り全指', role: 'down' },
                  { num: '14', label: '豊田/松本発', role: 'down' },
                  { num: '15', label: '始発/折返', role: 'down' },
                  { num: '16', label: '始発/折返', role: 'down' },
                ].map((item) => {
                  const isSelected = platform === item.num;
                  const isSpecial = item.num === '9' || item.num === '14';

                  return (
                    <button
                      key={item.num}
                      type="button"
                      onClick={() => setPlatform(item.num)}
                      className={`py-1.5 px-0.5 rounded-lg border font-black text-sm flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-black border-white shadow-md ring-2 ring-white/60 scale-105'
                          : isSpecial
                          ? 'bg-purple-950/70 border-purple-600 text-purple-200 hover:border-purple-400'
                          : item.role === 'up'
                          ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200 hover:border-emerald-400'
                          : 'bg-blue-950/60 border-blue-600 text-blue-200 hover:border-blue-400'
                      }`}
                    >
                      <span>{item.num}</span>
                      <span className="text-[8px] font-normal leading-tight text-center truncate max-w-full">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 6. 発車時刻 & 両数 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 時刻 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-blue-200 flex items-center justify-between">
                <span>⑦ 発車時刻 (HH:MM)</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono font-bold text-lg focus:border-blue-500 focus:outline-none flex-1"
                />
                <button
                  type="button"
                  onClick={handleSetCurrentTime}
                  className="px-2.5 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-semibold border border-zinc-700"
                >
                  現在時刻
                </button>
                <button
                  type="button"
                  onClick={() => handleAddMinutes(5)}
                  className="px-2.5 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-semibold border border-zinc-700"
                >
                  +5分
                </button>
              </div>
            </div>

            {/* 両数 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-blue-200">
                ⑧ 両数
              </label>
              <div className="flex items-center space-x-2">
                {[2, 3, 4, 6, 8, 10, 12].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCars(c)}
                    className={`flex-1 py-2 rounded-lg border font-bold text-xs sm:text-sm transition-all ${
                      cars === c
                        ? 'bg-blue-600 border-blue-400 text-white shadow'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    {c}両
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 7. 車両形式（準拠ファイルテーブル対応カタログ） */}
          <div className="space-y-2 bg-[#0a0f1d] p-3 rounded-lg border border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-blue-200 flex items-center space-x-2">
                <span>⑨ 車両形式（準拠車両リストから選択）</span>
              </label>
              <span className="text-[10px] text-zinc-400">クリックで両数・指定席も自動入力</span>
            </div>

            {/* カテゴリフィルタータブ */}
            <div className="flex flex-wrap gap-1">
              {['ALL', '名鉄', '近鉄', 'JR', '寺鉄', '東急', '豊橋鉄道'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setVehicleCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                    vehicleCategoryFilter === cat
                      ? 'bg-amber-400 text-black shadow'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? 'すべて' : cat}
                </button>
              ))}
            </div>

            {/* 車両リスト一覧 */}
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-black/30 rounded border border-zinc-800">
              {filteredVehicles.map((v) => {
                const isSelected = carModel === v.model;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSelectVehicleModel(v)}
                    className={`px-2 py-1 rounded text-xs font-semibold border transition flex items-center space-x-1 ${
                      isSelected
                        ? 'bg-blue-600 border-blue-400 text-white shadow ring-2 ring-blue-400/40'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-[10px] text-zinc-400 font-normal">[{v.category}]</span>
                    <span>{v.model}</span>
                    {v.nickname && (
                      <span className="text-[10px] text-amber-300 font-normal">({v.nickname})</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                placeholder="直接入力可能（例: 2200系、80000系、しまかぜ）"
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setCarModel('')}
                className="px-2.5 py-1.5 rounded text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700"
              >
                クリア
              </button>
            </div>

            {/* 連結・増結（ユーザー指定厳格ルール連動） */}
            {currentBaseVehicle && (
              <div className="mt-2 pt-2 border-t border-zinc-800/80 bg-black/40 p-2.5 rounded-lg">
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-amber-300">
                      🔗 連結・増結（単独・増結切替）
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      現在の編成: <span className="text-white font-bold">{carModel}</span>（{cars}両）
                    </span>
                  </div>
                  {carModel.includes('+') && (
                    <button
                      type="button"
                      onClick={handleDecouple}
                      className="px-2 py-0.5 text-[10px] rounded bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 transition font-bold"
                    >
                      単独運転に戻す（解結）
                    </button>
                  )}
                </div>

                <div className="text-[10px] text-zinc-400 mb-1.5">
                  {currentBaseVehicle.seatType === 'all_reserved' ? (
                    <span className="text-cyan-300">
                      ★ 全席指定車：全席指定車同士のみ連結可能（一般車との連結不可・名鉄/近鉄/JR相互可能）
                    </span>
                  ) : currentBaseVehicle.seatType === 'none' ? (
                    <span className="text-emerald-300">
                      ★ 一般車：一般車同士のみ連結可能（指定席車との連結不可・名鉄/近鉄/JR相互可能）
                    </span>
                  ) : (
                    <span className="text-amber-300">
                      ★ 一部指定席車：一般車との増結に対応（名鉄/近鉄相互可能）
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {couplingCandidates.slice(0, 18).map((partner) => (
                    <button
                      key={partner.id}
                      type="button"
                      onClick={() => handleCouple(partner)}
                      className="px-2 py-1 text-[11px] rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 flex items-center space-x-1 transition"
                      title={`${partner.category} ${partner.model} (${partner.cars?.[0] || 2}両増結)`}
                    >
                      <span className="text-[9px] text-zinc-400">[{partner.category}]</span>
                      <span className="font-semibold">{partner.model}</span>
                      <span className="text-[9px] text-amber-300">+{partner.cars?.[0] || 2}両</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 8. 運行状況・接近点滅・遅延設定 */}
          <div className="space-y-3 bg-[#13111f] p-3 rounded-lg border border-amber-500/30">
            <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
              <span>⑩ 運行状態 & 演出アニメーション（接近中・遅延）</span>
              <span className="text-[11px] text-zinc-400">LCD表示器にリアルタイム反映</span>
            </label>

            {/* 状態選択ボタン */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setStatus('on_time');
                  setDelayMinutes(0);
                }}
                className={`py-2 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center space-x-1 ${
                  status === 'on_time' && delayMinutes === 0
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                }`}
              >
                <span>定刻 (通常)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('approaching')}
                className={`py-2 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center space-x-1 ${
                  status === 'approaching'
                    ? 'bg-amber-500 border-amber-300 text-black font-black shadow ring-2 ring-amber-400/50'
                    : 'bg-zinc-900 border-zinc-700 text-amber-400 hover:text-amber-300'
                }`}
              >
                <span>🟡 電車がまいります</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('boarding')}
                className={`py-2 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center space-x-1 ${
                  status === 'boarding'
                    ? 'bg-blue-600 border-blue-400 text-white font-black shadow'
                    : 'bg-zinc-900 border-zinc-700 text-blue-400 hover:text-blue-300'
                }`}
              >
                <span>🔵 ご乗車中</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('delayed');
                  if (delayMinutes === 0) setDelayMinutes(5);
                }}
                className={`py-2 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center space-x-1 ${
                  status === 'delayed' || delayMinutes > 0
                    ? 'bg-red-600 border-red-400 text-white font-black shadow'
                    : 'bg-zinc-900 border-zinc-700 text-red-400 hover:text-red-300'
                }`}
              >
                <span>🔴 遅れ表示</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#0b101c] px-4 py-3 sm:px-6 sm:py-3.5 border-t border-blue-950/80 flex items-center justify-between">
          <div>
            {train && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('この列車をダイヤから削除してもよろしいですか？')) {
                    onDelete(train.id);
                    onClose();
                  }
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-950/50 px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>削除</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm shadow-lg hover:shadow-amber-400/20 transition transform active:scale-95 flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{train ? '変更を反映' : 'ダイヤに追加'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

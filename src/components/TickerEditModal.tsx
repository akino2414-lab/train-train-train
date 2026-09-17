import React, { useState, useEffect } from 'react';
import { LanguageText, TrainService } from '../types';
import { X, Check, RefreshCw, Train } from 'lucide-react';
import { generateCombinedTickerAnnouncement } from '../utils/stationStops';

interface TickerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAnnouncement: LanguageText;
  downTrains?: TrainService[];
  upTrains?: TrainService[];
  onSave: (newAnnouncement: LanguageText) => void;
}

export const TickerEditModal: React.FC<TickerEditModalProps> = ({
  isOpen,
  onClose,
  currentAnnouncement,
  downTrains = [],
  upTrains = [],
  onSave,
}) => {
  const [textJa, setTextJa] = useState('');
  const [textEn, setTextEn] = useState('');

  // 停車駅自動生成テキスト
  const generatedStops = React.useMemo(() => {
    return generateCombinedTickerAnnouncement(downTrains, upTrains);
  }, [downTrains, upTrains]);

  useEffect(() => {
    if (isOpen) {
      setTextJa(currentAnnouncement?.ja || generatedStops.ja);
      setTextEn(currentAnnouncement?.en || generatedStops.en);
    }
  }, [isOpen, currentAnnouncement, generatedStops]);

  if (!isOpen) return null;

  const presets = [
    {
      label: '【途中の停車駅案内（上り下りまとめ）】名鉄/近鉄/JR正規準拠',
      description: '特別快速(岐阜・新鵜沼)＋普通/準急/急行(正規準拠)＋特急なし(一般)のみ鳴海・伊奈特別停車',
      ja: generatedStops.ja,
      en: generatedStops.en,
      isSpecialStops: true,
    },
    {
      label: '広報誌「Wind」配布中（写真の文面再現）',
      description: '三河花園駅の実写と同じ案内文面',
      ja: '名鉄主要駅にて広報誌「Wind」を配布中です。9月号の特集は『三河の伝統と名産』。SNSでも最新情報を発信しております。',
      en: 'Free magazine "Wind" is now available at major Meitetsu stations.',
    },
    {
      label: '指定席案内・降車時注意（ホームと電車の隙間）',
      description: '特別車両券・指定席の乗車案内',
      ja: '電車からお降りの際はホームと電車の間にご注意ください。指定席車ご利用の際は乗車券のほかに指定席券（特別車両券）が必要です。',
      en: 'Please watch your step when stepping off the train. Reserved car ticket is required in addition to basic fare.',
    },
    {
      label: '黄色い点字ブロックの内側へ',
      description: 'ホーム安全案内',
      ja: '本日も三河花園駅をご利用いただきありがとうございます。足元の黄色い点字ブロックの内側までお下がりください。',
      en: 'Thank you for using Mikawa-Hanazono Station. Please wait behind the yellow tactile line.',
    },
    {
      label: '平常運行案内',
      description: '通常運行時メッセージ',
      ja: '列車は平常どおり運行しております。マナー向上へのご協力をよろしくお願いいたします。',
      en: 'All trains are running on schedule. Thank you for your cooperation.',
    },
    {
      label: '列車遅延案内',
      description: '遅延発生時のアナウンス',
      ja: 'ただいま一部列車に遅れが発生しております。お急ぎのところご迷惑をおかけして大変申し訳ございません。',
      en: 'Some trains are currently experiencing delays. We apologize for the inconvenience.',
    },
  ];

  const handleApplyAutoStops = () => {
    setTextJa(generatedStops.ja);
    setTextEn(generatedStops.en);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ja: textJa,
      en: textEn,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0f1422] border-2 border-blue-900/60 rounded-2xl max-w-2xl w-full p-5 shadow-2xl text-zinc-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">最下段スクロール案内表示器の編集</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
          {/* 停車駅一括生成ボタン */}
          <div className="bg-gradient-to-r from-yellow-950/40 via-amber-950/30 to-blue-950/40 border border-yellow-600/50 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 flex-shrink-0">
                <Train className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-yellow-300">
                  ダイヤ連動・途中の停車駅案内（上り下りまとめ）
                </h4>
                <p className="text-[11px] text-zinc-300">
                  特別快速・普通・準急・区間準急・急行（正規準拠）＋特急なし(一般)のみ鳴海・伊奈停車
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleApplyAutoStops}
              className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-lg flex items-center space-x-1 flex-shrink-0 shadow transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>最新停車駅をセット</span>
            </button>
          </div>

          <div>
            <label className="text-xs text-yellow-300 block mb-1.5 font-bold">
              定型アナウンス / 停車駅プリセットから選ぶ
            </label>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setTextJa(p.ja);
                    setTextEn(p.en);
                  }}
                  className={`p-2.5 rounded-xl text-xs text-left border transition ${
                    textJa === p.ja
                      ? 'bg-yellow-950/70 text-yellow-300 font-bold border-yellow-500 shadow-md'
                      : 'bg-zinc-900/90 text-zinc-300 border-zinc-700/80 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-yellow-400 flex items-center space-x-1.5">
                      {p.isSpecialStops && <span className="text-sm">⚡</span>}
                      <span>{p.label}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{p.description}</div>
                  <div className="text-[11px] text-zinc-300 mt-1 line-clamp-2">{p.ja}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-zinc-300 font-bold">
                テロップ表示メッセージ（黄色文字でスクロール）
              </label>
              <span className="text-[10px] text-yellow-400 font-mono">
                {textJa.length} 文字
              </span>
            </div>
            <textarea
              rows={4}
              value={textJa}
              onChange={(e) => setTextJa(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-yellow-300 font-bold text-xs sm:text-sm focus:border-yellow-500 focus:outline-none leading-relaxed"
              required
            />
          </div>

          <div>
            <label className="text-xs text-zinc-300 block mb-1 font-bold">
              英語メッセージ (English)
            </label>
            <textarea
              rows={3}
              value={textEn}
              onChange={(e) => setTextEn(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 text-xs focus:border-yellow-500 focus:outline-none leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs rounded-lg text-zinc-400 hover:text-white"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg flex items-center space-x-1 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>この内容で案内表示器に反映する</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


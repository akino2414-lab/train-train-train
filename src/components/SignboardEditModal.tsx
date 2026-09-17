import React, { useState, useEffect } from 'react';
import { LanguageText } from '../types';
import { X, Check } from 'lucide-react';

interface SignboardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  direction: LanguageText;
  onSave: (newDirection: LanguageText) => void;
}

export const SignboardEditModal: React.FC<SignboardEditModalProps> = ({
  isOpen,
  onClose,
  direction,
  onSave,
}) => {
  const [ja, setJa] = useState(direction?.ja || '名古屋・犬山・岐阜・津・大阪 方面');
  const [en, setEn] = useState(direction?.en || 'for Nagoya, Inuyama, Gifu, Tsu, Osaka');

  useEffect(() => {
    if (direction) {
      setJa(direction.ja);
      setEn(direction.en);
    }
  }, [direction]);

  if (!isOpen) return null;

  const presets = [
    { ja: '名古屋・犬山・岐阜・津・大阪 方面', en: 'for Nagoya, Inuyama, Gifu, Tsu, Osaka' },
    { ja: '豊橋・東岡崎・豊田市・浜松 方面', en: 'for Toyohashi, Higashi-Okazaki, Toyota-shi, Hamamatsu' },
    { ja: '✈中部国際空港・河和 方面', en: 'for Centrair & Kowa' },
    { ja: '知立・豊橋 方面', en: 'for Chiryu & Toyohashi' },
    { ja: '名鉄一宮・名鉄岐阜 方面', en: 'for Meitetsu-Ichinomiya & Meitetsu-Gifu' },
    { ja: '犬山・新鵜沼 方面', en: 'for Inuyama & Shin-Unuma' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ja,
      en,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0f1422] border-2 border-blue-900/60 rounded-2xl max-w-md w-full p-5 shadow-2xl text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
          <h3 className="text-base font-bold text-white">上部方面サインの編集</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-blue-300 block mb-1.5 font-bold">
              プリセットから選ぶ
            </label>
            <div className="flex flex-col gap-1.5 mb-3">
              {presets.map((p) => (
                <button
                  key={p.ja}
                  type="button"
                  onClick={() => {
                    setJa(p.ja);
                    setEn(p.en);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs text-left border transition ${
                    ja === p.ja
                      ? 'bg-blue-600 text-white font-bold border-blue-400'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  <div className="font-bold">{p.ja}</div>
                  <div className="text-[10px] text-zinc-400">{p.en}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-300 block mb-1 font-bold">
              日本語方面名
            </label>
            <input
              type="text"
              value={ja}
              onChange={(e) => setJa(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white font-bold"
              required
            />
          </div>

          <div>
            <label className="text-xs text-zinc-300 block mb-1 font-bold">
              英語表記 (English)
            </label>
            <input
              type="text"
              value={en}
              onChange={(e) => setEn(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200"
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
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center space-x-1"
            >
              <Check className="w-4 h-4" />
              <span>保存する</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

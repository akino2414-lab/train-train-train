import type { TrainService } from '../types';

/**
 * 発車メロディ & 接近放送チャイム音響エンジン (Web Audio API)
 * 
 * ユーザー要件：
 * 「近鉄線の方に行くものと名鉄線に行くものとJR線に行くものは発車メロディはそれぞれ変えてください」
 * 
 * 1. 名鉄線系統: 名鉄特有のミュージックホーン・出発ベル・チャイム
 * 2. 近鉄線系統: 近鉄特急ひのとり・しまかぜ・名阪特急発車メロディモチーフ
 * 3. JR線系統: JR東海・東海道線せせらぎ/新幹線・在来線発車メロディ
 */

class StationAudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public resumeContext() {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  /**
   * 駅自動放送アナウンス (Web Speech API)
   */
  public speakAnnouncement(text: string, lang: 'ja' | 'en' = 'ja') {
    if (this.isMuted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // 前のアナウンスを停止
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ja' ? 'ja-JP' : 'en-US';
      utterance.rate = lang === 'ja' ? 0.95 : 0.9; // 落ち着いた駅アナウンス速度
      utterance.pitch = 1.0;
      utterance.volume = 0.9;

      // 日本語の自然な音声を選択（あれば）
      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find((v) =>
        lang === 'ja' ? v.lang.startsWith('ja') : v.lang.startsWith('en')
      );
      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  }

  /**
   * 接近チャイム + 駅自動肉声案内
   */
  public announceApproach(train: TrainService, trackNumber: string, stopsText?: string) {
    this.playApproachChime();
    const typeName = train.type?.name?.ja || '';
    const dest = train.destination?.ja?.replace(/\s+/g, '') || '';
    const time = train.scheduledTime || '';
    const cars = train.cars ? `${train.cars}両編成` : '';
    const stopsNotice = stopsText ? `。停車駅は、${stopsText}です` : '';

    const text = `まもなく、${trackNumber}番線に、${time}発、${typeName}、${dest}ゆきがまいります。黄色い点字ブロックの内側までお下がりください。${cars}${stopsNotice}。`;
    
    // チャイム鳴動後に発声
    setTimeout(() => {
      this.speakAnnouncement(text, 'ja');
    }, 900);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      if (this.ctx) this.ctx.suspend().catch(() => {});
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }

  public setEnabled(enabled: boolean) {
    this.setMuted(!enabled);
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * 接近チャイム（名鉄標準 4音上昇チャイム）
   */
  public playApproachChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);

      gain.gain.setValueAtTime(0, now + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 0.85);
    });
  }

  /**
   * 【名鉄線方面発車メロディ】
   * 名鉄伝統のミュージックホーンモチーフ（ド・ミ・レ・ソ・ファ・ラ・シ・ド）
   */
  public playMeitetsuMelody() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // ミュージックホーン音階 (C5, E5, D5, G5, F5, A5, B5, C6)
    const notes = [
      { f: 523.25, d: 0.22, t: 0.0 },   // C5
      { f: 659.25, d: 0.22, t: 0.22 },  // E5
      { f: 587.33, d: 0.22, t: 0.44 },  // D5
      { f: 783.99, d: 0.26, t: 0.66 },  // G5
      { f: 698.46, d: 0.22, t: 0.95 },  // F5
      { f: 880.00, d: 0.22, t: 1.17 },  // A5
      { f: 987.77, d: 0.26, t: 1.39 },  // B5
      { f: 1046.5, d: 0.70, t: 1.68 },  // C6
    ];

    notes.forEach((item) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // パノラマカーのホーン特有の丸みとブラス感
      osc.frequency.setValueAtTime(item.f, now + item.t);

      gain.gain.setValueAtTime(0, now + item.t);
      gain.gain.linearRampToValueAtTime(0.28, now + item.t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + item.t + item.d + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + item.t);
      osc.stop(now + item.t + item.d + 0.25);
    });
  }

  /**
   * 【近鉄線方面発車メロディ】
   * 近鉄特急（ひのとり・しまかぜ・ドナウ川のさざ波/クラシック調メロディ）
   */
  public playKintetsuMelody() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // 上品で流麗なアコースティック・ベル調（D大調アルペジオ）
    const notes = [
      { f: 587.33, d: 0.28, t: 0.0 },   // D5
      { f: 739.99, d: 0.28, t: 0.28 },  // F#5
      { f: 880.00, d: 0.28, t: 0.56 },  // A5
      { f: 1174.66, d: 0.40, t: 0.84 }, // D6
      { f: 987.77, d: 0.28, t: 1.25 },  // B5
      { f: 880.00, d: 0.28, t: 1.53 },  // A5
      { f: 739.99, d: 0.35, t: 1.81 },  // F#5
      { f: 880.00, d: 0.80, t: 2.18 },  // A5
    ];

    notes.forEach((item) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(item.f, now + item.t);
      osc2.frequency.setValueAtTime(item.f * 2, now + item.t); // 倍音

      gain.gain.setValueAtTime(0, now + item.t);
      gain.gain.linearRampToValueAtTime(0.24, now + item.t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + item.t + item.d + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now + item.t);
      osc2.start(now + item.t);
      osc1.stop(now + item.t + item.d + 0.4);
      osc2.stop(now + item.t + item.d + 0.4);
    });
  }

  /**
   * 【JR線方面発車メロディ】
   * JR東海・東海道線（せせらぎ／春／ベル系リフレイン）
   */
  public playJRMelody() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { f: 659.25, d: 0.24, t: 0.0 },   // E5
      { f: 783.99, d: 0.24, t: 0.24 },  // G5
      { f: 880.00, d: 0.24, t: 0.48 },  // A5
      { f: 987.77, d: 0.38, t: 0.72 },  // B5
      { f: 880.00, d: 0.24, t: 1.15 },  // A5
      { f: 783.99, d: 0.24, t: 1.40 },  // G5
      { f: 659.25, d: 0.40, t: 1.65 },  // E5
      { f: 587.33, d: 0.24, t: 2.10 },  // D5
      { f: 659.25, d: 0.85, t: 2.36 },  // E5
    ];

    notes.forEach((item) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, now + item.t);

      gain.gain.setValueAtTime(0, now + item.t);
      gain.gain.linearRampToValueAtTime(0.22, now + item.t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + item.t + item.d + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + item.t);
      osc.stop(now + item.t + item.d + 0.35);
    });
  }

  /**
   * 列車系統に応じた発車メロディを自動再生
   */
  public playDepartureMelodyByRoute(destinationJa: string, typeCode: string) {
    const d = destinationJa || '';
    // 1. 近鉄線系統（津、大阪上本町、鳥羽、賢島、宇治山田、五十鈴川、名張、青山町、河内国分等）
    if (
      d.includes('津') ||
      d.includes('大阪') ||
      d.includes('鳥羽') ||
      d.includes('賢島') ||
      d.includes('宇治山田') ||
      d.includes('五十鈴川') ||
      d.includes('名張') ||
      d.includes('青山町') ||
      d.includes('河内国分') ||
      typeCode === 'hinotori' ||
      typeCode === 'shimakaze' ||
      typeCode === 'ise_shima_liner'
    ) {
      this.playKintetsuMelody();
      return 'kintetsu';
    }

    // 2. JR線系統（浜松、松本、中津川、特急しなの、サンダーバード）
    if (
      d.includes('浜松') ||
      d.includes('松本') ||
      d.includes('中津川') ||
      typeCode === 'shinano' ||
      typeCode === 'thunderbird'
    ) {
      this.playJRMelody();
      return 'jr';
    }

    // 3. 名鉄線系統（豊橋、名古屋、岐阜、犬山、新鵜沼、中部国際空港、河和、一宮、岩倉、金山、豊田市等）
    this.playMeitetsuMelody();
    return 'meitetsu';
  }

  /**
   * 汎用フォールバック
   */
  public playDepartureMelody() {
    this.playMeitetsuMelody();
  }

  /**
   * ドア閉扉ブザー
   */
  public playDoorChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const beeps = [0.0, 0.25];

    beeps.forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now + t); // A5
      gain.gain.setValueAtTime(0, now + t);
      gain.gain.linearRampToValueAtTime(0.2, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.2);
    });
  }
}

export const stationAudio = new StationAudioManager();

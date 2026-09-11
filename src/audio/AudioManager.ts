// Procedural Web Audio SFX — no audio assets needed for the slice.
// All sounds are synthesized (noise buffers + oscillator envelopes) with
// slight randomized pitch on every play. Lazy AudioContext creation on the
// first user gesture; every method is a safe no-op when audio is unavailable
// (SSR, tests, autoplay-blocked browsers).

export type SoundName = 'fire' | 'metal' | 'glass' | 'clay' | 'dirt' | 'score' | 'round';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;
  get isMuted(): boolean {
    return this.muted;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  /** Must be called from a user gesture at least once. Safe to call often. */
  unlock(): void {
    try {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') void this.ctx.resume();
        return;
      }
      const Ctor: typeof AudioContext | undefined =
        typeof window !== 'undefined'
          ? (window.AudioContext ??
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
          : undefined;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      // Cheap "distant range" echo: a short feedback delay on the master bus
      // so shots and pings carry a hint of outdoor slap-back.
      const delay = this.ctx.createDelay(0.5);
      delay.delayTime.value = 0.16;
      const feedback = this.ctx.createGain();
      feedback.gain.value = 0.25;
      const wet = this.ctx.createGain();
      wet.gain.value = 0.18;
      this.master.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);
      wet.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
      this.master = null;
    }
  }

  play(name: SoundName): void {
    if (this.muted) return;
    try {
      this.unlock();
      if (!this.ctx || !this.master) return;
      const t = this.ctx.currentTime;
      switch (name) {
        case 'fire':
          this.noiseBurst(t, 0.14, 900 * this.jitter(), 0.9);
          this.tone(t, 130 * this.jitter(), 45, 0.18, 'sine', 0.8);
          break;
        case 'metal':
          this.ping(t, 1750 * this.jitter(), 0.45, 0.5);
          this.ping(t, 2630 * this.jitter(), 0.3, 0.25);
          break;
        case 'glass':
          this.noiseBurst(t, 0.2, 5200, 0.5, 'highpass');
          this.ping(t, 3200 * this.jitter(), 0.18, 0.3);
          this.ping(t + 0.03, 4100 * this.jitter(), 0.15, 0.25);
          break;
        case 'clay':
          this.noiseBurst(t, 0.16, 2400, 0.6);
          this.ping(t, 900 * this.jitter(), 0.2, 0.4);
          break;
        case 'dirt':
          // Jittered low thump so repeated misses don't sound identical.
          this.noiseBurst(t, 0.16 * (0.9 + Math.random() * 0.2), 420 * this.jitter(), 0.45);
          break;
        case 'score':
          this.tone(t, 880 * this.jitter(), 1320, 0.09, 'square', 0.18);
          break;
        case 'round':
          this.tone(t, 660 * this.jitter(), 660, 0.12, 'square', 0.2);
          this.tone(t + 0.14, 990 * this.jitter(), 990, 0.2, 'square', 0.2);
          break;
      }
    } catch {
      // Audio must never break gameplay.
    }
  }

  private jitter(): number {
    return 1 + (Math.random() - 0.5) * 0.12;
  }

  private tone(
    when: number,
    fromHz: number,
    toHz: number,
    seconds: number,
    type: OscillatorType,
    gain: number,
  ): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, fromHz), when);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, toHz), when + seconds);
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + seconds);
    osc.connect(g).connect(this.master!);
    osc.start(when);
    osc.stop(when + seconds + 0.02);
  }

  private ping(when: number, hz: number, seconds: number, gain: number): void {
    this.tone(when, hz, hz * 0.985, seconds, 'triangle', gain);
  }

  private noiseBurst(
    when: number,
    seconds: number,
    filterHz: number,
    gain: number,
    filterType: BiquadFilterType = 'lowpass',
  ): void {
    const ctx = this.ctx!;
    const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterHz;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + seconds);
    src.connect(filter).connect(g).connect(this.master!);
    src.start(when);
  }
}

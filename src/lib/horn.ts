"use client";

// Deep vessel horn synthesized with Web Audio — no audio file needed.
// Pattern: short blast (DIT) + pause + long blast (DIIIIIT).
// Must be called from a user gesture (button click) so the browser allows sound.
export function playShipHorn() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();

    function blast(startAt: number, duration: number) {
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, startAt);
      master.gain.exponentialRampToValueAtTime(0.6, startAt + 0.08);
      master.gain.setValueAtTime(0.6, startAt + Math.max(0.08, duration - 0.35));
      master.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 300;
      filter.connect(master);
      master.connect(ctx.destination);
      // Deep horn chord: root + octave pair, slightly detuned
      const freqs = [55, 73.4, 110, 146.8];
      for (const f of freqs) {
        for (const detune of [-5, 4]) {
          const osc = ctx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.value = f;
          osc.detune.value = detune;
          const g = ctx.createGain();
          g.gain.value = 0.14;
          osc.connect(g);
          g.connect(filter);
          osc.start(startAt);
          osc.stop(startAt + duration + 0.1);
        }
      }
    }

    const t = ctx.currentTime + 0.05;
    blast(t, 0.55);        // DIT (short)
    blast(t + 0.95, 2.6);  // DIIIIIT (long)
    setTimeout(() => ctx.close().catch(() => {}), 4500);
  } catch {
    // sound unavailable — stay silent
  }
}

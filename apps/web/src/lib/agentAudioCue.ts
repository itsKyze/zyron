// FILE: agentAudioCue.ts
// Purpose: Synthesized audio alerts for agent completion and input requests.
// Layer: Web UI audio helper

let audioContextInstance: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContextInstance) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioContextInstance = new AudioCtx();
    }
  }
  if (audioContextInstance && audioContextInstance.state === "suspended") {
    void audioContextInstance.resume();
  }
  return audioContextInstance;
}

/**
 * Play a calm, melodic chime when a background task or agent finishes.
 */
export function playAgentCompletionChime(volumePercent: number = 100): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    const volume = Math.max(0, Math.min(1, volumePercent / 100)) * 0.12;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    gain.connect(ctx.destination);

    // Note 1: E5
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.connect(gain);
    osc1.start(now);
    osc1.stop(now + 0.28);

    // Note 2: B5
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(987.77, now + 0.12);
    osc2.connect(gain);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch {
    // Audio context may be unavailable or blocked by browser policy
  }
}

/**
 * Play a gentle double-pulse chime when user input or approval is needed.
 */
export function playAgentAttentionChime(volumePercent: number = 100): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    const volume = Math.max(0, Math.min(1, volumePercent / 100)) * 0.12;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    gain.connect(ctx.destination);

    // Note: A5
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.45);
  } catch {
    // Audio context may be unavailable or blocked by browser policy
  }
}

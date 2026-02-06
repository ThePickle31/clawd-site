"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

// ============================================================================
// Ocean Sounds Context
// ============================================================================

interface OceanSoundsContextValue {
  isPlaying: boolean;
  volume: number;
  toggle: () => void;
  setVolume: (v: number) => void;
}

const OceanSoundsContext = createContext<OceanSoundsContextValue>({
  isPlaying: false,
  volume: 0.3,
  toggle: () => {},
  setVolume: () => {},
});

export function useOceanSounds() {
  return useContext(OceanSoundsContext);
}

// ============================================================================
// Procedural Ocean Audio Generator
// Uses Web Audio API to create realistic ocean ambiance with layered noise
// ============================================================================

class OceanAudioGenerator {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private nodes: AudioNode[] = [];
  private isRunning = false;

  async initialize(): Promise<void> {
    if (this.audioContext) return;

    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.audioContext.destination);
  }

  async start(volume: number): Promise<void> {
    if (this.isRunning) return;

    await this.initialize();
    if (!this.audioContext || !this.masterGain) return;

    // Resume context if suspended (browser autoplay policy)
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    this.isRunning = true;

    // Create layered ocean sounds
    this.createWaveLayer(0.6, 0.08, 0.15);  // Deep rumble
    this.createWaveLayer(1.2, 0.12, 0.25);  // Mid waves
    this.createWaveLayer(2.5, 0.05, 0.35);  // High wash
    this.createFoamLayer();                  // Foam/bubbles

    // Fade in
    this.masterGain.gain.setTargetAtTime(
      volume,
      this.audioContext.currentTime,
      1.5 // 1.5 second fade
    );
  }

  private createWaveLayer(frequency: number, intensity: number, filterFreq: number): void {
    if (!this.audioContext || !this.masterGain) return;

    // Create noise source
    const bufferSize = this.audioContext.sampleRate * 4;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Pink noise generation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Low-pass filter for ocean depth
    const lowpass = this.audioContext.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = filterFreq * 1000;
    lowpass.Q.value = 0.5;

    // LFO for wave modulation
    const lfo = this.audioContext.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = frequency;

    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = intensity;

    // Gain node for this layer
    const layerGain = this.audioContext.createGain();
    layerGain.gain.value = 0.4;

    // Connect LFO to modulate the layer gain
    lfo.connect(lfoGain);
    lfoGain.connect(layerGain.gain);

    // Main signal path
    source.connect(lowpass);
    lowpass.connect(layerGain);
    layerGain.connect(this.masterGain);

    source.start();
    lfo.start();

    this.nodes.push(source, lfo);
  }

  private createFoamLayer(): void {
    if (!this.audioContext || !this.masterGain) return;

    // High-frequency foam/bubble sounds
    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Bandpass for foam characteristics
    const bandpass = this.audioContext.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 3000;
    bandpass.Q.value = 0.3;

    const foamGain = this.audioContext.createGain();
    foamGain.gain.value = 0.08;

    source.connect(bandpass);
    bandpass.connect(foamGain);
    foamGain.connect(this.masterGain);

    source.start();
    this.nodes.push(source);
  }

  setVolume(volume: number): void {
    if (!this.audioContext || !this.masterGain || !this.isRunning) return;

    this.masterGain.gain.setTargetAtTime(
      volume,
      this.audioContext.currentTime,
      0.3
    );
  }

  async stop(): Promise<void> {
    if (!this.audioContext || !this.masterGain || !this.isRunning) return;

    // Fade out
    this.masterGain.gain.setTargetAtTime(
      0,
      this.audioContext.currentTime,
      1.0
    );

    // Wait for fade, then cleanup
    await new Promise((resolve) => setTimeout(resolve, 1500));

    this.nodes.forEach((node) => {
      if ("stop" in node && typeof node.stop === "function") {
        try {
          node.stop();
        } catch {
          // Node may already be stopped
        }
      }
      node.disconnect();
    });
    this.nodes = [];
    this.isRunning = false;
  }

  dispose(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
    }
  }
}

// ============================================================================
// Ocean Sounds Provider
// ============================================================================

const STORAGE_KEY = "clawd-ocean-sounds";
const DEFAULT_VOLUME = 0.3;

interface StoredPrefs {
  enabled: boolean;
  volume: number;
}

export function OceanSoundsProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [isInitialized, setIsInitialized] = useState(false);
  const generatorRef = useRef<OceanAudioGenerator | null>(null);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const prefs: StoredPrefs = JSON.parse(stored);
        setVolumeState(prefs.volume ?? DEFAULT_VOLUME);
        // Don't auto-play on load - require user interaction
        // But remember if they had it enabled
        if (prefs.enabled) {
          // We'll show a hint that audio was enabled
        }
      }
    } catch {
      // Ignore parse errors
    }
    setIsInitialized(true);
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    if (!isInitialized) return;

    const prefs: StoredPrefs = { enabled: isPlaying, volume };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [isPlaying, volume, isInitialized]);

  // Initialize generator
  useEffect(() => {
    generatorRef.current = new OceanAudioGenerator();
    return () => {
      generatorRef.current?.dispose();
    };
  }, []);

  // Handle play state changes
  useEffect(() => {
    const generator = generatorRef.current;
    if (!generator || !isInitialized) return;

    if (isPlaying) {
      generator.start(volume);
    } else {
      generator.stop();
    }
  }, [isPlaying, isInitialized]);

  // Handle volume changes
  useEffect(() => {
    const generator = generatorRef.current;
    if (!generator || !isPlaying) return;
    generator.setVolume(volume);
  }, [volume, isPlaying]);

  const toggle = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.max(0, Math.min(1, v)));
  }, []);

  return (
    <OceanSoundsContext.Provider value={{ isPlaying, volume, toggle, setVolume }}>
      {children}
    </OceanSoundsContext.Provider>
  );
}

// ============================================================================
// Ocean Sounds Toggle Button
// ============================================================================

export function OceanSoundsToggle() {
  const { isPlaying, volume, toggle, setVolume } = useOceanSounds();
  const [showVolume, setShowVolume] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <motion.button
        onClick={toggle}
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
        className={`
          relative flex items-center gap-1.5 px-2 py-1 rounded-full
          text-xs transition-colors duration-300
          ${isPlaying
            ? "bg-primary/20 text-primary"
            : "bg-muted/50 text-muted-foreground hover:text-foreground"
          }
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isPlaying ? "Mute ocean sounds" : "Play ocean sounds"}
        aria-pressed={isPlaying}
      >
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ocean</span>
              {/* Animated sound waves */}
              <div className="flex items-center gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 bg-primary rounded-full"
                    animate={{
                      height: [4, 8, 4],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="muted"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ocean</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Volume slider (appears on hover when playing) */}
      <AnimatePresence>
        {showVolume && isPlaying && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.9 }}
            className="absolute left-full ml-2 flex items-center gap-2 bg-background/90 backdrop-blur-sm border border-border/50 rounded-full px-3 py-1.5 z-50"
            onMouseEnter={() => setShowVolume(true)}
            onMouseLeave={() => setShowVolume(false)}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-muted rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-primary
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-3
                [&::-moz-range-thumb]:h-3
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-primary
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:cursor-pointer"
              aria-label="Ocean sounds volume"
            />
            <span className="text-xs text-muted-foreground w-6">
              {Math.round(volume * 100)}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

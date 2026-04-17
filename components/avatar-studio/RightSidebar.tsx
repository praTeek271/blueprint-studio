import React from "react";
import { AppState } from "./types";
import { Sidebar } from "@/components/Sidebar";
import { Accordion } from "@/components/Accordion";
import { IconAudioOn, IconAudioOff } from "@/components/Icons";

interface RightSidebarProps {
  open: boolean;
  appState: AppState;
  isListening: boolean;
  puppeteer: {
    lookX: number;
    lookY: number;
    mouthOpen: number;
    headTilt: number;
    isBlinking: boolean;
  };
  toggleAudio: () => void;
  handleConfigChange: (key: keyof AppState["config"], value: any) => void;
  handleSliderCommit: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  open,
  appState,
  isListening,
  puppeteer,
  toggleAudio,
  handleConfigChange,
  handleSliderCommit,
}) => {
  return (
    <Sidebar position="right" open={open}>
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            Puppeteer Rig
          </h2>
          <p className="text-[10px] uppercase font-bold tracking-widest text-blue-600">
            Live Animation
          </p>
        </div>
        <button
          onClick={toggleAudio}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-md ${isListening ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" : "bg-slate-800 hover:bg-slate-900 text-white"}`}
        >
          {isListening ? <IconAudioOn /> : <IconAudioOff />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-blue-800 text-xs leading-relaxed font-medium">
          Click the microphone icon above to test lip-sync and live head tilt
          driven by your voice.
        </div>

        <Accordion title="Audio Calibration" defaultOpen={true}>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                Mic Gain <span>{appState.config.micGain.toFixed(1)}x</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={appState.config.micGain}
                onChange={(e) =>
                  handleConfigChange("micGain", Number(e.target.value))
                }
                onPointerUp={handleSliderCommit}
                className="w-full mt-1 accent-blue-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                Mouth Sensitivity{" "}
                <span>{appState.config.mouthSensitivity.toFixed(2)}x</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={appState.config.mouthSensitivity}
                onChange={(e) =>
                  handleConfigChange("mouthSensitivity", Number(e.target.value))
                }
                onPointerUp={handleSliderCommit}
                className="w-full mt-1 accent-blue-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                Animation Smoothing{" "}
                <span>{appState.config.smoothing.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0.05"
                max="0.9"
                step="0.05"
                value={appState.config.smoothing}
                onChange={(e) =>
                  handleConfigChange("smoothing", Number(e.target.value))
                }
                onPointerUp={handleSliderCommit}
                className="w-full mt-1 accent-blue-600"
              />
            </div>
          </div>
        </Accordion>

        <Accordion title="Autonomous Motion" defaultOpen={true}>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                Blink Interval{" "}
                <span>
                  {(appState.config.blinkIntervalMs / 1000).toFixed(1)}s
                </span>
              </label>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={appState.config.blinkIntervalMs}
                onChange={(e) =>
                  handleConfigChange("blinkIntervalMs", Number(e.target.value))
                }
                onPointerUp={handleSliderCommit}
                className="w-full mt-1 accent-blue-600"
              />
            </div>
          </div>
        </Accordion>

        {isListening && (
          <div className="bg-slate-900 p-4 rounded-xl text-white space-y-2">
            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Live Engine Data
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <div className="text-slate-500 text-[9px]">Mouth Open</div>
                <div className="text-green-400">
                  {puppeteer.mouthOpen.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-[9px]">Head Tilt</div>
                <div className="text-blue-400">
                  {puppeteer.headTilt.toFixed(1)}°
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
};

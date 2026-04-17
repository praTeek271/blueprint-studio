import React from "react";
import { Curve, FreehandLayer } from "./types";
import { Accordion } from "@/components/Accordion";
import {
  IconImport,
  IconExport,
  IconPencil,
  IconMirror,
  IconBrush,
  IconEraser,
  IconGroup,
} from "@/components/Icons";

interface LeftSidebarProps {
  // Mode
  activeMode: "vector" | "freehand";
  handleModeChange: (mode: "vector" | "freehand") => void;

  // Global View
  gridVisible: boolean;
  setGridVisible: (v: boolean) => void;

  // Trace Reference
  referenceImg: HTMLImageElement | null;
  refConfig: { opacity: number; x: number; y: number; scale: number };
  setRefConfig: (v: {
    opacity: number;
    x: number;
    y: number;
    scale: number;
  }) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // Vector mode
  addCurve: (type: "bezier" | "quadratic" | "line") => void;

  // Freehand mode
  freehandTool: "brush" | "eraser";
  setFreehandTool: (v: "brush" | "eraser") => void;
  brushSize: number;
  setBrushSize: (v: number) => void;
  freehandSnapEnabled: boolean;
  setFreehandSnapEnabled: (v: boolean) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (v: string | null) => void;

  // Layer management
  curves: Curve[];
  freehandLayers: FreehandLayer[];
  editingNameId: string | null;
  setEditingNameId: (v: string | null) => void;
  updateLayerName: (
    id: string,
    newName: string,
    type: "vector" | "freehand",
  ) => void;
  toggleLayerMirror: (id: string, type: "vector" | "freehand") => void;
  removeLayer: (id: string, type: "vector" | "freehand") => void;
  checkedFreehandIds: string[];
  setCheckedFreehandIds: React.Dispatch<React.SetStateAction<string[]>>;
  groupSelectedLayers: () => void;

  // Modals
  setShowImport: (v: boolean) => void;
  generateExport: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeMode,
  handleModeChange,
  gridVisible,
  setGridVisible,
  referenceImg,
  refConfig,
  setRefConfig,
  handleImageUpload,
  addCurve,
  freehandTool,
  setFreehandTool,
  brushSize,
  setBrushSize,
  freehandSnapEnabled,
  setFreehandSnapEnabled,
  selectedLayerId,
  setSelectedLayerId,
  curves,
  freehandLayers,
  editingNameId,
  setEditingNameId,
  updateLayerName,
  toggleLayerMirror,
  removeLayer,
  checkedFreehandIds,
  setCheckedFreehandIds,
  groupSelectedLayers,
  setShowImport,
  generateExport,
}) => {
  return (
    <div className="w-full md:w-[360px] bg-white border-r border-slate-200 flex flex-col z-10 shrink-0 shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center">
        <div>
          <h1 className="text-lg font-black tracking-tight">
            Blueprint Studio
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Vector &amp; Sketch
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg transition-colors shadow-sm"
          >
            <IconImport /> Resume
          </button>
          <button
            onClick={generateExport}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg transition-colors shadow-md"
          >
            <IconExport /> Export
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex p-4 border-b border-slate-200 gap-2 bg-slate-50 shrink-0">
        <button
          onClick={() => handleModeChange("vector")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${activeMode === "vector" ? "bg-blue-600 text-white border-blue-700 shadow-inner" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"}`}
        >
          Vector Rig
        </button>
        <button
          onClick={() => handleModeChange("freehand")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${activeMode === "freehand" ? "bg-emerald-600 text-white border-emerald-700 shadow-inner" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"}`}
        >
          Static Accessory
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Global View Settings */}
        <Accordion title="Global View Settings" defaultOpen={false}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700">
              Show Graph Grid
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={gridVisible}
                onChange={() => setGridVisible(!gridVisible)}
              />
              <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
        </Accordion>

        {/* Trace Reference */}
        <Accordion title="Trace Reference" defaultOpen={false}>
          <div className="space-y-4">
            <label className="flex items-center justify-center w-full py-2 px-4 border border-slate-300 rounded-lg cursor-pointer bg-white hover:bg-slate-100 text-xs font-bold text-slate-600 mt-2">
              {referenceImg ? "Replace Image" : "Upload Template"}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
            {referenceImg && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                    Opacity <span>{Math.round(refConfig.opacity * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={refConfig.opacity}
                    onChange={(e) =>
                      setRefConfig({
                        ...refConfig,
                        opacity: Number(e.target.value),
                      })
                    }
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                    Scale <span>{refConfig.scale.toFixed(2)}x</span>
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={refConfig.scale}
                    onChange={(e) =>
                      setRefConfig({
                        ...refConfig,
                        scale: Number(e.target.value),
                      })
                    }
                    className="w-full accent-blue-600"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                      X Offset <span>{refConfig.x}</span>
                    </label>
                    <input
                      type="range"
                      min="-300"
                      max="300"
                      step="5"
                      value={refConfig.x}
                      onChange={(e) =>
                        setRefConfig({
                          ...refConfig,
                          x: Number(e.target.value),
                        })
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                      Y Offset <span>{refConfig.y}</span>
                    </label>
                    <input
                      type="range"
                      min="-300"
                      max="300"
                      step="5"
                      value={refConfig.y}
                      onChange={(e) =>
                        setRefConfig({
                          ...refConfig,
                          y: Number(e.target.value),
                        })
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Accordion>

        {/* Mode-specific Tools */}
        {activeMode === "vector" ? (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-2 shrink-0">
            <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">
              Add Vectors
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => addCurve("bezier")}
                className="py-2 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-600 hover:border-blue-400 transition-colors shadow-sm"
              >
                + Bezier (S-Curve)
              </button>
              <button
                onClick={() => addCurve("quadratic")}
                className="py-2 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-600 hover:border-blue-400 transition-colors shadow-sm"
              >
                + Quadratic (Simple)
              </button>
              <button
                onClick={() => addCurve("line")}
                className="py-2 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-600 hover:border-blue-400 transition-colors shadow-sm"
              >
                + Straight Line
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-4 shrink-0">
            <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
              Sketch Tools
            </h3>
            <div className="flex gap-2 bg-white p-1 rounded-lg border border-emerald-200 shadow-sm">
              <button
                onClick={() => setFreehandTool("brush")}
                className={`flex-1 py-1.5 flex justify-center items-center rounded-md transition-all ${freehandTool === "brush" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
              >
                <IconBrush />{" "}
                <span className="ml-2 text-xs font-bold">Brush</span>
              </button>
              <button
                onClick={() => setFreehandTool("eraser")}
                className={`flex-1 py-1.5 flex justify-center items-center rounded-md transition-all ${freehandTool === "eraser" ? "bg-red-500 text-white" : "text-slate-500 hover:bg-slate-100"}`}
              >
                <IconEraser />{" "}
                <span className="ml-2 text-xs font-bold">Eraser</span>
              </button>
            </div>
            <div>
              <label className="text-[10px] font-bold text-emerald-600 flex justify-between">
                Brush Size <span>{brushSize}px</span>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className={`w-full ${freehandTool === "eraser" ? "accent-red-500" : "accent-emerald-600"}`}
              />
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                Magnetic Snap
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={freehandSnapEnabled}
                  onChange={() => setFreehandSnapEnabled(!freehandSnapEnabled)}
                />
                <div className="w-8 h-4 bg-emerald-200 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3"></div>
              </label>
            </div>
            <button
              onClick={() => setSelectedLayerId(null)}
              className={`w-full py-2 border rounded-md text-xs font-bold shadow-sm ${selectedLayerId === null ? "bg-emerald-600 text-white" : "bg-white text-emerald-600 hover:bg-emerald-50"}`}
            >
              + Start New Layer
            </button>
          </div>
        )}

        {/* Active Layers */}
        {(activeMode === "vector"
          ? curves.length > 0
          : freehandLayers.length > 0) && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 shrink-0 pb-10">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">
              Active Layers ({activeMode === "vector" ? "Vector" : "Accessory"})
            </h3>
            <div className="space-y-2">
              {activeMode === "vector" &&
                curves.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedLayerId(c.id)}
                    className={`flex justify-between items-center p-2 border rounded-lg cursor-pointer transition-colors ${selectedLayerId === c.id ? "bg-blue-50 border-blue-400 shadow-sm" : "bg-white border-slate-200 hover:border-slate-300"}`}
                  >
                    {editingNameId === c.id ? (
                      <input
                        autoFocus
                        className="bg-white border border-blue-300 px-2 py-1 rounded outline-none flex-1 text-xs"
                        value={c.name}
                        onChange={(e) =>
                          updateLayerName(c.id, e.target.value, "vector")
                        }
                        onBlur={() => setEditingNameId(null)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setEditingNameId(null)
                        }
                      />
                    ) : (
                      <div className="flex-1 flex items-center min-w-0 pr-2">
                        <span className="text-[10px] font-bold text-blue-400 mr-2">
                          [V]
                        </span>
                        <span className="font-semibold text-xs text-slate-700 truncate">
                          {c.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLayerId(c.id);
                            setEditingNameId(c.id);
                          }}
                          className="ml-2 text-slate-300 hover:text-blue-500 p-1"
                        >
                          <IconPencil />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerMirror(c.id, "vector");
                          }}
                          className={`ml-1 p-1 ${c.mirrored ? "text-blue-500" : "text-slate-300"}`}
                        >
                          <IconMirror active={c.mirrored} />
                        </button>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLayer(c.id, "vector");
                      }}
                      className="text-red-400 hover:text-red-600 font-bold px-2 py-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              {activeMode === "freehand" && (
                <div className="space-y-2">
                  {checkedFreehandIds.length > 0 && (
                    <div className="flex justify-between items-center mb-2 bg-emerald-50 px-3 py-2 rounded-lg text-emerald-800 border border-emerald-200">
                      <span className="text-[10px] font-bold">
                        ({checkedFreehandIds.length}) selected
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={groupSelectedLayers}
                          className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                          <IconGroup />
                        </button>
                        <button
                          onClick={() => setCheckedFreehandIds([])}
                          className="p-1.5 bg-slate-200 text-slate-600 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                  {freehandLayers.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedLayerId(p.id)}
                      className={`flex justify-between items-center p-2 border rounded-lg cursor-pointer transition-colors ${selectedLayerId === p.id ? "bg-emerald-50 border-emerald-400 shadow-sm" : "bg-white border-slate-200 hover:border-slate-300"}`}
                    >
                      {editingNameId === p.id ? (
                        <input
                          autoFocus
                          className="bg-white border border-emerald-300 px-2 py-1 rounded outline-none flex-1 text-xs"
                          value={p.name}
                          onChange={(e) =>
                            updateLayerName(p.id, e.target.value, "freehand")
                          }
                          onBlur={() => setEditingNameId(null)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && setEditingNameId(null)
                          }
                        />
                      ) : (
                        <div className="flex-1 flex items-center min-w-0 pr-2">
                          <input
                            type="checkbox"
                            className="mr-2 w-3 h-3 accent-emerald-600"
                            checked={checkedFreehandIds.includes(p.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              setCheckedFreehandIds((pids) =>
                                e.target.checked
                                  ? [...pids, p.id]
                                  : pids.filter((id) => id !== p.id),
                              );
                            }}
                          />
                          <span className="text-[10px] font-bold mr-2 text-emerald-400">
                            [A]
                          </span>
                          <span className="font-semibold text-xs text-slate-700 truncate">
                            {p.name}
                          </span>
                          <span className="ml-1 text-[9px] text-slate-400">
                            ({p.strokes.length})
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLayerId(p.id);
                              setEditingNameId(p.id);
                            }}
                            className="ml-2 text-slate-300 hover:text-emerald-500 p-1"
                          >
                            <IconPencil />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLayerMirror(p.id, "freehand");
                            }}
                            className={`ml-1 p-1 ${p.mirrored ? "text-emerald-500" : "text-slate-300"}`}
                          >
                            <IconMirror active={p.mirrored} />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLayer(p.id, "freehand");
                        }}
                        className="text-red-400 hover:text-red-600 font-bold px-2 py-1 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

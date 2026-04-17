import React from "react";
import { AppState, FreehandLayer, LayerTransform, getTag } from "./types";
import { ASSET_SHOP, SHOP_CATEGORIES } from "./data";
import { AssetThumbnail } from "./AssetThumbnail";
import { Sidebar } from "@/components/Sidebar";
import { Accordion } from "@/components/Accordion";
import { IconPlus } from "@/components/Icons";

interface LeftSidebarProps {
  open: boolean;
  leftTab: "shop" | "editor";
  setLeftTab: (v: "shop" | "editor") => void;
  appState: AppState;
  setAccessory: (category: string, id: string) => void;
  selectShopAsset: (asset: FreehandLayer) => void;
  setCustomImportCategory: (cat: string) => void;
  setShowImport: (v: boolean) => void;
  handleConfigChange: (key: keyof AppState["config"], value: any) => void;
  handleTransformChange: (
    layerId: string,
    key: keyof LayerTransform,
    value: number,
  ) => void;
  handleSliderCommit: () => void;
  removeLayer: (id: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  open,
  leftTab,
  setLeftTab,
  appState,
  setAccessory,
  selectShopAsset,
  setCustomImportCategory,
  setShowImport,
  handleConfigChange,
  handleTransformChange,
  handleSliderCommit,
  removeLayer,
}) => {
  return (
    <Sidebar position="left" open={open}>
      <div className="flex border-b border-slate-200 shrink-0">
        <button
          onClick={() => setLeftTab("shop")}
          className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase transition-colors ${leftTab === "shop" ? "border-b-2 border-blue-600 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`}
        >
          Shop
        </button>
        <button
          onClick={() => setLeftTab("editor")}
          className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase transition-colors ${leftTab === "editor" ? "border-b-2 border-blue-600 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`}
        >
          Editor
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {leftTab === "shop" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {SHOP_CATEGORIES.map((cat) => {
              const items = ASSET_SHOP.filter((s) => getTag(s.name) === cat);
              const activeId = appState.activeAccessories[cat];
              return (
                <Accordion
                  key={cat}
                  title={`${cat} Wardrobe`}
                  defaultOpen={true}
                >
                  <div className="flex overflow-x-auto gap-3 pb-2 pt-2 scrollbar-thin">
                    {/* Custom Import Card */}
                    <button
                      onClick={() => {
                        setCustomImportCategory(cat);
                        setShowImport(true);
                      }}
                      className="shrink-0 w-24 h-28 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 transition-all group"
                    >
                      <span className="mb-1 transform group-hover:scale-110 transition-transform">
                        <IconPlus />
                      </span>
                      <span className="text-[10px] font-bold">Custom</span>
                    </button>

                    {/* Imported User Custom Items */}
                    {appState.avatarData.freehandLayers
                      .filter(
                        (l) =>
                          getTag(l.name) === cat &&
                          !l.id.startsWith("injected_"),
                      )
                      .map((acc) => (
                        <button
                          key={acc.id}
                          onClick={() => setAccessory(cat, acc.id)}
                          className={`shrink-0 w-24 h-28 rounded-xl border p-2 flex flex-col justify-end text-[10px] font-bold transition-all relative overflow-hidden ${activeId === acc.id ? "bg-blue-50 border-blue-500 text-blue-700 shadow-inner" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
                        >
                          {activeId === acc.id && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500"></div>
                          )}
                          <AssetThumbnail
                            layer={acc}
                            category={cat}
                            config={appState.config}
                          />
                          <span className="truncate w-full text-center">
                            {acc.name.split("--")[0]}
                          </span>
                        </button>
                      ))}

                    {/* Pre-defined Shop Items */}
                    {items.map((item) => {
                      const isInjectedActive =
                        activeId === "injected_" + item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => selectShopAsset(item)}
                          className={`shrink-0 w-24 h-28 rounded-xl border p-2 flex flex-col justify-end text-[10px] font-bold transition-all relative overflow-hidden ${isInjectedActive ? "bg-blue-50 border-blue-500 text-blue-700 shadow-inner" : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500"}`}
                        >
                          {isInjectedActive && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500"></div>
                          )}
                          <AssetThumbnail
                            layer={item}
                            category={cat}
                            config={appState.config}
                          />
                          <span className="truncate w-full text-center">
                            {item.name.split("--")[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Accordion>
              );
            })}
          </div>
        )}

        {leftTab === "editor" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <Accordion title="Base Face Proportions" defaultOpen={true}>
              <div className="space-y-4 pt-2">
                <div
                  className="flex items-center gap-3 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-200"
                  onClick={() => {
                    handleConfigChange(
                      "showSclera",
                      !appState.config.showSclera,
                    );
                    handleSliderCommit();
                  }}
                >
                  <div
                    className={`w-8 h-5 rounded-full p-1 transition-colors ${appState.config.showSclera ? "bg-blue-600" : "bg-slate-300"}`}
                  >
                    <div
                      className={`w-3 h-3 bg-white rounded-full transition-transform ${appState.config.showSclera ? "translate-x-3" : "translate-x-0"}`}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    Show Eye Whites
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                      Eye Gap <span>{appState.config.eyeSpacing}</span>
                    </label>
                    <input
                      type="range"
                      min="15"
                      max="70"
                      value={appState.config.eyeSpacing}
                      onChange={(e) =>
                        handleConfigChange("eyeSpacing", Number(e.target.value))
                      }
                      onPointerUp={handleSliderCommit}
                      className="w-full mt-1 accent-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                      Eye Y <span>{appState.config.eyeYOffset}</span>
                    </label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={appState.config.eyeYOffset}
                      onChange={(e) =>
                        handleConfigChange("eyeYOffset", Number(e.target.value))
                      }
                      onPointerUp={handleSliderCommit}
                      className="w-full mt-1 accent-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                      Mouth X <span>{appState.config.mouthXOffset}</span>
                    </label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={appState.config.mouthXOffset}
                      onChange={(e) =>
                        handleConfigChange(
                          "mouthXOffset",
                          Number(e.target.value),
                        )
                      }
                      onPointerUp={handleSliderCommit}
                      className="w-full mt-1 accent-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                      Mouth Y <span>{appState.config.mouthYOffset}</span>
                    </label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={appState.config.mouthYOffset}
                      onChange={(e) =>
                        handleConfigChange(
                          "mouthYOffset",
                          Number(e.target.value),
                        )
                      }
                      onPointerUp={handleSliderCommit}
                      className="w-full mt-1 accent-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                    Mouth Width <span>{appState.config.mouthWidth}</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={appState.config.mouthWidth}
                    onChange={(e) =>
                      handleConfigChange("mouthWidth", Number(e.target.value))
                    }
                    onPointerUp={handleSliderCommit}
                    className="w-full mt-1 accent-blue-600"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-3 space-y-3">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => {
                      handleConfigChange("fillHair", !appState.config.fillHair);
                      handleSliderCommit();
                    }}
                  >
                    <div
                      className={`w-8 h-5 rounded-full p-1 transition-colors ${appState.config.fillHair ? "bg-blue-600" : "bg-slate-300"}`}
                    >
                      <div
                        className={`w-3 h-3 bg-white rounded-full transition-transform ${appState.config.fillHair ? "translate-x-3" : "translate-x-0"}`}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      Solid Hair Fill
                    </span>
                  </div>
                  {appState.config.fillHair && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500">
                        Hair Color
                      </span>
                      <input
                        type="color"
                        value={appState.config.hairColor}
                        onChange={(e) =>
                          handleConfigChange("hairColor", e.target.value)
                        }
                        onPointerUp={handleSliderCommit}
                        className="w-6 h-6 p-0 border border-slate-300 rounded cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Accordion>

            <Accordion title="Active Layers" defaultOpen={true}>
              <div className="space-y-2 pt-2">
                {Object.values(appState.activeAccessories)
                  .filter((id) => id !== null)
                  .map((id) => {
                    const layer = appState.avatarData.freehandLayers.find(
                      (l) => l.id === id,
                    );
                    if (!layer) return null;
                    const tr = layer.transform || {
                      x: 0,
                      y: 0,
                      scale: 1,
                      rotation: 0,
                    };
                    return (
                      <div
                        key={layer.id}
                        className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-slate-700 truncate pr-2">
                            {layer.name.split("--")[0]}
                          </span>
                          <button
                            onClick={() => removeLayer(layer.id)}
                            className="text-red-400 hover:text-red-600 font-bold text-[10px] bg-white px-2 py-1 rounded border border-slate-200 shadow-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 flex justify-between">
                              X Offset <span>{tr.x}</span>
                            </label>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={tr.x}
                              onChange={(e) =>
                                handleTransformChange(
                                  layer.id,
                                  "x",
                                  Number(e.target.value),
                                )
                              }
                              onPointerUp={handleSliderCommit}
                              className="w-full mt-1 accent-slate-600"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 flex justify-between">
                              Y Offset <span>{tr.y}</span>
                            </label>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={tr.y}
                              onChange={(e) =>
                                handleTransformChange(
                                  layer.id,
                                  "y",
                                  Number(e.target.value),
                                )
                              }
                              onPointerUp={handleSliderCommit}
                              className="w-full mt-1 accent-slate-600"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 flex justify-between">
                              Scale <span>{tr.scale.toFixed(2)}</span>
                            </label>
                            <input
                              type="range"
                              min="0.5"
                              max="2"
                              step="0.05"
                              value={tr.scale}
                              onChange={(e) =>
                                handleTransformChange(
                                  layer.id,
                                  "scale",
                                  Number(e.target.value),
                                )
                              }
                              onPointerUp={handleSliderCommit}
                              className="w-full mt-1 accent-slate-600"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 flex justify-between">
                              Rotation <span>{tr.rotation}°</span>
                            </label>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              value={tr.rotation}
                              onChange={(e) =>
                                handleTransformChange(
                                  layer.id,
                                  "rotation",
                                  Number(e.target.value),
                                )
                              }
                              onPointerUp={handleSliderCommit}
                              className="w-full mt-1 accent-slate-600"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {Object.values(appState.activeAccessories).every(
                  (id) => id === null,
                ) && (
                  <p className="text-[10px] text-slate-400 italic text-center py-2">
                    No accessories equipped.
                  </p>
                )}
              </div>
            </Accordion>
          </div>
        )}
      </div>
    </Sidebar>
  );
};

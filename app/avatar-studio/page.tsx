"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Navbar, MenuItem } from "@/components/Navbar";
import {
  IconImport,
  IconExport,
  IconUndo,
  IconRedo,
  IconNext,
} from "@/components/Icons";
import {
  AppState,
  Curve,
  FreehandLayer,
  LayerTransform,
  Point,
  Stroke,
  getTag,
} from "@/components/avatar-studio/types";
import { INITIAL_APP_STATE } from "@/components/avatar-studio/data";
import { LeftSidebar } from "@/components/avatar-studio/LeftSidebar";
import { RightSidebar } from "@/components/avatar-studio/RightSidebar";
import { StartupModal } from "@/components/avatar-studio/StartupModal";
import { ImportModal } from "@/components/avatar-studio/ImportModal";
import { ExportModal } from "@/components/avatar-studio/ExportModal";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!offscreenCanvasRef.current && typeof document !== "undefined") {
      offscreenCanvasRef.current = document.createElement("canvas");
      offscreenCanvasRef.current.width = 600;
      offscreenCanvasRef.current.height = 600;
    }
  }, []);

  // --- STATE MANAGEMENT & HISTORY ---
  const [showStartup, setShowStartup] = useState(true);
  const [history, setHistory] = useState<AppState[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [appState, setAppState] = useState<AppState>(INITIAL_APP_STATE);

  useEffect(() => {
    if (!showStartup && historyIdx === -1) {
      setHistory([appState]);
      setHistoryIdx(0);
    }
  }, [showStartup, historyIdx, appState]);

  const saveHistory = (newState: AppState) => {
    const newHistory = history.slice(0, historyIdx + 1);
    newHistory.push(newState);
    if (newHistory.length > 6) newHistory.shift();
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setAppState(history[historyIdx - 1]);
    }
  };

  const redo = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setAppState(history[historyIdx + 1]);
    }
  };

  // --- UI STATE ---
  const [leftTab, setLeftTab] = useState<"shop" | "editor">("shop");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importCode, setImportCode] = useState("");
  const [customImportCategory, setCustomImportCategory] = useState<
    string | null
  >(null);

  const [showExport, setShowExport] = useState(false);
  const [exportPayload, setExportPayload] = useState({ json: "", env: "" });

  const [activeMode, setActiveMode] = useState<"vector" | "freehand">("vector");
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<{
    curveId: string;
    nodeKey: string;
  } | null>(null);

  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [freehandTool, setFreehandTool] = useState<"brush" | "eraser">("brush");
  const [brushSize, setBrushSize] = useState(3);
  const [freehandSnapEnabled, setFreehandSnapEnabled] = useState(true);

  const [puppeteer, setPuppeteer] = useState({
    lookX: 0,
    lookY: 0,
    mouthOpen: 5,
    headTilt: 0,
    isBlinking: false,
  });
  const [isListening, setIsListening] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const autoLookRef = useRef({ x: 0, y: 0 });

  const renderRef = useRef({
    puppeteer,
    appState,
    activeMode,
    selectedLayerId,
    currentStroke,
    freehandTool,
    brushSize,
    freehandSnapEnabled,
    activeNode,
  });
  useEffect(() => {
    renderRef.current = {
      puppeteer,
      appState,
      activeMode,
      selectedLayerId,
      currentStroke,
      freehandTool,
      brushSize,
      freehandSnapEnabled,
      activeNode,
    };
  }, [
    puppeteer,
    appState,
    activeMode,
    selectedLayerId,
    currentStroke,
    freehandTool,
    brushSize,
    freehandSnapEnabled,
    activeNode,
  ]);

  // --- AUTONOMOUS BEHAVIOR ---
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const triggerBlink = () => {
      setPuppeteer((p) => ({ ...p, isBlinking: true }));
      setTimeout(() => setPuppeteer((p) => ({ ...p, isBlinking: false })), 150);
      blinkTimeout = setTimeout(
        triggerBlink,
        appState.config.blinkIntervalMs + (Math.random() * 2000 - 1000),
      );
    };
    blinkTimeout = setTimeout(triggerBlink, appState.config.blinkIntervalMs);

    const dartInterval = setInterval(
      () => {
        autoLookRef.current = {
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 8,
        };
      },
      2000 + Math.random() * 3000,
    );

    return () => {
      clearTimeout(blinkTimeout);
      clearInterval(dartInterval);
    };
  }, [appState.config.blinkIntervalMs]);

  const toggleAudio = async () => {
    if (isListening) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioCtxRef.current) audioCtxRef.current.close();
      setIsListening(false);
      setPuppeteer((p) => ({ ...p, mouthOpen: 5, headTilt: 0 }));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      streamRef.current = stream;
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const renderAudioFrame = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        let average = sum / dataArray.length;

        setPuppeteer((prev) => {
          const conf = renderRef.current.appState.config;
          const scaledAvg = average * conf.micGain;
          const targetOpenness = Math.min(
            Math.max(scaledAvg * conf.mouthSensitivity - 5, 0),
            60,
          );
          return {
            ...prev,
            mouthOpen:
              prev.mouthOpen +
              (targetOpenness - prev.mouthOpen) * conf.smoothing,
            headTilt:
              prev.headTilt + ((scaledAvg > 10 ? 3 : 0) - prev.headTilt) * 0.1,
            lookX: prev.lookX + (autoLookRef.current.x - prev.lookX) * 0.1,
            lookY: prev.lookY + (autoLookRef.current.y - prev.lookY) * 0.1,
          };
        });
        animationRef.current = requestAnimationFrame(renderAudioFrame);
      };
      setIsListening(true);
      renderAudioFrame();
    } catch (err) {
      console.error(err);
      alert("Microphone access required.");
    }
  };

  // --- ACTIONS ---
  const handleNextPhase = () => {
    setLeftSidebarOpen(false);
    setRightSidebarOpen(true);
  };

  const handleConfigChange = (key: keyof AppState["config"], value: any) => {
    setAppState((prev) => ({
      ...prev,
      config: { ...prev.config, [key]: value },
    }));
  };

  const handleTransformChange = (
    layerId: string,
    key: keyof LayerTransform,
    value: number,
  ) => {
    setAppState((prev) => ({
      ...prev,
      avatarData: {
        ...prev.avatarData,
        freehandLayers: prev.avatarData.freehandLayers.map((l) =>
          l.id === layerId
            ? {
                ...l,
                transform: {
                  ...(l.transform || { x: 0, y: 0, scale: 1, rotation: 0 }),
                  [key]: value,
                },
              }
            : l,
        ),
      },
    }));
  };

  const handleSliderCommit = () => saveHistory(appState);

  const setAccessory = (category: string, id: string) => {
    const newState = {
      ...appState,
      activeAccessories: {
        ...appState.activeAccessories,
        [category]: appState.activeAccessories[category] === id ? null : id, // Toggle off if clicked again
      },
    };
    setAppState(newState);
    saveHistory(newState);
  };

  const selectShopAsset = (asset: FreehandLayer) => {
    const deterministicId = "injected_" + asset.id;
    const cat = getTag(asset.name);
    const existing = appState.avatarData.freehandLayers.find(
      (l) => l.id === deterministicId,
    );

    if (existing) {
      const isActive = appState.activeAccessories[cat] === deterministicId;
      const newState = {
        ...appState,
        activeAccessories: {
          ...appState.activeAccessories,
          [cat]: isActive ? null : deterministicId,
        },
      };
      setAppState(newState);
      saveHistory(newState);
    } else {
      const clonedAsset = JSON.parse(JSON.stringify(asset));
      clonedAsset.id = deterministicId;
      if (!clonedAsset.transform)
        clonedAsset.transform = { x: 0, y: 0, scale: 1, rotation: 0 };
      const newState = {
        ...appState,
        avatarData: {
          ...appState.avatarData,
          freehandLayers: [...appState.avatarData.freehandLayers, clonedAsset],
        },
        activeAccessories: {
          ...appState.activeAccessories,
          [cat]: deterministicId,
        },
      };
      setAppState(newState);
      saveHistory(newState);
    }
  };

  const removeLayer = (id: string) => {
    const newState = { ...appState };
    newState.avatarData.freehandLayers =
      newState.avatarData.freehandLayers.filter((p) => p.id !== id);
    Object.keys(newState.activeAccessories).forEach((k) => {
      if (newState.activeAccessories[k] === id)
        newState.activeAccessories[k] = null;
    });
    setAppState(newState);
    saveHistory(newState);
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const handleImportAction = () => {
    let parsedCurves: Curve[] = [];
    let parsedLayers: FreehandLayer[] = [];

    const match = importCode.match(/\/\/ STATE_JSON:(.+)/);
    if (match && match[1]) {
      try {
        const s = JSON.parse(match[1].trim());
        if (s.curves) parsedCurves = s.curves;
        if (s.freehandLayers)
          parsedLayers = s.freehandLayers.map((l: FreehandLayer) => ({
            ...l,
            transform: l.transform || { x: 0, y: 0, scale: 1, rotation: 0 },
          }));
      } catch (e) {
        alert("Failed to restore state from JSON.");
        return;
      }
    } else {
      try {
        let currentSection = "none";
        let currentName = "Legacy Shape";
        let lastMoveTo: Point | null = null;
        let currentLayer: FreehandLayer | null = null;
        let currentStroke: Stroke | null = null;
        let currentSize = 3;

        const parseCoord = (str: string) => {
          if (str.includes("-")) {
            const parts = str.split("-");
            return parseInt(parts[0]) - parseInt(parts[1]);
          }
          if (str.includes("+")) {
            const parts = str.split("+");
            return parseInt(parts[0]) + parseInt(parts[1]);
          }
          return parseInt(str.trim(), 10);
        };

        const lines = importCode.split("\n");
        for (let line of lines) {
          line = line.trim();
          if (!line) continue;
          if (
            line.includes("1. DYNAMIC VECTOR") ||
            line.includes("1. VECTOR RIG")
          ) {
            currentSection = "vector";
            continue;
          }
          if (
            line.includes("2. STATIC ACCESSORIES") ||
            line.includes("2. ACCESSORIES")
          ) {
            currentSection = "freehand";
            continue;
          }

          if (line.startsWith("//") && !line.includes("---")) {
            currentName = line.replace("//", "").trim();
            if (currentSection === "freehand") {
              if (
                currentLayer &&
                currentStroke &&
                currentStroke.points.length > 0
              )
                currentLayer.strokes.push(currentStroke);
              if (currentLayer && currentLayer.strokes.length > 0)
                parsedLayers.push(currentLayer);
              currentLayer = {
                id: Date.now() + Math.random().toString(),
                name: currentName,
                mirrored: false,
                strokes: [],
                transform: { x: 0, y: 0, scale: 1, rotation: 0 },
              };
              currentStroke = null;
            }
            continue;
          }

          const sizeMatch = line.match(/lineWidth\s*=\s*(\d+)/);
          if (sizeMatch) currentSize = parseInt(sizeMatch[1], 10);

          const moveMatch = line.match(/moveTo\(([^,]+),\s*([^)]+)\)/);
          if (moveMatch) {
            const pt = {
              x: parseCoord(moveMatch[1]),
              y: parseCoord(moveMatch[2]),
            };
            if (currentSection === "vector") {
              lastMoveTo = pt;
            } else if (currentSection === "freehand") {
              if (
                currentStroke &&
                currentStroke.points.length > 0 &&
                currentLayer
              )
                currentLayer.strokes.push(currentStroke);
              currentStroke = {
                points: [pt],
                size: currentSize,
                isEraser: false,
              };
              if (!currentLayer)
                currentLayer = {
                  id: Date.now() + Math.random().toString(),
                  name: currentName,
                  mirrored: false,
                  strokes: [],
                  transform: { x: 0, y: 0, scale: 1, rotation: 0 },
                };
            }
          }

          if (currentSection === "vector" && lastMoveTo) {
            const bezMatch = line.match(
              /bezierCurveTo\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/,
            );
            if (bezMatch) {
              parsedCurves.push({
                id: Date.now() + Math.random().toString(),
                type: "bezier",
                name: currentName,
                mirrored: false,
                p0: lastMoveTo,
                cp1: { x: parseCoord(bezMatch[1]), y: parseCoord(bezMatch[2]) },
                cp2: { x: parseCoord(bezMatch[3]), y: parseCoord(bezMatch[4]) },
                p1: { x: parseCoord(bezMatch[5]), y: parseCoord(bezMatch[6]) },
              });
              lastMoveTo = null;
            }
            const quadMatch = line.match(
              /quadraticCurveTo\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/,
            );
            if (quadMatch && lastMoveTo) {
              parsedCurves.push({
                id: Date.now() + Math.random().toString(),
                type: "quadratic",
                name: currentName,
                mirrored: false,
                p0: lastMoveTo,
                cp1: {
                  x: parseCoord(quadMatch[1]),
                  y: parseCoord(quadMatch[2]),
                },
                p1: {
                  x: parseCoord(quadMatch[3]),
                  y: parseCoord(quadMatch[4]),
                },
              });
              lastMoveTo = null;
            }
            const lineMatch = line.match(/lineTo\(([^,]+),\s*([^)]+)\)/);
            if (lineMatch && lastMoveTo) {
              parsedCurves.push({
                id: Date.now() + Math.random().toString(),
                type: "line",
                name: currentName,
                mirrored: false,
                p0: lastMoveTo,
                p1: {
                  x: parseCoord(lineMatch[1]),
                  y: parseCoord(lineMatch[2]),
                },
              });
              lastMoveTo = null;
            }
          }

          if (currentSection === "freehand" && currentStroke) {
            const lineMatch = line.match(/lineTo\(([^,]+),\s*([^)]+)\)/);
            if (lineMatch)
              currentStroke.points.push({
                x: parseCoord(lineMatch[1]),
                y: parseCoord(lineMatch[2]),
              });
          }
        }

        if (currentLayer && currentStroke && currentStroke.points.length > 0)
          currentLayer.strokes.push(currentStroke);
        if (currentLayer && currentLayer.strokes.length > 0)
          parsedLayers.push(currentLayer);
      } catch (e) {
        alert("Failed to parse code.");
        return;
      }
    }

    if (customImportCategory) {
      const combinedStrokes = parsedLayers.flatMap((l) => l.strokes);
      if (combinedStrokes.length > 0) {
        const newLayer: FreehandLayer = {
          id: Date.now().toString(),
          name: `Custom --${customImportCategory}`,
          mirrored: false,
          strokes: combinedStrokes,
          transform: { x: 0, y: 0, scale: 1, rotation: 0 },
        };
        const newState = {
          ...appState,
          avatarData: {
            ...appState.avatarData,
            freehandLayers: [...appState.avatarData.freehandLayers, newLayer],
          },
          activeAccessories: {
            ...appState.activeAccessories,
            [customImportCategory]: newLayer.id,
          },
        };
        setAppState(newState);
        saveHistory(newState);
        alert(`Custom ${customImportCategory} loaded!`);
      } else {
        alert("No freehand strokes found to import.");
      }
    } else {
      const newState = {
        ...appState,
        avatarData: { curves: parsedCurves, freehandLayers: parsedLayers },
      };
      setAppState(newState);
      saveHistory(newState);
      alert("Full Blueprint loaded!");
    }

    setShowImport(false);
    setImportCode("");
    setCustomImportCategory(null);
  };

  const handleExportAction = () => {
    const activeIds = Object.values(appState.activeAccessories).filter(
      (id) => id !== null,
    );
    const filteredAccessories = appState.avatarData.freehandLayers.filter((a) =>
      activeIds.includes(a.id),
    );

    const playerJson = {
      geometry: {
        curves: appState.avatarData.curves,
        freehandLayers: filteredAccessories,
      },
      config: appState.config,
    };
    const envString = Object.entries(appState.config)
      .map(
        ([k, v]) =>
          `NEXT_PUBLIC_AVATAR_${k.replace(/([A-Z])/g, "_$1").toUpperCase()}=${v}`,
      )
      .join("\n");

    setExportPayload({
      json: JSON.stringify(playerJson, null, 2),
      env: envString,
    });
    setShowExport(true);
  };

  // --- RENDERING ENGINE ---
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !offscreenCanvasRef.current) return;
    const ctx = canvas.getContext("2d");
    const offCtx = offscreenCanvasRef.current.getContext("2d");
    if (!ctx || !offCtx) return;

    const {
      puppeteer: pup,
      appState: { avatarData: ad, config: conf, activeAccessories: accs },
      activeMode,
      selectedLayerId,
      currentStroke,
      freehandTool,
      brushSize,
      freehandSnapEnabled,
      activeNode,
    } = renderRef.current;

    const { curves, freehandLayers } = ad;

    const isBodyPart = (name: string) =>
      ["body", "clothes"].includes(getTag(name));

    const headCurves = curves.filter((c) => !isBodyPart(c.name));
    const bodyCurves = curves.filter((c) => isBodyPart(c.name));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const drawCurve = (c: Curve) => {
      const isSelected = selectedLayerId === c.id && activeMode === "vector";
      const vectorAlpha = activeMode === "vector" ? 1.0 : 0.4;
      ctx.beginPath();
      ctx.strokeStyle = isSelected
        ? "#2563eb"
        : `rgba(15, 23, 42, ${vectorAlpha})`;
      ctx.lineWidth = 3;
      ctx.moveTo(c.p0.x, c.p0.y);
      if (c.type === "bezier")
        ctx.bezierCurveTo(
          c.cp1!.x,
          c.cp1!.y,
          c.cp2!.x,
          c.cp2!.y,
          c.p1.x,
          c.p1.y,
        );
      else if (c.type === "quadratic")
        ctx.quadraticCurveTo(c.cp1!.x, c.cp1!.y, c.p1.x, c.p1.y);
      else if (c.type === "line") ctx.lineTo(c.p1.x, c.p1.y);
      ctx.stroke();

      if (c.mirrored) {
        ctx.beginPath();
        ctx.strokeStyle = isSelected
          ? `rgba(37, 99, 235, ${0.4 * vectorAlpha})`
          : `rgba(15, 23, 42, ${0.3 * vectorAlpha})`;
        ctx.moveTo(600 - c.p0.x, c.p0.y);
        if (c.type === "bezier")
          ctx.bezierCurveTo(
            600 - c.cp1!.x,
            c.cp1!.y,
            600 - c.cp2!.x,
            c.cp2!.y,
            600 - c.p1.x,
            c.p1.y,
          );
        else if (c.type === "quadratic")
          ctx.quadraticCurveTo(600 - c.cp1!.x, c.cp1!.y, 600 - c.p1.x, c.p1.y);
        else if (c.type === "line") ctx.lineTo(600 - c.p1.x, c.p1.y);
        ctx.stroke();
      }

      if (isSelected && activeMode === "vector") {
        ctx.lineWidth = 1;
        const drawNode = (point: Point, isControl = false, nodeKey: string) => {
          const isNodeActive =
            activeNode?.curveId === c.id && activeNode?.nodeKey === nodeKey;
          ctx.beginPath();
          ctx.arc(point.x, point.y, isNodeActive ? 6 : 5, 0, Math.PI * 2);
          ctx.fillStyle = isControl
            ? isNodeActive
              ? "#ef4444"
              : "#fca5a5"
            : isNodeActive
              ? "#3b82f6"
              : "#93c5fd";
          ctx.strokeStyle = isControl ? "#b91c1c" : "#1d4ed8";
          ctx.fill();
          ctx.stroke();
        };
        const drawGuideline = (pA: Point, pB: Point) => {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
          ctx.setLineDash([4, 4]);
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.stroke();
          ctx.setLineDash([]);
        };
        if (c.type === "bezier") {
          drawGuideline(c.p0, c.cp1!);
          drawGuideline(c.p1, c.cp2!);
          drawNode(c.cp1!, true, "cp1");
          drawNode(c.cp2!, true, "cp2");
        } else if (c.type === "quadratic") {
          drawGuideline(c.p0, c.cp1!);
          drawGuideline(c.p1, c.cp1!);
          drawNode(c.cp1!, true, "cp1");
        }
        drawNode(c.p0, false, "p0");
        drawNode(c.p1, false, "p1");
      }
    };

    const renderAccessoryGroupToOffscreen = (
      layers: FreehandLayer[],
      renderActiveStroke: boolean = false,
    ) => {
      offCtx.clearRect(0, 0, 600, 600);
      offCtx.lineCap = "round";
      offCtx.lineJoin = "round";

      layers.forEach((layer) => {
        const cat = getTag(layer.name);
        // In editing mode, we might want to see all layers, but for standard playback we filter.
        // Let's enforce active accessories filter to avoid clutter.
        if (accs[cat] !== layer.id) return;

        const isHair = cat === "hair";
        const tr = layer.transform || { x: 0, y: 0, scale: 1, rotation: 0 };

        offCtx.save();
        // Pivot around face center for transformations
        offCtx.translate(300 + tr.x, 250 + tr.y);
        offCtx.rotate((tr.rotation * Math.PI) / 180);
        offCtx.scale(tr.scale, tr.scale);
        offCtx.translate(-300, -250);

        if (conf.fillHair && isHair) {
          offCtx.beginPath();
          layer.strokes.forEach((s) => {
            if (s.isEraser) return;
            offCtx.moveTo(s.points[0].x, s.points[0].y);
            for (let i = 1; i < s.points.length; i++)
              offCtx.lineTo(s.points[i].x, s.points[i].y);
            if (layer.mirrored) {
              offCtx.moveTo(600 - s.points[0].x, s.points[0].y);
              for (let i = 1; i < s.points.length; i++)
                offCtx.lineTo(600 - s.points[i].x, s.points[i].y);
            }
          });
          offCtx.globalCompositeOperation = "source-over";
          offCtx.fillStyle = conf.hairColor;
          offCtx.fill();
        }

        layer.strokes.forEach((s) => {
          offCtx.globalCompositeOperation = s.isEraser
            ? "destination-out"
            : "source-over";
          offCtx.beginPath();
          offCtx.lineWidth = s.size;
          offCtx.strokeStyle = s.isEraser
            ? "#000"
            : isHair && conf.fillHair
              ? conf.hairColor
              : "#1a1a1a";
          offCtx.moveTo(s.points[0].x, s.points[0].y);
          for (let i = 1; i < s.points.length; i++)
            offCtx.lineTo(s.points[i].x, s.points[i].y);
          offCtx.stroke();

          if (layer.mirrored) {
            offCtx.beginPath();
            offCtx.moveTo(600 - s.points[0].x, s.points[0].y);
            for (let i = 1; i < s.points.length; i++)
              offCtx.lineTo(600 - s.points[i].x, s.points[i].y);
            offCtx.stroke();
          }
        });
        offCtx.restore();
      });

      if (
        renderActiveStroke &&
        currentStroke.length > 0 &&
        activeMode === "freehand"
      ) {
        const activeLayer = freehandLayers.find(
          (l) => l.id === selectedLayerId,
        );
        const isMirrored = activeLayer ? activeLayer.mirrored : true;
        const isHair = getTag(activeLayer?.name || "") === "hair";

        offCtx.globalCompositeOperation =
          freehandTool === "eraser" ? "destination-out" : "source-over";
        offCtx.beginPath();
        offCtx.lineWidth = brushSize;
        offCtx.strokeStyle =
          freehandTool === "eraser"
            ? "#000"
            : isHair && conf.fillHair
              ? conf.hairColor
              : "#3b82f6";

        offCtx.moveTo(currentStroke[0].x, currentStroke[0].y);
        for (let i = 1; i < currentStroke.length; i++)
          offCtx.lineTo(currentStroke[i].x, currentStroke[i].y);
        offCtx.stroke();

        if (isMirrored) {
          offCtx.beginPath();
          offCtx.moveTo(600 - currentStroke[0].x, currentStroke[0].y);
          for (let i = 1; i < currentStroke.length; i++)
            offCtx.lineTo(600 - currentStroke[i].x, currentStroke[i].y);
          offCtx.stroke();
        }

        if (!freehandTool.includes("eraser") && freehandSnapEnabled) {
          const lastPoint = currentStroke[currentStroke.length - 1];
          if (lastPoint.x === 300) {
            ctx.beginPath();
            ctx.arc(lastPoint.x, lastPoint.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = "#22c55e";
            ctx.strokeStyle = "#14532d";
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();
          }
        }
      }
    };

    // 1. Draw STATIC BODY
    bodyCurves.forEach(drawCurve);

    const isDrawingBody =
      activeMode === "freehand" &&
      (!selectedLayerId ||
        isBodyPart(
          freehandLayers.find((l) => l.id === selectedLayerId)?.name || "",
        ));
    renderAccessoryGroupToOffscreen(
      freehandLayers.filter((l) => isBodyPart(l.name)),
      isDrawingBody,
    );
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(offscreenCanvasRef.current, 0, 0);

    // 2. Draw DYNAMIC HEAD
    ctx.save();
    const pivotX = 300;
    const pivotY = 330;
    ctx.translate(pivotX, pivotY);
    ctx.rotate((pup.headTilt * Math.PI) / 180);
    ctx.translate(-pivotX, -pivotY);

    headCurves.forEach(drawCurve);

    // Eyes
    const fX = pup.lookX;
    const fY = pup.lookY;
    const cx = 300;
    const cy = 200 + conf.eyeYOffset;
    const eDist = conf.eyeSpacing;
    if (pup.isBlinking) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.moveTo(cx - eDist - 15, cy);
      ctx.quadraticCurveTo(cx - eDist, cy + 5, cx - eDist + 15, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + eDist - 15, cy);
      ctx.quadraticCurveTo(cx + eDist, cy + 5, cx + eDist + 15, cy);
      ctx.stroke();
    } else {
      if (conf.showSclera) {
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx - eDist, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + eDist, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.arc(cx - eDist + fX, cy + fY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + eDist + fX, cy + fY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx - eDist + fX - 2, cy + fY - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + eDist + fX - 2, cy + fY - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mouth
    ctx.fillStyle = "#780000";
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    const mouthCenterY = 260 + conf.mouthYOffset;
    const mX = conf.mouthXOffset;
    const mW = conf.mouthWidth / 2;
    ctx.moveTo(cx - mW + mX, mouthCenterY);
    ctx.quadraticCurveTo(cx + mX, mouthCenterY - 5, cx + mW + mX, mouthCenterY);
    ctx.bezierCurveTo(
      cx + mW + mX,
      mouthCenterY + pup.mouthOpen,
      cx - mW + mX,
      mouthCenterY + pup.mouthOpen,
      cx - mW + mX,
      mouthCenterY,
    );
    ctx.fill();
    ctx.stroke();

    // Head Accessories
    const isDrawingHead =
      activeMode === "freehand" &&
      (!selectedLayerId ||
        !isBodyPart(
          freehandLayers.find((l) => l.id === selectedLayerId)?.name || "",
        ));
    renderAccessoryGroupToOffscreen(
      freehandLayers.filter((l) => !isBodyPart(l.name)),
      isDrawingHead,
    );

    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(offscreenCanvasRef.current, 0, 0);

    ctx.restore();
  }, []);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderCanvas();
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [renderCanvas]);

  // --- DRAWING HANDLERS ---
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const coords = {
      x: Math.round((e.clientX - rect.left) * (600 / rect.width)),
      y: Math.round((e.clientY - rect.top) * (600 / rect.height)),
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (activeMode === "freehand") {
      setIsDrawing(true);
      setCurrentStroke([coords]);
    } else {
      if (!selectedLayerId) return;
      const { curves } = appState.avatarData;
      const curve = curves.find((c) => c.id === selectedLayerId);
      if (!curve) return;
      const nodes = [
        { key: "p0", pt: curve.p0 },
        { key: "p1", pt: curve.p1 },
      ];
      if (curve.type !== "line") nodes.push({ key: "cp1", pt: curve.cp1! });
      if (curve.type === "bezier") nodes.push({ key: "cp2", pt: curve.cp2! });
      for (let n of nodes) {
        if (Math.hypot(n.pt.x - coords.x, n.pt.y - coords.y) <= 12) {
          setActiveNode({ curveId: curve.id, nodeKey: n.key });
          break;
        }
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    let tx = Math.round((e.clientX - rect.left) * (600 / rect.width));
    let ty = Math.round((e.clientY - rect.top) * (600 / rect.height));

    if (activeMode === "freehand" && isDrawing) {
      if (
        freehandSnapEnabled &&
        Math.abs(tx - 300) < 10 &&
        freehandTool !== "eraser"
      )
        tx = 300;
      setCurrentStroke((p) =>
        Math.hypot(tx - p[p.length - 1].x, ty - p[p.length - 1].y) > 3 ||
        tx === 300
          ? [...p, { x: tx, y: ty }]
          : p,
      );
    } else if (activeMode === "vector" && activeNode) {
      if (Math.abs(tx - 300) < 10) tx = 300;
      const newState = {
        ...appState,
        avatarData: {
          ...appState.avatarData,
          curves: appState.avatarData.curves.map((c) =>
            c.id === activeNode.curveId
              ? { ...c, [activeNode.nodeKey]: { x: tx, y: ty } }
              : c,
          ),
        },
      };
      setAppState(newState);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    if (activeMode === "freehand" && isDrawing) {
      setIsDrawing(false);
      if (currentStroke.length > 1) {
        const s: Stroke = {
          points: currentStroke,
          size: brushSize,
          isEraser: freehandTool === "eraser",
        };
        const { freehandLayers } = appState.avatarData;
        let newState;
        if (
          selectedLayerId &&
          freehandLayers.some((l) => l.id === selectedLayerId)
        ) {
          newState = {
            ...appState,
            avatarData: {
              ...appState.avatarData,
              freehandLayers: freehandLayers.map((l) =>
                l.id === selectedLayerId
                  ? { ...l, strokes: [...l.strokes, s] }
                  : l,
              ),
            },
          };
        } else {
          const newId = Date.now().toString();
          const newLayer: FreehandLayer = {
            id: newId,
            name: `Accessory --head`,
            mirrored: true,
            strokes: [s],
            transform: { x: 0, y: 0, scale: 1, rotation: 0 },
          };
          newState = {
            ...appState,
            avatarData: {
              ...appState.avatarData,
              freehandLayers: [...freehandLayers, newLayer],
            },
            activeAccessories: {
              ...appState.activeAccessories,
              head: newLayer.id,
            },
          };
          setSelectedLayerId(newId);
        }
        setAppState(newState);
        saveHistory(newState);
      }
      setCurrentStroke([]);
    } else if (activeNode) {
      setActiveNode(null);
      saveHistory(appState);
    }
  };

  // --- STARTUP MODAL ---
  if (showStartup) {
    return (
      <StartupModal
        onImport={() => {
          setShowStartup(false);
          setShowImport(true);
        }}
        onDefault={() => setShowStartup(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-200 font-sans text-slate-800 overflow-hidden selection:bg-blue-100">
      <Navbar
        title="Avatar Studio"
        badge="V3"
        leftSidebarOpen={leftSidebarOpen}
        onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
        rightSidebarOpen={rightSidebarOpen}
        onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
        centerContent={
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={historyIdx <= 0}
              className="p-2 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 rounded-lg transition-colors"
              title="Undo"
            >
              <IconUndo />
            </button>
            <button
              onClick={redo}
              disabled={historyIdx >= history.length - 1}
              className="p-2 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 rounded-lg transition-colors"
              title="Redo"
            >
              <IconRedo />
            </button>
          </div>
        }
        rightContent={
          <button
            onClick={handleNextPhase}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors shadow-sm"
          >
            Next <IconNext />
          </button>
        }
        menuItems={[
          {
            label: "Import Blueprint",
            icon: <IconImport />,
            onClick: () => setShowImport(true),
          },
          {
            label: "Export Player Script",
            icon: <IconExport />,
            onClick: handleExportAction,
          },
        ]}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <LeftSidebar
          open={leftSidebarOpen}
          leftTab={leftTab}
          setLeftTab={setLeftTab}
          appState={appState}
          setAccessory={setAccessory}
          selectShopAsset={selectShopAsset}
          setCustomImportCategory={setCustomImportCategory}
          setShowImport={setShowImport}
          handleConfigChange={handleConfigChange}
          handleTransformChange={handleTransformChange}
          handleSliderCommit={handleSliderCommit}
          removeLayer={removeLayer}
        />

        {/* CENTER WORKSPACE */}
        <div className="flex-1 flex flex-col items-center justify-center relative p-4 overflow-hidden">
          {(leftSidebarOpen || rightSidebarOpen) && (
            <div
              className="absolute inset-0 z-10 lg:hidden bg-slate-900/20 backdrop-blur-sm"
              onClick={() => {
                setLeftSidebarOpen(false);
                setRightSidebarOpen(false);
              }}
            ></div>
          )}
          <div className="bg-white rounded-[2rem] shadow-2xl p-2 w-full max-w-[600px] aspect-square relative z-10 ring-1 ring-slate-900/5 transition-transform hover:scale-[1.01] duration-300">
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              className="w-full h-full object-contain rounded-[1.5rem]"
            />
          </div>
        </div>

        <RightSidebar
          open={rightSidebarOpen}
          appState={appState}
          isListening={isListening}
          puppeteer={puppeteer}
          toggleAudio={toggleAudio}
          handleConfigChange={handleConfigChange}
          handleSliderCommit={handleSliderCommit}
        />
      </div>

      {showImport && (
        <ImportModal
          customImportCategory={customImportCategory}
          importCode={importCode}
          setImportCode={setImportCode}
          onClose={() => {
            setShowImport(false);
            setCustomImportCategory(null);
            setImportCode("");
          }}
          onImport={handleImportAction}
        />
      )}

      {showExport && (
        <ExportModal
          exportPayload={exportPayload}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}

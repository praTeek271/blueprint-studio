"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Point, Curve, Stroke, FreehandLayer } from "@/components/blueprint-studio/types";
import { INITIAL_BASE_FACE } from "@/components/blueprint-studio/data";
import { LeftSidebar } from "@/components/blueprint-studio/LeftSidebar";
import { ImportModal } from "@/components/blueprint-studio/ImportModal";
import { ExportModal } from "@/components/blueprint-studio/ExportModal";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 600;
      offscreenCanvasRef.current = canvas;
    }
  }, []);

  // App Modes & UI Accordions
  const [activeMode, setActiveMode] = useState<"vector" | "freehand">("vector");
  const [gridVisible, setGridVisible] = useState(true);

  // Reference Image State
  const [referenceImg, setReferenceImg] = useState<HTMLImageElement | null>(null);
  const [refConfig, setRefConfig] = useState({ opacity: 0.3, x: 0, y: 0, scale: 1 });

  // Vector State
  const [curves, setCurves] = useState<Curve[]>(INITIAL_BASE_FACE);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<{ curveId: string; nodeKey: string } | null>(null);

  // Freehand State
  const [freehandLayers, setFreehandLayers] = useState<FreehandLayer[]>([]);
  const [checkedFreehandIds, setCheckedFreehandIds] = useState<string[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [freehandTool, setFreehandTool] = useState<"brush" | "eraser">("brush");
  const [brushSize, setBrushSize] = useState(3);
  const [freehandSnapEnabled, setFreehandSnapEnabled] = useState(true);
  const [smoothing] = useState(3);

  // UI State
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [exportedCode, setExportedCode] = useState("");
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importCode, setImportCode] = useState("");

  const handleModeChange = (mode: "vector" | "freehand") => {
    setActiveMode(mode);
    setSelectedLayerId(null);
  };

  // ==========================================
  // ASSET STORE (Vector Curves)
  // ==========================================
  const addCurve = (type: "bezier" | "quadratic" | "line") => {
    const id = Date.now().toString();
    let newCurve: Curve;

    if (type === "bezier") {
      newCurve = {
        id, type, name: "Bezier Curve", mirrored: true,
        p0: { x: 250, y: 200 }, cp1: { x: 200, y: 200 }, cp2: { x: 200, y: 300 }, p1: { x: 250, y: 300 },
      };
    } else if (type === "quadratic") {
      newCurve = {
        id, type, name: "Quadratic Curve", mirrored: true,
        p0: { x: 250, y: 200 }, cp1: { x: 200, y: 250 }, p1: { x: 250, y: 300 },
      };
    } else {
      newCurve = {
        id, type, name: "Straight Line", mirrored: true,
        p0: { x: 250, y: 200 }, p1: { x: 250, y: 300 },
      };
    }

    setCurves((prev) => [...prev, newCurve]);
    setSelectedLayerId(id);
    setActiveMode("vector");
  };

  const removeLayer = (id: string, type: "vector" | "freehand") => {
    if (type === "vector") setCurves((prev) => prev.filter((c) => c.id !== id));
    if (type === "freehand") {
      setFreehandLayers((prev) => prev.filter((p) => p.id !== id));
      setCheckedFreehandIds((prev) => prev.filter((cId) => cId !== id));
    }
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const updateLayerName = (id: string, newName: string, type: "vector" | "freehand") => {
    if (type === "vector")
      setCurves((prev) => prev.map((c) => (c.id === id ? { ...c, name: newName } : c)));
    if (type === "freehand")
      setFreehandLayers((prev) => prev.map((p) => (p.id === id ? { ...p, name: newName } : p)));
  };

  const toggleLayerMirror = (id: string, type: "vector" | "freehand") => {
    if (type === "vector")
      setCurves((prev) => prev.map((c) => (c.id === id ? { ...c, mirrored: !c.mirrored } : c)));
    if (type === "freehand")
      setFreehandLayers((prev) => prev.map((p) => (p.id === id ? { ...p, mirrored: !p.mirrored } : p)));
  };

  const groupSelectedLayers = () => {
    if (checkedFreehandIds.length < 2) return;
    const layersToGroup = freehandLayers.filter((l) => checkedFreehandIds.includes(l.id));
    const combinedStrokes = layersToGroup.flatMap((l) => l.strokes);
    const newId = Date.now().toString();
    const newLayer: FreehandLayer = {
      id: newId, name: "Grouped Accessory", mirrored: layersToGroup[0].mirrored, strokes: combinedStrokes,
    };
    setFreehandLayers((prev) => [...prev.filter((l) => !checkedFreehandIds.includes(l.id)), newLayer]);
    setCheckedFreehandIds([]);
    setSelectedLayerId(newId);
  };

  // ==========================================
  // RENDERING ENGINE
  // ==========================================
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !offscreenCanvasRef.current) return;
    const ctx = canvas.getContext("2d");
    const offCtx = offscreenCanvasRef.current.getContext("2d");
    if (!ctx || !offCtx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (referenceImg) {
      ctx.save();
      ctx.globalAlpha = refConfig.opacity;
      const baseScale = Math.min(600 / referenceImg.width, 600 / referenceImg.height);
      const w = referenceImg.width * baseScale * refConfig.scale;
      const h = referenceImg.height * baseScale * refConfig.scale;
      const x = (600 - w) / 2 + refConfig.x;
      const y = (600 - h) / 2 + refConfig.y;
      ctx.drawImage(referenceImg, x, y, w, h);
      ctx.restore();
    }

    if (gridVisible) {
      ctx.lineWidth = 1;
      for (let i = 0; i <= 600; i += 20) {
        ctx.strokeStyle = i === 300 ? "rgba(239, 68, 68, 0.4)" : "rgba(226, 232, 240, 0.5)";
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 600); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(600, i); ctx.stroke();
      }
    }

    const checkNodeSnap = (pt: Point, skipCurveId: string) => {
      let matchCount = 0;
      curves.forEach((c) => {
        if (c.p0.x === pt.x && c.p0.y === pt.y) matchCount++;
        if (c.p1.x === pt.x && c.p1.y === pt.y) matchCount++;
        if (c.mirrored) {
          if (600 - c.p0.x === pt.x && c.p0.y === pt.y) matchCount++;
          if (600 - c.p1.x === pt.x && c.p1.y === pt.y) matchCount++;
        }
      });
      freehandLayers.forEach((layer) => {
        layer.strokes.forEach((stroke) => {
          if (stroke.points.length > 0) {
            if (stroke.points[0].x === pt.x && stroke.points[0].y === pt.y) matchCount++;
            if (stroke.points[stroke.points.length - 1].x === pt.x && stroke.points[stroke.points.length - 1].y === pt.y) matchCount++;
          }
        });
      });
      return skipCurveId === "live_sketch" ? matchCount > 0 : matchCount > 1;
    };

    offCtx.clearRect(0, 0, 600, 600);
    const drawStroke = (pathArray: Point[], size: number, isEraser: boolean, isLive = false, isMirrored = false) => {
      if (pathArray.length < 2) return;
      offCtx.beginPath();
      offCtx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
      const strokeAlpha = activeMode === "freehand" || isLive ? 1.0 : 0.4;
      offCtx.strokeStyle = isEraser ? "#000" : isLive ? "#3b82f6" : `rgba(30, 41, 59, ${strokeAlpha})`;
      offCtx.lineWidth = size;
      offCtx.lineCap = "round";
      offCtx.lineJoin = "round";
      offCtx.moveTo(pathArray[0].x, pathArray[0].y);
      for (let i = 1; i < pathArray.length; i++) offCtx.lineTo(pathArray[i].x, pathArray[i].y);
      offCtx.stroke();

      if (isMirrored) {
        offCtx.beginPath();
        offCtx.strokeStyle = isLive ? "#8b5cf6" : `rgba(30, 41, 59, ${strokeAlpha * 0.7})`;
        offCtx.moveTo(600 - pathArray[0].x, pathArray[0].y);
        for (let i = 1; i < pathArray.length; i++) offCtx.lineTo(600 - pathArray[i].x, pathArray[i].y);
        offCtx.stroke();
      }

      if (isLive && !isEraser && freehandSnapEnabled) {
        const lastPoint = pathArray[pathArray.length - 1];
        const isCenter = lastPoint.x === 300;
        const isNode = checkNodeSnap(lastPoint, "live_sketch");
        if (isCenter || isNode) {
          ctx.beginPath();
          ctx.arc(lastPoint.x, lastPoint.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = isCenter ? "#22c55e" : "#f59e0b";
          ctx.strokeStyle = isCenter ? "#14532d" : "#78350f";
          ctx.lineWidth = 2;
          ctx.fill(); ctx.stroke();
        }
      }
    };

    freehandLayers.forEach((layer) =>
      layer.strokes.forEach((s) => drawStroke(s.points, s.size, s.isEraser, false, layer.mirrored)),
    );
    if (currentStroke.length > 0 && activeMode === "freehand") {
      const activeLayer = freehandLayers.find((l) => l.id === selectedLayerId);
      drawStroke(currentStroke, brushSize, freehandTool === "eraser", true, activeLayer ? activeLayer.mirrored : true);
    }

    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(offscreenCanvasRef.current, 0, 0);

    curves.forEach((curve) => {
      const isSelected = selectedLayerId === curve.id && activeMode === "vector";
      const vectorAlpha = activeMode === "vector" ? 1.0 : 0.4;
      ctx.beginPath();
      ctx.strokeStyle = isSelected ? "#2563eb" : `rgba(15, 23, 42, ${vectorAlpha})`;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.moveTo(curve.p0.x, curve.p0.y);
      if (curve.type === "bezier") ctx.bezierCurveTo(curve.cp1!.x, curve.cp1!.y, curve.cp2!.x, curve.cp2!.y, curve.p1.x, curve.p1.y);
      else if (curve.type === "quadratic") ctx.quadraticCurveTo(curve.cp1!.x, curve.cp1!.y, curve.p1.x, curve.p1.y);
      else if (curve.type === "line") ctx.lineTo(curve.p1.x, curve.p1.y);
      ctx.stroke();

      if (curve.mirrored) {
        ctx.beginPath();
        ctx.strokeStyle = isSelected ? `rgba(37, 99, 235, ${0.4 * vectorAlpha})` : `rgba(15, 23, 42, ${0.3 * vectorAlpha})`;
        ctx.moveTo(600 - curve.p0.x, curve.p0.y);
        if (curve.type === "bezier") ctx.bezierCurveTo(600 - curve.cp1!.x, curve.cp1!.y, 600 - curve.cp2!.x, curve.cp2!.y, 600 - curve.p1.x, curve.p1.y);
        else if (curve.type === "quadratic") ctx.quadraticCurveTo(600 - curve.cp1!.x, curve.cp1!.y, 600 - curve.p1.x, curve.p1.y);
        else if (curve.type === "line") ctx.lineTo(600 - curve.p1.x, curve.p1.y);
        ctx.stroke();
      }

      if (isSelected && activeMode === "vector") {
        ctx.lineWidth = 1;
        const drawNode = (point: Point, isControl = false, nodeKey: string) => {
          const isNodeActive = activeNode?.curveId === curve.id && activeNode?.nodeKey === nodeKey;
          const isCenterSnapped = point.x === 300 && curve.mirrored;
          const isNodeSnapped = !isControl && checkNodeSnap(point, curve.id);
          ctx.beginPath();
          ctx.arc(point.x, point.y, isNodeActive ? 6 : 5, 0, Math.PI * 2);
          if (isCenterSnapped) {
            ctx.fillStyle = isNodeActive ? "#22c55e" : "#86efac";
            ctx.strokeStyle = "#14532d";
          } else if (isNodeSnapped) {
            ctx.fillStyle = isNodeActive ? "#f59e0b" : "#fcd34d";
            ctx.strokeStyle = "#78350f";
          } else {
            ctx.fillStyle = isControl
              ? isNodeActive ? "#ef4444" : "#fca5a5"
              : isNodeActive ? "#3b82f6" : "#93c5fd";
            ctx.strokeStyle = isControl ? "#b91c1c" : "#1d4ed8";
          }
          ctx.fill(); ctx.stroke();
        };
        const drawGuideline = (pA: Point, pB: Point) => {
          ctx.beginPath(); ctx.strokeStyle = "rgba(239, 68, 68, 0.5)"; ctx.setLineDash([4, 4]);
          ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.stroke(); ctx.setLineDash([]);
        };
        if (curve.type === "bezier") {
          drawGuideline(curve.p0, curve.cp1!); drawGuideline(curve.p1, curve.cp2!);
          drawNode(curve.cp1!, true, "cp1"); drawNode(curve.cp2!, true, "cp2");
        } else if (curve.type === "quadratic") {
          drawGuideline(curve.p0, curve.cp1!); drawGuideline(curve.p1, curve.cp1!);
          drawNode(curve.cp1!, true, "cp1");
        }
        drawNode(curve.p0, false, "p0"); drawNode(curve.p1, false, "p1");
      }
    });
  }, [
    curves, freehandLayers, currentStroke, brushSize, freehandTool, freehandSnapEnabled,
    selectedLayerId, activeNode, gridVisible, referenceImg, refConfig, activeMode,
  ]);

  useEffect(() => {
    let animId: number;
    const loop = () => { renderCanvas(); animId = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [renderCanvas]);

  // ==========================================
  // DRAWING HANDLERS
  // ==========================================
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    const coords = {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (activeMode === "freehand") {
      setIsDrawing(true);
      setCurrentStroke([coords]);
    } else {
      if (!selectedLayerId) return;
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
    const coords = {
      x: Math.round((e.clientX - rect.left) * (600 / rect.width)),
      y: Math.round((e.clientY - rect.top) * (600 / rect.height)),
    };
    let tx = coords.x;
    let ty = coords.y;

    if (
      activeMode === "vector" ||
      (activeMode === "freehand" && freehandTool !== "eraser" && freehandSnapEnabled)
    ) {
      const snapTargets: Point[] = [];
      curves.forEach((c) => {
        if (!(activeNode?.curveId === c.id && activeNode.nodeKey === "p0")) snapTargets.push(c.p0);
        if (!(activeNode?.curveId === c.id && activeNode.nodeKey === "p1")) snapTargets.push(c.p1);
        if (c.mirrored) snapTargets.push({ x: 600 - c.p0.x, y: c.p0.y }, { x: 600 - c.p1.x, y: c.p1.y });
      });
      freehandLayers.forEach((l) =>
        l.strokes.forEach((s) => {
          snapTargets.push(s.points[0], s.points[s.points.length - 1]);
          if (l.mirrored)
            snapTargets.push(
              { x: 600 - s.points[0].x, y: s.points[0].y },
              { x: 600 - s.points[s.points.length - 1].x, y: s.points[s.points.length - 1].y },
            );
        }),
      );
      let best = 12;
      let hit: Point | null = null;
      snapTargets.forEach((p) => {
        const d = Math.hypot(p.x - tx, p.y - ty);
        if (d < best) { best = d; hit = p; }
      });
      if (hit) {
        tx = (hit as Point).x;
        ty = (hit as Point).y;
      } else if (Math.abs(tx - 300) < 10) {
        tx = 300;
      }
    }

    if (activeMode === "freehand" && isDrawing) {
      setCurrentStroke((p) =>
        Math.hypot(tx - p[p.length - 1].x, ty - p[p.length - 1].y) > smoothing || tx === 300
          ? [...p, { x: tx, y: ty }]
          : p,
      );
    } else if (activeMode === "vector" && activeNode) {
      setCurves((prev) =>
        prev.map((c) =>
          c.id === activeNode.curveId ? { ...c, [activeNode.nodeKey]: { x: tx, y: ty } } : c,
        ),
      );
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    if (activeMode === "freehand" && isDrawing) {
      setIsDrawing(false);
      if (currentStroke.length > 1) {
        const s: Stroke = { points: currentStroke, size: brushSize, isEraser: freehandTool === "eraser" };
        if (selectedLayerId && freehandLayers.some((l) => l.id === selectedLayerId))
          setFreehandLayers((p) =>
            p.map((l) => (l.id === selectedLayerId ? { ...l, strokes: [...l.strokes, s] } : l)),
          );
        else {
          const nid = Date.now().toString();
          setFreehandLayers((p) => [
            ...p,
            { id: nid, name: `Accessory ${p.length + 1}`, mirrored: true, strokes: [s] },
          ]);
          setSelectedLayerId(nid);
        }
      }
      setCurrentStroke([]);
    } else setActiveNode(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.src = ev.target?.result as string;
      img.onload = () => setReferenceImg(img);
    };
    reader.readAsDataURL(file);
  };

  // ==========================================
  // IMPORT / EXPORT
  // ==========================================
  const generateExport = () => {
    let jsCode = `// --- AVATAR MESH & ACCESSORIES ---\n`;
    if (curves.length > 0) {
      jsCode += `// --- 1. VECTOR RIG ---\nctx.beginPath(); ctx.lineWidth = 3; ctx.strokeStyle = '#1a1a1a';\n`;
      curves.forEach((c) => {
        jsCode += `// ${c.name}\nctx.moveTo(${c.p0.x}, ${c.p0.y});\n`;
        if (c.type === "bezier") jsCode += `ctx.bezierCurveTo(${c.cp1!.x}, ${c.cp1!.y}, ${c.cp2!.x}, ${c.cp2!.y}, ${c.p1.x}, ${c.p1.y});\n`;
        else if (c.type === "quadratic") jsCode += `ctx.quadraticCurveTo(${c.cp1!.x}, ${c.cp1!.y}, ${c.p1.x}, ${c.p1.y});\n`;
        else jsCode += `ctx.lineTo(${c.p1.x}, ${c.p1.y});\n`;
        jsCode += `ctx.stroke();\n`;
        if (c.mirrored) {
          jsCode += `ctx.moveTo(${600 - c.p0.x}, ${c.p0.y});\n`;
          if (c.type === "bezier") jsCode += `ctx.bezierCurveTo(${600 - c.cp1!.x}, ${c.cp1!.y}, ${600 - c.cp2!.x}, ${c.cp2!.y}, ${600 - c.p1.x}, ${c.p1.y});\n`;
          else if (c.type === "quadratic") jsCode += `ctx.quadraticCurveTo(${600 - c.cp1!.x}, ${c.cp1!.y}, ${600 - c.p1.x}, ${c.p1.y});\n`;
          else jsCode += `ctx.lineTo(${600 - c.p1.x}, ${c.p1.y});\n`;
          jsCode += `ctx.stroke();\n`;
        }
      });
    }
    if (freehandLayers.length > 0) {
      jsCode += `\n// --- 2. ACCESSORIES ---\n`;
      freehandLayers.forEach((l) => {
        jsCode += `// ${l.name}\n`;
        l.strokes.forEach((s) => {
          jsCode += `ctx.lineWidth = ${s.size}; ${s.isEraser ? "ctx.globalCompositeOperation = 'destination-out';" : ""}\nctx.beginPath(); ctx.moveTo(${s.points[0].x}, ${s.points[0].y});\n`;
          for (let i = 1; i < s.points.length; i++) jsCode += `ctx.lineTo(${s.points[i].x}, ${s.points[i].y});\n`;
          jsCode += `ctx.stroke();\n`;
          if (l.mirrored) {
            jsCode += `ctx.beginPath(); ctx.moveTo(${600 - s.points[0].x}, ${s.points[0].y});\n`;
            for (let i = 1; i < s.points.length; i++) jsCode += `ctx.lineTo(${600 - s.points[i].x}, ${s.points[i].y});\n`;
            jsCode += `ctx.stroke();\n`;
          }
          if (s.isEraser) jsCode += `ctx.globalCompositeOperation = 'source-over';\n`;
        });
      });
    }
    jsCode += `\n// --- WORKSPACE STATE (VERSION 1.1) ---\n// STATE_JSON:${JSON.stringify({ curves, freehandLayers })}\n`;
    setExportedCode(jsCode);
    setShowExport(true);
  };

  const handleImportAction = () => {
    const match = importCode.match(/\/\/ STATE_JSON:(.+)/);
    if (match && match[1]) {
      try {
        const s = JSON.parse(match[1].trim());
        if (s.curves) setCurves(s.curves);
        if (s.freehandLayers) setFreehandLayers(s.freehandLayers);
        setSelectedLayerId(null);
        setActiveNode(null);
        setShowImport(false);
        setImportCode("");
        alert("Workspace restored!");
      } catch (e) {
        alert("Failed to restore state.");
      }
    } else {
      // --- LEGACY PARSER ENGINE ---
      try {
        const parsedCurves: Curve[] = [];
        const parsedLayers: FreehandLayer[] = [];
        let currentSection = "none";
        let currentName = "Legacy Shape";
        let lastMoveTo: Point | null = null;

        let currentLayer: FreehandLayer | null = null;
        let currentStrokeLocal: Stroke | null = null;
        let currentSize = 3;

        const parseCoord = (str: string) => {
          if (str.includes("-")) { const parts = str.split("-"); return parseInt(parts[0]) - parseInt(parts[1]); }
          if (str.includes("+")) { const parts = str.split("+"); return parseInt(parts[0]) + parseInt(parts[1]); }
          return parseInt(str.trim(), 10);
        };

        const lines = importCode.split("\n");
        for (let line of lines) {
          line = line.trim();
          if (!line) continue;

          if (line.includes("1. DYNAMIC VECTOR") || line.includes("1. VECTOR RIG")) { currentSection = "vector"; continue; }
          if (line.includes("2. STATIC ACCESSORIES") || line.includes("2. ACCESSORIES")) { currentSection = "freehand"; continue; }

          if (line.startsWith("//") && !line.includes("---")) {
            currentName = line.replace("//", "").trim();
            if (currentSection === "freehand") {
              if (currentLayer && currentStrokeLocal && currentStrokeLocal.points.length > 0) currentLayer.strokes.push(currentStrokeLocal);
              if (currentLayer && currentLayer.strokes.length > 0) parsedLayers.push(currentLayer);
              currentLayer = { id: Date.now() + Math.random().toString(), name: currentName, mirrored: false, strokes: [] };
              currentStrokeLocal = null;
            }
            continue;
          }

          const sizeMatch = line.match(/lineWidth\s*=\s*(\d+)/);
          if (sizeMatch) currentSize = parseInt(sizeMatch[1], 10);

          const moveMatch = line.match(/moveTo\(([^,]+),\s*([^)]+)\)/);
          if (moveMatch) {
            const pt = { x: parseCoord(moveMatch[1]), y: parseCoord(moveMatch[2]) };
            if (currentSection === "vector") { lastMoveTo = pt; }
            else if (currentSection === "freehand") {
              if (currentStrokeLocal && currentStrokeLocal.points.length > 0 && currentLayer) currentLayer.strokes.push(currentStrokeLocal);
              currentStrokeLocal = { points: [pt], size: currentSize, isEraser: false };
              if (!currentLayer) currentLayer = { id: Date.now() + Math.random().toString(), name: currentName, mirrored: false, strokes: [] };
            }
          }

          if (currentSection === "vector" && lastMoveTo) {
            const bezMatch = line.match(/bezierCurveTo\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
            if (bezMatch) {
              parsedCurves.push({ id: Date.now() + Math.random().toString(), type: "bezier", name: currentName, mirrored: false, p0: lastMoveTo, cp1: { x: parseCoord(bezMatch[1]), y: parseCoord(bezMatch[2]) }, cp2: { x: parseCoord(bezMatch[3]), y: parseCoord(bezMatch[4]) }, p1: { x: parseCoord(bezMatch[5]), y: parseCoord(bezMatch[6]) } });
              lastMoveTo = null;
            }

            const quadMatch = line.match(/quadraticCurveTo\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
            if (quadMatch && lastMoveTo) {
              parsedCurves.push({ id: Date.now() + Math.random().toString(), type: "quadratic", name: currentName, mirrored: false, p0: lastMoveTo, cp1: { x: parseCoord(quadMatch[1]), y: parseCoord(quadMatch[2]) }, p1: { x: parseCoord(quadMatch[3]), y: parseCoord(quadMatch[4]) } });
              lastMoveTo = null;
            }

            const lineMatch = line.match(/lineTo\(([^,]+),\s*([^)]+)\)/);
            if (lineMatch && lastMoveTo) {
              parsedCurves.push({ id: Date.now() + Math.random().toString(), type: "line", name: currentName, mirrored: false, p0: lastMoveTo, p1: { x: parseCoord(lineMatch[1]), y: parseCoord(lineMatch[2]) } });
              lastMoveTo = null;
            }
          }

          if (currentSection === "freehand" && currentStrokeLocal) {
            const lineMatch = line.match(/lineTo\(([^,]+),\s*([^)]+)\)/);
            if (lineMatch) currentStrokeLocal.points.push({ x: parseCoord(lineMatch[1]), y: parseCoord(lineMatch[2]) });
          }
        }

        if (currentLayer && currentStrokeLocal && currentStrokeLocal.points.length > 0) currentLayer.strokes.push(currentStrokeLocal);
        if (currentLayer && currentLayer.strokes.length > 0) parsedLayers.push(currentLayer);

        if (parsedCurves.length > 0 || parsedLayers.length > 0) {
          setCurves(parsedCurves);
          setFreehandLayers(parsedLayers);
          setSelectedLayerId(null);
          setActiveNode(null);
          setShowImport(false);
          setImportCode("");
          alert("Legacy workspace successfully restored!");
        } else {
          alert("No recognizable format found in legacy code.");
        }
      } catch (e) {
        alert("Failed to parse legacy code.");
        console.error(e);
      }
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans text-slate-800">
      <LeftSidebar
        activeMode={activeMode}
        handleModeChange={handleModeChange}
        gridVisible={gridVisible}
        setGridVisible={setGridVisible}
        referenceImg={referenceImg}
        refConfig={refConfig}
        setRefConfig={setRefConfig}
        handleImageUpload={handleImageUpload}
        addCurve={addCurve}
        freehandTool={freehandTool}
        setFreehandTool={setFreehandTool}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        freehandSnapEnabled={freehandSnapEnabled}
        setFreehandSnapEnabled={setFreehandSnapEnabled}
        selectedLayerId={selectedLayerId}
        setSelectedLayerId={setSelectedLayerId}
        curves={curves}
        freehandLayers={freehandLayers}
        editingNameId={editingNameId}
        setEditingNameId={setEditingNameId}
        updateLayerName={updateLayerName}
        toggleLayerMirror={toggleLayerMirror}
        removeLayer={removeLayer}
        checkedFreehandIds={checkedFreehandIds}
        setCheckedFreehandIds={setCheckedFreehandIds}
        groupSelectedLayers={groupSelectedLayers}
        setShowImport={setShowImport}
        generateExport={generateExport}
      />

      {/* CENTER WORKSPACE */}
      <div className="flex-1 bg-slate-200/50 flex flex-col items-center justify-center relative p-4 overflow-hidden">
        <div
          className="bg-white rounded-xl shadow-2xl p-1 w-full max-w-[600px] aspect-square relative z-10 ring-1 ring-slate-900/5"
          style={{ cursor: activeMode === "freehand" ? "crosshair" : "default" }}
        >
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            className="w-full h-full object-contain rounded-lg"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ touchAction: "none" }}
          />
        </div>
        <div className="mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex gap-3 flex-wrap justify-center">
          {activeMode === "vector" ? (
            <>
              <span><span className="text-blue-500 text-lg leading-none">●</span> Anchors</span>
              <span><span className="text-red-500 text-lg leading-none">●</span> Controls</span>
              <span><span className="text-green-500 text-lg leading-none">●</span> Center Snap</span>
              <span><span className="text-amber-500 text-lg leading-none">●</span> Node Snap</span>
            </>
          ) : (
            <span>Sketch accessory layers. {freehandSnapEnabled ? "Snapping is ON." : "Snapping is OFF."}</span>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showImport && (
        <ImportModal
          importCode={importCode}
          setImportCode={setImportCode}
          onClose={() => { setShowImport(false); setImportCode(""); }}
          onImport={handleImportAction}
        />
      )}

      {showExport && (
        <ExportModal
          exportedCode={exportedCode}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}

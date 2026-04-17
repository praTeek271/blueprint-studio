"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// --- ICONS ---
const IconPencil = () => (
  <svg
    width="12"
    height="12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);
const IconMirror = ({ active }: { active: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2v20" strokeDasharray="4 4" opacity="0.5" />
    <path
      d="M4 6l6-4v20l-6-4z"
      fill={active ? "currentColor" : "none"}
      opacity={active ? 1 : 0.3}
    />
    <path
      d="M20 6l-6-4v20l6-4z"
      fill={active ? "currentColor" : "none"}
      opacity={active ? 0.4 : 0.1}
    />
  </svg>
);

// --- TYPES ---
type Point = { x: number; y: number };

type Curve = {
  id: string;
  type: "bezier" | "quadratic" | "line";
  name: string;
  mirrored: boolean;
  p0: Point;
  p1: Point;
  cp1?: Point;
  cp2?: Point;
};

type FreehandPath = {
  id: string;
  name: string;
  mirrored: boolean;
  points: Point[];
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // App Modes
  const [activeMode, setActiveMode] = useState<"vector" | "freehand">("vector");
  const [gridVisible, setGridVisible] = useState(true);

  // Reference Image State
  const [referenceImg, setReferenceImg] = useState<HTMLImageElement | null>(
    null,
  );
  const [refConfig, setRefConfig] = useState({
    opacity: 0.3,
    x: 0,
    y: 0,
    scale: 1,
  });

  // Vector State
  const [curves, setCurves] = useState<Curve[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<{
    curveId: string;
    nodeKey: string;
  } | null>(null);

  // Freehand State (Static Accessories)
  const [freehandPaths, setFreehandPaths] = useState<FreehandPath[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [smoothing] = useState(3);

  // UI State
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [exportedCode, setExportedCode] = useState("");
  const [showExport, setShowExport] = useState(false);

  // ==========================================
  // ASSET STORE (Vector Curves)
  // ==========================================
  const addCurve = (type: "bezier" | "quadratic" | "line") => {
    const id = Date.now().toString();
    let newCurve: Curve;

    if (type === "bezier") {
      newCurve = {
        id,
        type,
        name: "Bezier Curve",
        mirrored: true,
        p0: { x: 250, y: 200 },
        cp1: { x: 200, y: 200 },
        cp2: { x: 200, y: 300 },
        p1: { x: 250, y: 300 },
      };
    } else if (type === "quadratic") {
      newCurve = {
        id,
        type,
        name: "Quadratic Curve",
        mirrored: true,
        p0: { x: 250, y: 200 },
        cp1: { x: 200, y: 250 },
        p1: { x: 250, y: 300 },
      };
    } else {
      newCurve = {
        id,
        type,
        name: "Straight Line",
        mirrored: true,
        p0: { x: 250, y: 200 },
        p1: { x: 250, y: 300 },
      };
    }

    setCurves((prev) => [...prev, newCurve]);
    setSelectedLayerId(id);
    setActiveMode("vector");
  };

  const removeLayer = (id: string, type: "vector" | "freehand") => {
    if (type === "vector") setCurves((prev) => prev.filter((c) => c.id !== id));
    if (type === "freehand")
      setFreehandPaths((prev) => prev.filter((p) => p.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const updateLayerName = (
    id: string,
    newName: string,
    type: "vector" | "freehand",
  ) => {
    if (type === "vector")
      setCurves((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: newName } : c)),
      );
    if (type === "freehand")
      setFreehandPaths((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name: newName } : p)),
      );
  };

  const toggleLayerMirror = (id: string, type: "vector" | "freehand") => {
    if (type === "vector")
      setCurves((prev) =>
        prev.map((c) => (c.id === id ? { ...c, mirrored: !c.mirrored } : c)),
      );
    if (type === "freehand")
      setFreehandPaths((prev) =>
        prev.map((p) => (p.id === id ? { ...p, mirrored: !p.mirrored } : p)),
      );
  };

  // ==========================================
  // RENDERING ENGINE
  // ==========================================
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Reference Image
    if (referenceImg) {
      ctx.save();
      ctx.globalAlpha = refConfig.opacity;
      const baseScale = Math.min(
        600 / referenceImg.width,
        600 / referenceImg.height,
      );
      const w = referenceImg.width * baseScale * refConfig.scale;
      const h = referenceImg.height * baseScale * refConfig.scale;
      const x = (600 - w) / 2 + refConfig.x;
      const y = (600 - h) / 2 + refConfig.y;
      ctx.drawImage(referenceImg, x, y, w, h);
      ctx.restore();
    }

    // 2. Draw Grid
    if (gridVisible) {
      ctx.lineWidth = 1;
      for (let i = 0; i <= 600; i += 20) {
        ctx.strokeStyle =
          i === 300 ? "rgba(239, 68, 68, 0.4)" : "rgba(226, 232, 240, 0.5)";
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 600);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(600, i);
        ctx.stroke();
      }
    }

    // Helper: Checks if a point exactly overlaps any other anchor in the scene
    const checkNodeSnap = (pt: Point, skipCurveId: string) => {
      let matchCount = 0;
      for (const c of curves) {
        if (c.p0.x === pt.x && c.p0.y === pt.y) matchCount++;
        if (c.p1.x === pt.x && c.p1.y === pt.y) matchCount++;
        if (c.mirrored) {
          if (600 - c.p0.x === pt.x && c.p0.y === pt.y) matchCount++;
          if (600 - c.p1.x === pt.x && c.p1.y === pt.y) matchCount++;
        }
      }
      for (const p of freehandPaths) {
        if (p.points.length > 0) {
          if (p.points[0].x === pt.x && p.points[0].y === pt.y) matchCount++;
          if (
            p.points[p.points.length - 1].x === pt.x &&
            p.points[p.points.length - 1].y === pt.y
          )
            matchCount++;
        }
      }

      const isLiveSketch = skipCurveId === "live_sketch";
      return isLiveSketch ? matchCount > 0 : matchCount > 1; // Curves will match themselves once
    };

    // Helper: Draw Path Array (Freehand)
    const drawPathArray = (
      pathArray: Point[],
      isLive = false,
      isMirrored = false,
    ) => {
      if (pathArray.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = isLive ? "#3b82f6" : "#1e293b";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(pathArray[0].x, pathArray[0].y);
      for (let i = 1; i < pathArray.length; i++)
        ctx.lineTo(pathArray[i].x, pathArray[i].y);
      ctx.stroke();

      if (isMirrored) {
        ctx.beginPath();
        ctx.strokeStyle = isLive ? "#8b5cf6" : "rgba(30, 41, 59, 0.4)";
        ctx.moveTo(600 - pathArray[0].x, pathArray[0].y);
        for (let i = 1; i < pathArray.length; i++)
          ctx.lineTo(600 - pathArray[i].x, pathArray[i].y);
        ctx.stroke();
      }

      // Visual Indicator for Snapping in Freehand Mode
      if (isLive) {
        const lastPoint = pathArray[pathArray.length - 1];
        const isCenter = lastPoint.x === 300;
        const isNode = checkNodeSnap(lastPoint, "live_sketch");

        if (isCenter || isNode) {
          ctx.beginPath();
          ctx.arc(lastPoint.x, lastPoint.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = isCenter ? "#22c55e" : "#f59e0b";
          ctx.strokeStyle = isCenter ? "#14532d" : "#78350f";
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();
        }
      }
    };

    freehandPaths.forEach((p) => drawPathArray(p.points, false, p.mirrored));
    if (currentPath.length > 0) drawPathArray(currentPath, true, true);

    // 4. Draw Vector Curves
    curves.forEach((curve) => {
      const isSelected = selectedLayerId === curve.id;

      // Base Curve
      ctx.beginPath();
      ctx.strokeStyle = isSelected ? "#2563eb" : "#0f172a";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.moveTo(curve.p0.x, curve.p0.y);
      if (curve.type === "bezier")
        ctx.bezierCurveTo(
          curve.cp1!.x,
          curve.cp1!.y,
          curve.cp2!.x,
          curve.cp2!.y,
          curve.p1.x,
          curve.p1.y,
        );
      else if (curve.type === "quadratic")
        ctx.quadraticCurveTo(
          curve.cp1!.x,
          curve.cp1!.y,
          curve.p1.x,
          curve.p1.y,
        );
      else if (curve.type === "line") ctx.lineTo(curve.p1.x, curve.p1.y);
      ctx.stroke();

      // Mirrored Curve
      if (curve.mirrored) {
        ctx.beginPath();
        ctx.strokeStyle = isSelected
          ? "rgba(37, 99, 235, 0.4)"
          : "rgba(15, 23, 42, 0.3)";
        ctx.moveTo(600 - curve.p0.x, curve.p0.y);
        if (curve.type === "bezier")
          ctx.bezierCurveTo(
            600 - curve.cp1!.x,
            curve.cp1!.y,
            600 - curve.cp2!.x,
            curve.cp2!.y,
            600 - curve.p1.x,
            curve.p1.y,
          );
        else if (curve.type === "quadratic")
          ctx.quadraticCurveTo(
            600 - curve.cp1!.x,
            curve.cp1!.y,
            600 - curve.p1.x,
            curve.p1.y,
          );
        else if (curve.type === "line")
          ctx.lineTo(600 - curve.p1.x, curve.p1.y);
        ctx.stroke();
      }

      // Draw Edit Handles
      if (isSelected && activeMode === "vector") {
        ctx.lineWidth = 1;

        const drawNode = (point: Point, isControl = false, nodeKey: string) => {
          const isNodeActive =
            activeNode?.curveId === curve.id && activeNode?.nodeKey === nodeKey;
          const isCenterSnapped = point.x === 300 && curve.mirrored;
          const isAnchor = !isControl;
          const isNodeSnapped = isAnchor && checkNodeSnap(point, curve.id);

          ctx.beginPath();
          ctx.arc(point.x, point.y, isNodeActive ? 6 : 5, 0, Math.PI * 2);

          if (isCenterSnapped) {
            ctx.fillStyle = isNodeActive ? "#22c55e" : "#86efac"; // Green Snap
            ctx.strokeStyle = "#14532d";
          } else if (isNodeSnapped) {
            ctx.fillStyle = isNodeActive ? "#f59e0b" : "#fcd34d"; // Amber Snap
            ctx.strokeStyle = "#78350f";
          } else {
            ctx.fillStyle = isControl
              ? isNodeActive
                ? "#ef4444"
                : "#fca5a5"
              : isNodeActive
                ? "#3b82f6"
                : "#93c5fd";
            ctx.strokeStyle = isControl ? "#b91c1c" : "#1d4ed8";
          }

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

        if (curve.type === "bezier") {
          drawGuideline(curve.p0, curve.cp1!);
          drawGuideline(curve.p1, curve.cp2!);
          drawNode(curve.cp1!, true, "cp1");
          drawNode(curve.cp2!, true, "cp2");
        } else if (curve.type === "quadratic") {
          drawGuideline(curve.p0, curve.cp1!);
          drawGuideline(curve.p1, curve.cp1!);
          drawNode(curve.cp1!, true, "cp1");
        }

        drawNode(curve.p0, false, "p0");
        drawNode(curve.p1, false, "p1");
      }
    });
  }, [
    curves,
    freehandPaths,
    currentPath,
    selectedLayerId,
    activeNode,
    gridVisible,
    referenceImg,
    refConfig,
    activeMode,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // ==========================================
  // INTERACTION LOGIC (Mouse & Touch)
  // ==========================================
  const getCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  };

  const findHitNode = (x: number, y: number) => {
    if (!selectedLayerId) return null;
    const curve = curves.find((c) => c.id === selectedLayerId);
    if (!curve) return null;

    const HIT_RADIUS = 12;
    const nodes = [
      { key: "p0", pt: curve.p0 },
      { key: "p1", pt: curve.p1 },
    ];
    if (curve.type === "bezier" || curve.type === "quadratic")
      nodes.push({ key: "cp1", pt: curve.cp1! });
    if (curve.type === "bezier") nodes.push({ key: "cp2", pt: curve.cp2! });

    for (let n of nodes) {
      if (Math.hypot(n.pt.x - x, n.pt.y - y) <= HIT_RADIUS) {
        return { curveId: curve.id, nodeKey: n.key };
      }
    }
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getCoords(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (activeMode === "freehand") {
      setIsDrawing(true);
      setCurrentPath([coords]);
    } else if (activeMode === "vector") {
      const hit = findHitNode(coords.x, coords.y);
      if (hit) setActiveNode(hit);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getCoords(e);
    let targetX = coords.x;
    let targetY = coords.y;

    // Magnetic Snapping Logic (Iterates over all existing geometric anchors)
    const SNAP_RADIUS = 12;
    let closestDist = SNAP_RADIUS;
    let closestPt: Point | null = null;

    const snapTargets: Point[] = [];
    curves.forEach((c) => {
      // Collect existing anchors (ignore the actively dragged node to avoid self-snapping)
      if (activeMode === "vector" && activeNode?.curveId === c.id) {
        if (activeNode.nodeKey !== "p0") snapTargets.push(c.p0);
        if (activeNode.nodeKey !== "p1") snapTargets.push(c.p1);
      } else {
        snapTargets.push(c.p0, c.p1);
      }
      if (c.mirrored) {
        snapTargets.push(
          { x: 600 - c.p0.x, y: c.p0.y },
          { x: 600 - c.p1.x, y: c.p1.y },
        );
      }
    });

    freehandPaths.forEach((p) => {
      if (p.points.length > 0) {
        snapTargets.push(p.points[0], p.points[p.points.length - 1]);
        if (p.mirrored) {
          snapTargets.push(
            { x: 600 - p.points[0].x, y: p.points[0].y },
            {
              x: 600 - p.points[p.points.length - 1].x,
              y: p.points[p.points.length - 1].y,
            },
          );
        }
      }
    });

    snapTargets.forEach((pt) => {
      const dist = Math.hypot(pt.x - coords.x, pt.y - coords.y);
      if (dist < closestDist) {
        closestDist = dist;
        closestPt = pt;
      }
    });

    // 1. Prioritize Node Snapping
    if (closestPt) {
      targetX = closestPt.x;
      targetY = closestPt.y;
    }
    // 2. Fallback to Center Axis Snapping
    else if (Math.abs(targetX - 300) < 10) {
      targetX = 300;
    }

    if (activeMode === "freehand" && isDrawing) {
      setCurrentPath((prev) => {
        const lastPoint = prev[prev.length - 1];
        // Force commit the point if it magnetically snapped, otherwise smooth it
        if (
          closestPt ||
          targetX === 300 ||
          Math.hypot(targetX - lastPoint.x, targetY - lastPoint.y) > smoothing
        ) {
          return [...prev, { x: targetX, y: targetY }];
        }
        return prev;
      });
    } else if (activeMode === "vector" && activeNode) {
      setCurves((prev) =>
        prev.map((c) => {
          if (c.id === activeNode.curveId) {
            return { ...c, [activeNode.nodeKey]: { x: targetX, y: targetY } };
          }
          return c;
        }),
      );
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    if (activeMode === "freehand" && isDrawing) {
      setIsDrawing(false);
      if (currentPath.length > 1) {
        setFreehandPaths((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            name: `Accessory ${prev.length + 1}`,
            mirrored: true,
            points: currentPath,
          },
        ]);
      }
      setCurrentPath([]);
    } else {
      setActiveNode(null);
    }
  };

  // ==========================================
  // REFERENCE IMAGE
  // ==========================================
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => setReferenceImg(img);
    };
    reader.readAsDataURL(file);
  };

  // ==========================================
  // EXPORT GENERATOR
  // ==========================================
  const generateExport = () => {
    let jsCode = `// --- AVATAR MESH & ACCESSORIES (Generated from Blueprint Editor) ---\n`;
    jsCode += `ctx.beginPath();\n`;
    jsCode += `ctx.lineWidth = 3;\n`;
    jsCode += `ctx.strokeStyle = '#1a1a1a';\n\n`;

    if (curves.length > 0) {
      jsCode += `// --- 1. DYNAMIC VECTOR RIG (Base Face) ---\n`;
      curves.forEach((c) => {
        jsCode += `// ${c.name}\n`;
        jsCode += `ctx.moveTo(${c.p0.x}, ${c.p0.y});\n`;
        if (c.type === "bezier")
          jsCode += `ctx.bezierCurveTo(${c.cp1!.x}, ${c.cp1!.y}, ${c.cp2!.x}, ${c.cp2!.y}, ${c.p1.x}, ${c.p1.y});\n`;
        else if (c.type === "quadratic")
          jsCode += `ctx.quadraticCurveTo(${c.cp1!.x}, ${c.cp1!.y}, ${c.p1.x}, ${c.p1.y});\n`;
        else if (c.type === "line")
          jsCode += `ctx.lineTo(${c.p1.x}, ${c.p1.y});\n`;
        jsCode += `ctx.stroke();\n`;

        if (c.mirrored) {
          jsCode += `ctx.moveTo(${600 - c.p0.x}, ${c.p0.y});\n`;
          if (c.type === "bezier")
            jsCode += `ctx.bezierCurveTo(${600 - c.cp1!.x}, ${c.cp1!.y}, ${600 - c.cp2!.x}, ${c.cp2!.y}, ${600 - c.p1.x}, ${c.p1.y});\n`;
          else if (c.type === "quadratic")
            jsCode += `ctx.quadraticCurveTo(${600 - c.cp1!.x}, ${c.cp1!.y}, ${600 - c.p1.x}, ${c.p1.y});\n`;
          else if (c.type === "line")
            jsCode += `ctx.lineTo(${600 - c.p1.x}, ${c.p1.y});\n`;
          jsCode += `ctx.stroke();\n`;
        }
        jsCode += `\n`;
      });
    }

    if (freehandPaths.length > 0) {
      jsCode += `// --- 2. STATIC ACCESSORIES (Freehand Painted) ---\n`;
      freehandPaths.forEach((path) => {
        jsCode += `// ${path.name}\n`;
        jsCode += `ctx.moveTo(${path.points[0].x}, ${path.points[0].y});\n`;
        for (let i = 1; i < path.points.length; i++) {
          jsCode += `ctx.lineTo(${path.points[i].x}, ${path.points[i].y});\n`;
        }
        jsCode += `ctx.stroke();\n`;

        if (path.mirrored) {
          jsCode += `ctx.moveTo(${600 - path.points[0].x}, ${path.points[0].y});\n`;
          for (let i = 1; i < path.points.length; i++) {
            jsCode += `ctx.lineTo(${600 - path.points[i].x}, ${path.points[i].y});\n`;
          }
          jsCode += `ctx.stroke();\n`;
        }
        jsCode += `\n`;
      });
    }

    setExportedCode(jsCode);
    setShowExport(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans text-slate-800">
      {/* TOOLBAR */}
      <div className="w-full md:w-[360px] bg-white border-r border-slate-200 flex flex-col z-10 shrink-0 shadow-lg">
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white">
          <h1 className="text-lg font-black tracking-tight">
            Blueprint Studio
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Vector & Sketch Editor
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex p-4 border-b border-slate-200 gap-2 bg-slate-50">
          <button
            onClick={() => setActiveMode("vector")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${activeMode === "vector" ? "bg-blue-600 text-white border-blue-700 shadow-inner" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"}`}
          >
            Vector Rig
          </button>
          <button
            onClick={() => setActiveMode("freehand")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${activeMode === "freehand" ? "bg-blue-600 text-white border-blue-700 shadow-inner" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"}`}
          >
            Static Accessory
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* View Settings */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Global View
            </h3>
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
                <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          </div>

          {/* Reference Image Tools */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Trace Reference
            </h3>
            <label className="flex items-center justify-center w-full py-2 px-4 border border-slate-300 rounded-lg cursor-pointer bg-white hover:bg-slate-100 text-xs font-bold text-slate-600 transition-colors">
              {referenceImg
                ? "Replace Reference Image"
                : "Upload Template to Trace"}
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
                    className="w-full mt-1 accent-blue-600"
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
                    className="w-full mt-1 accent-blue-600"
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
                      className="w-full mt-1 accent-blue-600"
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
                      className="w-full mt-1 accent-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contextual Actions (Vector vs Freehand) */}
          {activeMode === "vector" ? (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Add Vectors
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => addCurve("bezier")}
                  className="py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-blue-600 hover:border-blue-400 transition-colors"
                >
                  + Bezier (Complex S-Curve)
                </button>
                <button
                  onClick={() => addCurve("quadratic")}
                  className="py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-600 hover:border-emerald-400 transition-colors"
                >
                  + Quadratic (Simple Curve)
                </button>
                <button
                  onClick={() => addCurve("line")}
                  className="py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:border-slate-400 transition-colors"
                >
                  + Straight Line
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-2">
              <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">
                Accessory Sketch Active
              </h3>
              <p className="text-[10px] text-blue-700 leading-relaxed">
                Draw directly on the canvas. These lines act as static shapes,
                independent of the dynamic face rig.
              </p>
            </div>
          )}

          {/* Layer Manager */}
          {(curves.length > 0 || freehandPaths.length > 0) && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Active Layers
              </h3>
              <div className="space-y-2">
                {curves.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedLayerId(c.id);
                      setActiveMode("vector");
                    }}
                    className={`flex justify-between items-center p-2 border rounded-lg cursor-pointer transition-colors ${selectedLayerId === c.id ? "bg-blue-50 border-blue-400 shadow-sm" : "bg-white border-slate-200 hover:border-slate-300"}`}
                  >
                    {editingNameId === c.id ? (
                      <input
                        autoFocus
                        className="bg-white border border-blue-300 px-2 py-1 rounded outline-none flex-1 text-xs text-slate-800"
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
                        <span className="text-[10px] font-bold text-slate-400 mr-2 shrink-0">
                          [V]
                        </span>
                        <span
                          className="font-semibold text-xs text-slate-700 truncate"
                          title={c.name}
                        >
                          {c.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLayerId(c.id);
                            setEditingNameId(c.id);
                          }}
                          className="ml-2 text-slate-300 hover:text-blue-500 transition-colors p-1 shrink-0"
                          title="Rename Layer"
                        >
                          <IconPencil />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerMirror(c.id, "vector");
                          }}
                          className={`ml-1 p-1 shrink-0 transition-colors ${c.mirrored ? "text-blue-500" : "text-slate-300 hover:text-slate-400"}`}
                          title="Toggle Mirror Symmetry"
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
                      className="text-red-400 hover:text-red-600 font-bold px-2 py-1 rounded hover:bg-red-50 transition-colors shrink-0 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {freehandPaths.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedLayerId(p.id);
                      setActiveMode("freehand");
                    }}
                    className={`flex justify-between items-center p-2 border rounded-lg cursor-pointer transition-colors ${selectedLayerId === p.id ? "bg-blue-50 border-blue-400 shadow-sm" : "bg-white border-slate-200 hover:border-slate-300"}`}
                  >
                    {editingNameId === p.id ? (
                      <input
                        autoFocus
                        className="bg-white border border-blue-300 px-2 py-1 rounded outline-none flex-1 text-xs text-slate-800"
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
                        <span className="text-[10px] font-bold text-slate-400 mr-2 shrink-0">
                          [A]
                        </span>
                        <span
                          className="font-semibold text-xs text-slate-700 truncate"
                          title={p.name}
                        >
                          {p.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLayerId(p.id);
                            setEditingNameId(p.id);
                          }}
                          className="ml-2 text-slate-300 hover:text-blue-500 transition-colors p-1 shrink-0"
                          title="Rename Layer"
                        >
                          <IconPencil />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerMirror(p.id, "freehand");
                          }}
                          className={`ml-1 p-1 shrink-0 transition-colors ${p.mirrored ? "text-blue-500" : "text-slate-300 hover:text-slate-400"}`}
                          title="Toggle Mirror Symmetry"
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
                      className="text-red-400 hover:text-red-600 font-bold px-2 py-1 rounded hover:bg-red-50 transition-colors shrink-0 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={generateExport}
            className="w-full py-4 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
          >
            Generate Geometry Code
          </button>
        </div>
      </div>

      {/* CANVAS WORKSPACE */}
      <div className="flex-1 bg-slate-200/50 flex flex-col items-center justify-center relative p-4 overflow-hidden">
        <div
          className="bg-white rounded-xl shadow-2xl p-1 w-full max-w-[600px] aspect-square relative z-10 ring-1 ring-slate-900/5"
          style={{
            cursor: activeMode === "freehand" ? "crosshair" : "default",
          }}
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
              <span>
                <span className="text-blue-500 text-lg leading-none">●</span>{" "}
                Anchors
              </span>
              <span>
                <span className="text-red-500 text-lg leading-none">●</span>{" "}
                Controls
              </span>
              <span>
                <span className="text-green-500 text-lg leading-none">●</span>{" "}
                Center Snap
              </span>
              <span>
                <span className="text-amber-500 text-lg leading-none">●</span>{" "}
                Node Snap
              </span>
            </>
          ) : (
            <span>Click and drag to sketch accessory layers</span>
          )}
        </div>
      </div>

      {/* EXPORT MODAL */}
      {showExport && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-800">
                Exported Canvas Formula
              </h2>
              <button
                onClick={() => setShowExport(false)}
                className="text-slate-400 hover:text-slate-800 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="p-0 flex-1">
              <textarea
                className="w-full h-96 p-4 font-mono text-[11px] bg-slate-900 text-green-400 resize-none focus:outline-none leading-relaxed"
                readOnly
                value={exportedCode}
              />
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowExport(false)}
                className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportedCode);
                  alert("Copied!");
                }}
                className="px-6 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-md"
              >
                Copy Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

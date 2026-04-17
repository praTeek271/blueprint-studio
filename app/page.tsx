"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- ICONS ---
const IconPencil = () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const IconMirror = ({ active }: { active: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20" strokeDasharray="4 4" opacity="0.5"/>
    <path d="M4 6l6-4v20l-6-4z" fill={active ? "currentColor" : "none"} opacity={active ? 1 : 0.3} />
    <path d="M20 6l-6-4v20l6-4z" fill={active ? "currentColor" : "none"} opacity={active ? 0.4 : 0.1} />
  </svg>
);
const IconBrush = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18.36 4.64a4 4 0 00-5.65 0l-8.49 8.49a2 2 0 00-.5.83l-1.5 5.5a1 1 0 001.22 1.22l5.5-1.5a2 2 0 00.83-.5l8.49-8.49a4 4 0 000-5.65z"/><path d="M14 8l2 2"/></svg>;
const IconEraser = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 20H7L3 16C2.5 15.5 2.5 14.5 3 14L13 4C13.5 3.5 14.5 3.5 15 4L20 9C20.5 9.5 20.5 10.5 20 11L11 20H20V20Z"/><path d="M17 6L6 17"/></svg>;
const IconGroup = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>;
const IconExport = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const IconImport = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const IconChevron = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

// --- TYPES ---
type Point = { x: number; y: number };

type Curve = {
  id: string;
  type: 'bezier' | 'quadratic' | 'line';
  name: string;
  mirrored: boolean;
  p0: Point;
  p1: Point;
  cp1?: Point;
  cp2?: Point;
};

type Stroke = {
  points: Point[];
  size: number;
  isEraser: boolean;
};

type FreehandLayer = {
  id: string;
  name: string;
  mirrored: boolean;
  strokes: Stroke[];
};

// Default Geometry
const INITIAL_BASE_FACE: Curve[] = [
  { id: 'c1', type: 'bezier', name: 'Cranium Outline', mirrored: true, p0: {x: 299, y: 54}, cp1: {x: 254, y: 46}, cp2: {x: 162, y: 110}, p1: {x: 197, y: 215} },
  { id: 'c2', type: 'quadratic', name: 'Jawline', mirrored: true, p0: {x: 197, y: 216}, cp1: {x: 205, y: 350}, p1: {x: 300, y: 385} },
  { id: 'c3', type: 'bezier', name: 'Upper Cheekbone', mirrored: true, p0: {x: 299, y: 162}, cp1: {x: 213, y: 116}, cp2: {x: 217, y: 184}, p1: {x: 195, y: 215} },
  { id: 'c4', type: 'bezier', name: 'Lower Cheekbone', mirrored: true, p0: {x: 195, y: 218}, cp1: {x: 154, y: 197}, cp2: {x: 200, y: 298}, p1: {x: 205, y: 278} },
  { id: 'c5', type: 'bezier', name: 'Trapezius', mirrored: true, p0: {x: 235, y: 337}, cp1: {x: 263, y: 510}, cp2: {x: 100, y: 469}, p1: {x: 80, y: 512} },
  { id: 'c6', type: 'quadratic', name: 'Deltoid', mirrored: true, p0: {x: 91, y: 501}, cp1: {x: 56, y: 526}, p1: {x: 60, y: 584} },
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      offscreenCanvasRef.current = canvas;
    }
  }, []);

  // App Modes & UI Accordions
  const [activeMode, setActiveMode] = useState<'vector' | 'freehand'>('vector');
  const [gridVisible, setGridVisible] = useState(true);
  const [globalViewOpen, setGlobalViewOpen] = useState(false);
  const [traceRefOpen, setTraceRefOpen] = useState(false);

  // Reference Image State
  const [referenceImg, setReferenceImg] = useState<HTMLImageElement | null>(null);
  const [refConfig, setRefConfig] = useState({ opacity: 0.3, x: 0, y: 0, scale: 1 });

  // Vector State
  const [curves, setCurves] = useState<Curve[]>(INITIAL_BASE_FACE);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null); 
  const [activeNode, setActiveNode] = useState<{ curveId: string, nodeKey: string } | null>(null); 
  
  // Freehand State
  const [freehandLayers, setFreehandLayers] = useState<FreehandLayer[]>([]);
  const [checkedFreehandIds, setCheckedFreehandIds] = useState<string[]>([]); 
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [freehandTool, setFreehandTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState(3);
  const [freehandSnapEnabled, setFreehandSnapEnabled] = useState(true);
  const [smoothing] = useState(3);

  // UI State
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [exportedCode, setExportedCode] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importCode, setImportCode] = useState('');

  const handleModeChange = (mode: 'vector' | 'freehand') => {
    setActiveMode(mode);
    setSelectedLayerId(null);
  };

  // ==========================================
  // ASSET STORE (Vector Curves)
  // ==========================================
  const addCurve = (type: 'bezier' | 'quadratic' | 'line') => {
    const id = Date.now().toString();
    let newCurve: Curve;
    
    if (type === 'bezier') {
      newCurve = { id, type, name: 'Bezier Curve', mirrored: true, p0: {x: 250, y: 200}, cp1: {x: 200, y: 200}, cp2: {x: 200, y: 300}, p1: {x: 250, y: 300} };
    } else if (type === 'quadratic') {
      newCurve = { id, type, name: 'Quadratic Curve', mirrored: true, p0: {x: 250, y: 200}, cp1: {x: 200, y: 250}, p1: {x: 250, y: 300} };
    } else {
      newCurve = { id, type, name: 'Straight Line', mirrored: true, p0: {x: 250, y: 200}, p1: {x: 250, y: 300} };
    }
    
    setCurves(prev => [...prev, newCurve]);
    setSelectedLayerId(id);
    setActiveMode('vector');
  };

  const removeLayer = (id: string, type: 'vector' | 'freehand') => {
    if (type === 'vector') setCurves(prev => prev.filter(c => c.id !== id));
    if (type === 'freehand') {
        setFreehandLayers(prev => prev.filter(p => p.id !== id));
        setCheckedFreehandIds(prev => prev.filter(cId => cId !== id));
    }
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const updateLayerName = (id: string, newName: string, type: 'vector' | 'freehand') => {
    if (type === 'vector') setCurves(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
    if (type === 'freehand') setFreehandLayers(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const toggleLayerMirror = (id: string, type: 'vector' | 'freehand') => {
    if (type === 'vector') setCurves(prev => prev.map(c => c.id === id ? { ...c, mirrored: !c.mirrored } : c));
    if (type === 'freehand') setFreehandLayers(prev => prev.map(p => p.id === id ? { ...p, mirrored: !p.mirrored } : p));
  };

  const groupSelectedLayers = () => {
    if (checkedFreehandIds.length < 2) return;
    const layersToGroup = freehandLayers.filter(l => checkedFreehandIds.includes(l.id));
    const combinedStrokes = layersToGroup.flatMap(l => l.strokes);
    const newId = Date.now().toString();
    const newLayer: FreehandLayer = {
        id: newId,
        name: `Grouped Accessory`,
        mirrored: layersToGroup[0].mirrored, 
        strokes: combinedStrokes
    };
    setFreehandLayers(prev => [...prev.filter(l => !checkedFreehandIds.includes(l.id)), newLayer]);
    setCheckedFreehandIds([]);
    setSelectedLayerId(newId);
  };

  // ==========================================
  // RENDERING ENGINE
  // ==========================================
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !offscreenCanvasRef.current) return;
    const ctx = canvas.getContext('2d');
    const offCtx = offscreenCanvasRef.current.getContext('2d');
    if (!ctx || !offCtx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f8fafc';
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
        ctx.strokeStyle = i === 300 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(226, 232, 240, 0.5)'; 
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 600); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(600, i); ctx.stroke();
      }
    }

    const checkNodeSnap = (pt: Point, skipCurveId: string) => {
        let matchCount = 0;
        curves.forEach(c => {
            if (c.p0.x === pt.x && c.p0.y === pt.y) matchCount++;
            if (c.p1.x === pt.x && c.p1.y === pt.y) matchCount++;
            if (c.mirrored) {
                if (600 - c.p0.x === pt.x && c.p0.y === pt.y) matchCount++;
                if (600 - c.p1.x === pt.x && c.p1.y === pt.y) matchCount++;
            }
        });
        freehandLayers.forEach(layer => {
            layer.strokes.forEach(stroke => {
                if (stroke.points.length > 0) {
                    if (stroke.points[0].x === pt.x && stroke.points[0].y === pt.y) matchCount++;
                    if (stroke.points[stroke.points.length - 1].x === pt.x && stroke.points[stroke.points.length - 1].y === pt.y) matchCount++;
                }
            });
        });
        return skipCurveId === 'live_sketch' ? matchCount > 0 : matchCount > 1;
    };

    offCtx.clearRect(0, 0, 600, 600);
    const drawStroke = (pathArray: Point[], size: number, isEraser: boolean, isLive = false, isMirrored = false) => {
      if (pathArray.length < 2) return;
      offCtx.beginPath(); 
      offCtx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
      const strokeAlpha = (activeMode === 'freehand' || isLive) ? 1.0 : 0.4;
      offCtx.strokeStyle = isEraser ? '#000' : (isLive ? '#3b82f6' : `rgba(30, 41, 59, ${strokeAlpha})`); 
      offCtx.lineWidth = size; offCtx.lineCap = 'round'; offCtx.lineJoin = 'round';
      offCtx.moveTo(pathArray[0].x, pathArray[0].y);
      for (let i = 1; i < pathArray.length; i++) offCtx.lineTo(pathArray[i].x, pathArray[i].y);
      offCtx.stroke();

      if (isMirrored) {
        offCtx.beginPath(); 
        offCtx.strokeStyle = isLive ? '#8b5cf6' : `rgba(30, 41, 59, ${strokeAlpha * 0.7})`;
        offCtx.moveTo(600 - pathArray[0].x, pathArray[0].y);
        for (let i = 1; i < pathArray.length; i++) offCtx.lineTo(600 - pathArray[i].x, pathArray[i].y);
        offCtx.stroke();
      }

      if (isLive && !isEraser && freehandSnapEnabled) {
        const lastPoint = pathArray[pathArray.length - 1];
        const isCenter = lastPoint.x === 300;
        const isNode = checkNodeSnap(lastPoint, 'live_sketch');
        if (isCenter || isNode) {
            ctx.beginPath(); ctx.arc(lastPoint.x, lastPoint.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = isCenter ? '#22c55e' : '#f59e0b';
            ctx.strokeStyle = isCenter ? '#14532d' : '#78350f'; ctx.lineWidth = 2;
            ctx.fill(); ctx.stroke();
        }
      }
    };

    freehandLayers.forEach(layer => layer.strokes.forEach(s => drawStroke(s.points, s.size, s.isEraser, false, layer.mirrored)));
    if (currentStroke.length > 0 && activeMode === 'freehand') {
        const activeLayer = freehandLayers.find(l => l.id === selectedLayerId);
        drawStroke(currentStroke, brushSize, freehandTool === 'eraser', true, activeLayer ? activeLayer.mirrored : true);
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(offscreenCanvasRef.current, 0, 0);

    curves.forEach(curve => {
      const isSelected = selectedLayerId === curve.id && activeMode === 'vector';
      const vectorAlpha = activeMode === 'vector' ? 1.0 : 0.4;
      ctx.beginPath();
      ctx.strokeStyle = isSelected ? '#2563eb' : `rgba(15, 23, 42, ${vectorAlpha})`;
      ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.moveTo(curve.p0.x, curve.p0.y);
      if (curve.type === 'bezier') ctx.bezierCurveTo(curve.cp1!.x, curve.cp1!.y, curve.cp2!.x, curve.cp2!.y, curve.p1.x, curve.p1.y);
      else if (curve.type === 'quadratic') ctx.quadraticCurveTo(curve.cp1!.x, curve.cp1!.y, curve.p1.x, curve.p1.y);
      else if (curve.type === 'line') ctx.lineTo(curve.p1.x, curve.p1.y);
      ctx.stroke();

      if (curve.mirrored) {
        ctx.beginPath();
        ctx.strokeStyle = isSelected ? `rgba(37, 99, 235, ${0.4 * vectorAlpha})` : `rgba(15, 23, 42, ${0.3 * vectorAlpha})`;
        ctx.moveTo(600 - curve.p0.x, curve.p0.y);
        if (curve.type === 'bezier') ctx.bezierCurveTo(600 - curve.cp1!.x, curve.cp1!.y, 600 - curve.cp2!.x, curve.cp2!.y, 600 - curve.p1.x, curve.p1.y);
        else if (curve.type === 'quadratic') ctx.quadraticCurveTo(600 - curve.cp1!.x, curve.cp1!.y, 600 - curve.p1.x, curve.p1.y);
        else if (curve.type === 'line') ctx.lineTo(600 - curve.p1.x, curve.p1.y);
        ctx.stroke();
      }

      if (isSelected && activeMode === 'vector') {
        ctx.lineWidth = 1;
        const drawNode = (point: Point, isControl = false, nodeKey: string) => {
          const isNodeActive = activeNode?.curveId === curve.id && activeNode?.nodeKey === nodeKey;
          const isCenterSnapped = point.x === 300 && curve.mirrored;
          const isNodeSnapped = !isControl && checkNodeSnap(point, curve.id);
          ctx.beginPath(); ctx.arc(point.x, point.y, isNodeActive ? 6 : 5, 0, Math.PI * 2);
          if (isCenterSnapped) { ctx.fillStyle = isNodeActive ? '#22c55e' : '#86efac'; ctx.strokeStyle = '#14532d'; }
          else if (isNodeSnapped) { ctx.fillStyle = isNodeActive ? '#f59e0b' : '#fcd34d'; ctx.strokeStyle = '#78350f'; }
          else { ctx.fillStyle = isControl ? (isNodeActive ? '#ef4444' : '#fca5a5') : (isNodeActive ? '#3b82f6' : '#93c5fd'); ctx.strokeStyle = isControl ? '#b91c1c' : '#1d4ed8'; }
          ctx.fill(); ctx.stroke();
        };
        const drawGuideline = (pA: Point, pB: Point) => { ctx.beginPath(); ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)'; ctx.setLineDash([4, 4]); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.stroke(); ctx.setLineDash([]); };
        if (curve.type === 'bezier') { drawGuideline(curve.p0, curve.cp1!); drawGuideline(curve.p1, curve.cp2!); drawNode(curve.cp1!, true, 'cp1'); drawNode(curve.cp2!, true, 'cp2'); }
        else if (curve.type === 'quadratic') { drawGuideline(curve.p0, curve.cp1!); drawGuideline(curve.p1, curve.cp1!); drawNode(curve.cp1!, true, 'cp1'); }
        drawNode(curve.p0, false, 'p0'); drawNode(curve.p1, false, 'p1');
      }
    });
  }, [curves, freehandLayers, currentStroke, brushSize, freehandTool, freehandSnapEnabled, selectedLayerId, activeNode, gridVisible, referenceImg, refConfig, activeMode]);

  useEffect(() => {
    let animId: number;
    const loop = () => { renderCanvas(); animId = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [renderCanvas]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    const coords = { x: Math.round((e.clientX - rect.left) * scaleX), y: Math.round((e.clientY - rect.top) * scaleY) };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (activeMode === 'freehand') {
      setIsDrawing(true); setCurrentStroke([coords]);
    } else {
        if (!selectedLayerId) return;
        const curve = curves.find(c => c.id === selectedLayerId);
        if (!curve) return;
        const nodes = [ { key: 'p0', pt: curve.p0 }, { key: 'p1', pt: curve.p1 } ];
        if (curve.type !== 'line') nodes.push({ key: 'cp1', pt: curve.cp1! });
        if (curve.type === 'bezier') nodes.push({ key: 'cp2', pt: curve.cp2! });
        for (let n of nodes) { if (Math.hypot(n.pt.x - coords.x, n.pt.y - coords.y) <= 12) { setActiveNode({ curveId: curve.id, nodeKey: n.key }); break; } }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const coords = { x: Math.round((e.clientX - rect.left) * (600/rect.width)), y: Math.round((e.clientY - rect.top) * (600/rect.height)) };
    let tx = coords.x; let ty = coords.y;
    
    if (activeMode === 'vector' || (activeMode === 'freehand' && freehandTool !== 'eraser' && freehandSnapEnabled)) {
        const snapTargets: Point[] = [];
        curves.forEach(c => { 
            if (!(activeNode?.curveId === c.id && activeNode.nodeKey === 'p0')) snapTargets.push(c.p0);
            if (!(activeNode?.curveId === c.id && activeNode.nodeKey === 'p1')) snapTargets.push(c.p1);
            if (c.mirrored) snapTargets.push({x: 600-c.p0.x, y: c.p0.y}, {x: 600-c.p1.x, y: c.p1.y});
        });
        freehandLayers.forEach(l => l.strokes.forEach(s => { snapTargets.push(s.points[0], s.points[s.points.length-1]); if (l.mirrored) snapTargets.push({x:600-s.points[0].x, y:s.points[0].y}, {x:600-s.points[s.points.length-1].x, y:s.points[s.points.length-1].y}); }));
        let best = 12; let hit: Point|null = null;
        snapTargets.forEach(p => { const d = Math.hypot(p.x-tx, p.y-ty); if(d<best){best=d; hit=p;} });
        if(hit){tx=hit.x; ty=hit.y;} else if(Math.abs(tx-300)<10){tx=300;}
    }

    if (activeMode === 'freehand' && isDrawing) {
      setCurrentStroke(p => (Math.hypot(tx-p[p.length-1].x, ty-p[p.length-1].y)>smoothing || tx===300) ? [...p, {x:tx, y:ty}] : p);
    } else if (activeMode === 'vector' && activeNode) {
      setCurves(prev => prev.map(c => c.id === activeNode.curveId ? { ...c, [activeNode.nodeKey]: { x: tx, y: ty } } : c));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    if (activeMode === 'freehand' && isDrawing) {
      setIsDrawing(false);
      if (currentStroke.length > 1) {
          const s: Stroke = { points: currentStroke, size: brushSize, isEraser: freehandTool === 'eraser' };
          if (selectedLayerId && freehandLayers.some(l => l.id === selectedLayerId)) setFreehandLayers(p => p.map(l => l.id === selectedLayerId ? { ...l, strokes: [...l.strokes, s] } : l));
          else { const nid = Date.now().toString(); setFreehandLayers(p => [...p, { id: nid, name: `Accessory ${p.length+1}`, mirrored: true, strokes: [s] }]); setSelectedLayerId(nid); }
      }
      setCurrentStroke([]);
    } else setActiveNode(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const img = new Image(); img.src = ev.target?.result as string; img.onload = () => { setReferenceImg(img); setTraceRefOpen(true); }; };
    reader.readAsDataURL(file);
  };

  const generateExport = () => {
    let jsCode = `// --- AVATAR MESH & ACCESSORIES ---\n`;
    if (curves.length > 0) {
        jsCode += `// --- 1. VECTOR RIG ---\nctx.beginPath(); ctx.lineWidth = 3; ctx.strokeStyle = '#1a1a1a';\n`;
        curves.forEach(c => {
            jsCode += `// ${c.name}\nctx.moveTo(${c.p0.x}, ${c.p0.y});\n`;
            if (c.type==='bezier') jsCode += `ctx.bezierCurveTo(${c.cp1!.x}, ${c.cp1!.y}, ${c.cp2!.x}, ${c.cp2!.y}, ${c.p1.x}, ${c.p1.y});\n`;
            else if (c.type==='quadratic') jsCode += `ctx.quadraticCurveTo(${c.cp1!.x}, ${c.cp1!.y}, ${c.p1.x}, ${c.p1.y});\n`;
            else jsCode += `ctx.lineTo(${c.p1.x}, ${c.p1.y});\n`;
            jsCode += `ctx.stroke();\n`;
            if (c.mirrored) {
                jsCode += `ctx.moveTo(${600-c.p0.x}, ${c.p0.y});\n`;
                if (c.type==='bezier') jsCode += `ctx.bezierCurveTo(${600-c.cp1!.x}, ${c.cp1!.y}, ${600-c.cp2!.x}, ${c.cp2!.y}, ${600-c.p1.x}, ${c.p1.y});\n`;
                else if (c.type==='quadratic') jsCode += `ctx.quadraticCurveTo(${600-c.cp1!.x}, ${c.cp1!.y}, ${600-c.p1.x}, ${c.p1.y});\n`;
                else jsCode += `ctx.lineTo(${600-c.p1.x}, ${c.p1.y});\n`;
                jsCode += `ctx.stroke();\n`;
            }
        });
    }
    if (freehandLayers.length > 0) {
        jsCode += `\n// --- 2. ACCESSORIES ---\n`;
        freehandLayers.forEach(l => {
            jsCode += `// ${l.name}\n`;
            l.strokes.forEach(s => {
                jsCode += `ctx.lineWidth = ${s.size}; ${s.isEraser ? "ctx.globalCompositeOperation = 'destination-out';" : ""}\nctx.beginPath(); ctx.moveTo(${s.points[0].x}, ${s.points[0].y});\n`;
                for (let i=1; i<s.points.length; i++) jsCode += `ctx.lineTo(${s.points[i].x}, ${s.points[i].y});\n`;
                jsCode += `ctx.stroke();\n`;
                if (l.mirrored) {
                    jsCode += `ctx.beginPath(); ctx.moveTo(${600-s.points[0].x}, ${s.points[0].y});\n`;
                    for (let i=1; i<s.points.length; i++) jsCode += `ctx.lineTo(${600-s.points[i].x}, ${s.points[i].y});\n`;
                    jsCode += `ctx.stroke();\n`;
                }
                if (s.isEraser) jsCode += `ctx.globalCompositeOperation = 'source-over';\n`;
            });
        });
    }
    jsCode += `\n// --- WORKSPACE STATE (VERSION 1.1) ---\n// STATE_JSON:${JSON.stringify({ curves, freehandLayers })}\n`;
    setExportedCode(jsCode); setShowExport(true);
  };

  const handleImportAction = () => {
    const match = importCode.match(/\/\/ STATE_JSON:(.+)/);
    if (match && match[1]) {
        try {
            const s = JSON.parse(match[1].trim());
            if (s.curves) setCurves(s.curves); if (s.freehandLayers) setFreehandLayers(s.freehandLayers);
            setSelectedLayerId(null); setActiveNode(null); setShowImport(false); setImportCode('');
            alert("Workspace restored!");
        } catch (e) { alert("Failed to restore state."); }
    } else {
        // --- LEGACY PARSER ENGINE ---
        try {
            const parsedCurves: Curve[] = [];
            const parsedLayers: FreehandLayer[] = [];
            let currentSection = 'none';
            let currentName = 'Legacy Shape';
            let lastMoveTo: Point | null = null;
            
            let currentLayer: FreehandLayer | null = null;
            let currentStroke: Stroke | null = null;
            let currentSize = 3;

            const parseCoord = (str: string) => {
                if (str.includes('-')) { const parts = str.split('-'); return parseInt(parts[0]) - parseInt(parts[1]); }
                if (str.includes('+')) { const parts = str.split('+'); return parseInt(parts[0]) + parseInt(parts[1]); }
                return parseInt(str.trim(), 10);
            };

            const lines = importCode.split('\n');
            for (let line of lines) {
                line = line.trim();
                if (!line) continue;
                
                if (line.includes('1. DYNAMIC VECTOR') || line.includes('1. VECTOR RIG')) { currentSection = 'vector'; continue; }
                if (line.includes('2. STATIC ACCESSORIES') || line.includes('2. ACCESSORIES')) { currentSection = 'freehand'; continue; }

                if (line.startsWith('//') && !line.includes('---')) {
                    currentName = line.replace('//', '').trim();
                    if (currentSection === 'freehand') {
                        if (currentLayer && currentStroke && currentStroke.points.length > 0) {
                            currentLayer.strokes.push(currentStroke);
                        }
                        if (currentLayer && currentLayer.strokes.length > 0) {
                            parsedLayers.push(currentLayer);
                        }
                        currentLayer = { id: Date.now() + Math.random().toString(), name: currentName, mirrored: false, strokes: [] };
                        currentStroke = null;
                    }
                    continue;
                }

                const sizeMatch = line.match(/lineWidth\s*=\s*(\d+)/);
                if (sizeMatch) currentSize = parseInt(sizeMatch[1], 10);

                const moveMatch = line.match(/moveTo\(([^,]+),\s*([^)]+)\)/);
                if (moveMatch) {
                    const pt = { x: parseCoord(moveMatch[1]), y: parseCoord(moveMatch[2]) };
                    if (currentSection === 'vector') {
                        lastMoveTo = pt;
                    } else if (currentSection === 'freehand') {
                        if (currentStroke && currentStroke.points.length > 0 && currentLayer) {
                            currentLayer.strokes.push(currentStroke);
                        }
                        currentStroke = { points: [pt], size: currentSize, isEraser: false };
                        if (!currentLayer) {
                            currentLayer = { id: Date.now() + Math.random().toString(), name: currentName, mirrored: false, strokes: [] };
                        }
                    }
                }

                if (currentSection === 'vector' && lastMoveTo) {
                    const bezMatch = line.match(/bezierCurveTo\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
                    if (bezMatch) {
                        parsedCurves.push({
                            id: Date.now() + Math.random().toString(), type: 'bezier', name: currentName, mirrored: false,
                            p0: lastMoveTo, 
                            cp1: { x: parseCoord(bezMatch[1]), y: parseCoord(bezMatch[2]) }, 
                            cp2: { x: parseCoord(bezMatch[3]), y: parseCoord(bezMatch[4]) }, 
                            p1: { x: parseCoord(bezMatch[5]), y: parseCoord(bezMatch[6]) }
                        });
                        lastMoveTo = null;
                    }
                    
                    const quadMatch = line.match(/quadraticCurveTo\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
                    if (quadMatch) {
                        parsedCurves.push({
                            id: Date.now() + Math.random().toString(), type: 'quadratic', name: currentName, mirrored: false,
                            p0: lastMoveTo, 
                            cp1: { x: parseCoord(quadMatch[1]), y: parseCoord(quadMatch[2]) }, 
                            p1: { x: parseCoord(quadMatch[3]), y: parseCoord(quadMatch[4]) }
                        });
                        lastMoveTo = null;
                    }
                    
                    const lineMatch = line.match(/lineTo\(([^,]+),\s*([^)]+)\)/);
                    if (lineMatch) {
                        parsedCurves.push({ 
                            id: Date.now() + Math.random().toString(), type: 'line', name: currentName, mirrored: false, 
                            p0: lastMoveTo, 
                            p1: { x: parseCoord(lineMatch[1]), y: parseCoord(lineMatch[2]) } 
                        });
                        lastMoveTo = null;
                    }
                }

                if (currentSection === 'freehand' && currentStroke) {
                    const lineMatch = line.match(/lineTo\(([^,]+),\s*([^)]+)\)/);
                    if (lineMatch) {
                        currentStroke.points.push({ x: parseCoord(lineMatch[1]), y: parseCoord(lineMatch[2]) });
                    }
                }
            }

            if (currentLayer && currentStroke && currentStroke.points.length > 0) {
                currentLayer.strokes.push(currentStroke);
            }
            if (currentLayer && currentLayer.strokes.length > 0) {
                parsedLayers.push(currentLayer);
            }

            if (parsedCurves.length > 0 || parsedLayers.length > 0) {
                setCurves(parsedCurves);
                setFreehandLayers(parsedLayers);
                setSelectedLayerId(null); setActiveNode(null); setShowImport(false); setImportCode('');
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

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans text-slate-800">
      
      <div className="w-full md:w-[360px] bg-white border-r border-slate-200 flex flex-col z-10 shrink-0 shadow-lg">
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center">
            <div>
                <h1 className="text-lg font-black tracking-tight">Blueprint Studio</h1>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Vector & Sketch</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setShowImport(true)} className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg transition-colors shadow-sm"><IconImport /> Resume</button>
                <button onClick={generateExport} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg transition-colors shadow-md"><IconExport /> Export</button>
            </div>
        </div>

        <div className="flex p-4 border-b border-slate-200 gap-2 bg-slate-50 shrink-0">
            <button onClick={() => handleModeChange('vector')} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${activeMode === 'vector' ? 'bg-blue-600 text-white border-blue-700 shadow-inner' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>Vector Rig</button>
            <button onClick={() => handleModeChange('freehand')} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${activeMode === 'freehand' ? 'bg-emerald-600 text-white border-emerald-700 shadow-inner' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>Static Accessory</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shrink-0">
              <button onClick={() => setGlobalViewOpen(!globalViewOpen)} className="w-full p-4 flex justify-between items-center hover:bg-slate-100 transition-colors"><h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global View Settings</h3><IconChevron open={globalViewOpen} /></button>
              {globalViewOpen && <div className="p-4 pt-0 border-t border-slate-200 mt-2"><div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-700">Show Graph Grid</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={gridVisible} onChange={() => setGridVisible(!gridVisible)} /><div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div></label></div></div>}
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shrink-0">
              <button onClick={() => setTraceRefOpen(!traceRefOpen)} className="w-full p-4 flex justify-between items-center hover:bg-slate-100 transition-colors"><h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trace Reference</h3><IconChevron open={traceRefOpen} /></button>
              {traceRefOpen && <div className="p-4 pt-0 space-y-4 border-t border-slate-200 mt-2"><label className="flex items-center justify-center w-full py-2 px-4 border border-slate-300 rounded-lg cursor-pointer bg-white hover:bg-slate-100 text-xs font-bold text-slate-600 mt-2">{referenceImg ? 'Replace Image' : 'Upload Template'}<input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>{referenceImg && <div className="space-y-3 pt-2"><div><label className="text-[10px] font-bold text-slate-500 flex justify-between">Opacity <span>{Math.round(refConfig.opacity * 100)}%</span></label><input type="range" min="0" max="1" step="0.05" value={refConfig.opacity} onChange={e => setRefConfig({...refConfig, opacity: Number(e.target.value)})} className="w-full accent-blue-600" /></div><div><label className="text-[10px] font-bold text-slate-500 flex justify-between">Scale <span>{refConfig.scale.toFixed(2)}x</span></label><input type="range" min="0.5" max="3" step="0.05" value={refConfig.scale} onChange={e => setRefConfig({...refConfig, scale: Number(e.target.value)})} className="w-full accent-blue-600" /></div><div className="flex gap-2"><div className="flex-1"><label className="text-[10px] font-bold text-slate-500 flex justify-between">X Offset <span>{refConfig.x}</span></label><input type="range" min="-300" max="300" step="5" value={refConfig.x} onChange={e => setRefConfig({...refConfig, x: Number(e.target.value)})} className="w-full accent-blue-600" /></div><div className="flex-1"><label className="text-[10px] font-bold text-slate-500 flex justify-between">Y Offset <span>{refConfig.y}</span></label><input type="range" min="-300" max="300" step="5" value={refConfig.y} onChange={e => setRefConfig({...refConfig, y: Number(e.target.value)})} className="w-full accent-blue-600" /></div></div></div>}</div>}
            </div>

            {activeMode === 'vector' ? (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-2 shrink-0">
                  <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">Add Vectors</h3>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => addCurve('bezier')} className="py-2 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-600 hover:border-blue-400 transition-colors shadow-sm">+ Bezier (S-Curve)</button>
                    <button onClick={() => addCurve('quadratic')} className="py-2 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-600 hover:border-blue-400 transition-colors shadow-sm">+ Quadratic (Simple)</button>
                    <button onClick={() => addCurve('line')} className="py-2 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-600 hover:border-blue-400 transition-colors shadow-sm">+ Straight Line</button>
                  </div>
                </div>
            ) : (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-4 shrink-0">
                   <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Sketch Tools</h3>
                   <div className="flex gap-2 bg-white p-1 rounded-lg border border-emerald-200 shadow-sm">
                       <button onClick={() => setFreehandTool('brush')} className={`flex-1 py-1.5 flex justify-center items-center rounded-md transition-all ${freehandTool === 'brush' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}><IconBrush /> <span className="ml-2 text-xs font-bold">Brush</span></button>
                       <button onClick={() => setFreehandTool('eraser')} className={`flex-1 py-1.5 flex justify-center items-center rounded-md transition-all ${freehandTool === 'eraser' ? 'bg-red-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}><IconEraser /> <span className="ml-2 text-xs font-bold">Eraser</span></button>
                   </div>
                   <div><label className="text-[10px] font-bold text-emerald-600 flex justify-between">Brush Size <span>{brushSize}px</span></label><input type="range" min="1" max="50" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className={`w-full ${freehandTool === 'eraser' ? 'accent-red-500' : 'accent-emerald-600'}`} /></div>
                   <div className="flex justify-between items-center pt-3 border-t border-emerald-200"><span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Magnetic Snap</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={freehandSnapEnabled} onChange={() => setFreehandSnapEnabled(!freehandSnapEnabled)} /><div className="w-8 h-4 bg-emerald-200 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3"></div></label></div>
                   <button onClick={() => setSelectedLayerId(null)} className={`w-full py-2 border rounded-md text-xs font-bold shadow-sm ${selectedLayerId === null ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 hover:bg-emerald-50'}`}>+ Start New Layer</button>
                </div>
            )}

            {(activeMode === 'vector' ? curves.length > 0 : freehandLayers.length > 0) && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 shrink-0 pb-10">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">Active Layers ({activeMode === 'vector' ? 'Vector' : 'Accessory'})</h3>
                  <div className="space-y-2">
                    {activeMode === 'vector' && curves.map(c => (
                        <div key={c.id} onClick={() => setSelectedLayerId(c.id)} className={`flex justify-between items-center p-2 border rounded-lg cursor-pointer transition-colors ${selectedLayerId === c.id ? 'bg-blue-50 border-blue-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                            {editingNameId === c.id ? <input autoFocus className="bg-white border border-blue-300 px-2 py-1 rounded outline-none flex-1 text-xs" value={c.name} onChange={(e) => updateLayerName(c.id, e.target.value, 'vector')} onBlur={() => setEditingNameId(null)} onKeyDown={(e) => e.key === 'Enter' && setEditingNameId(null)} /> : <div className="flex-1 flex items-center min-w-0 pr-2"><span className="text-[10px] font-bold text-blue-400 mr-2">[V]</span><span className="font-semibold text-xs text-slate-700 truncate">{c.name}</span><button onClick={(e) => { e.stopPropagation(); setSelectedLayerId(c.id); setEditingNameId(c.id); }} className="ml-2 text-slate-300 hover:text-blue-500 p-1"><IconPencil /></button><button onClick={(e) => { e.stopPropagation(); toggleLayerMirror(c.id, 'vector'); }} className={`ml-1 p-1 ${c.mirrored ? 'text-blue-500' : 'text-slate-300'}`}><IconMirror active={c.mirrored} /></button></div>}
                            <button onClick={(e) => { e.stopPropagation(); removeLayer(c.id, 'vector'); }} className="text-red-400 hover:text-red-600 font-bold px-2 py-1 text-xs">✕</button>
                        </div>
                    ))}
                    {activeMode === 'freehand' && (
                        <div className="space-y-2">
                            {checkedFreehandIds.length > 0 && <div className="flex justify-between items-center mb-2 bg-emerald-50 px-3 py-2 rounded-lg text-emerald-800 border border-emerald-200"><span className="text-[10px] font-bold">({checkedFreehandIds.length}) selected</span><div className="flex gap-1"><button onClick={groupSelectedLayers} className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700"><IconGroup /></button><button onClick={() => setCheckedFreehandIds([])} className="p-1.5 bg-slate-200 text-slate-600 rounded">✕</button></div></div>}
                            {freehandLayers.map(p => (
                                <div key={p.id} onClick={() => setSelectedLayerId(p.id)} className={`flex justify-between items-center p-2 border rounded-lg cursor-pointer transition-colors ${selectedLayerId === p.id ? 'bg-emerald-50 border-emerald-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                    {editingNameId === p.id ? <input autoFocus className="bg-white border border-emerald-300 px-2 py-1 rounded outline-none flex-1 text-xs" value={p.name} onChange={(e) => updateLayerName(p.id, e.target.value, 'freehand')} onBlur={() => setEditingNameId(null)} onKeyDown={(e) => e.key === 'Enter' && setEditingNameId(null)} /> : <div className="flex-1 flex items-center min-w-0 pr-2"><input type="checkbox" className="mr-2 w-3 h-3 accent-emerald-600" checked={checkedFreehandIds.includes(p.id)} onChange={(e) => { e.stopPropagation(); setCheckedFreehandIds(pids => e.target.checked ? [...pids, p.id] : pids.filter(id => id !== p.id)); }} /><span className="text-[10px] font-bold mr-2 text-emerald-400">[A]</span><span className="font-semibold text-xs text-slate-700 truncate">{p.name}</span><span className="ml-1 text-[9px] text-slate-400">({p.strokes.length})</span><button onClick={(e) => { e.stopPropagation(); setSelectedLayerId(p.id); setEditingNameId(p.id); }} className="ml-2 text-slate-300 hover:text-emerald-500 p-1"><IconPencil /></button><button onClick={(e) => { e.stopPropagation(); toggleLayerMirror(p.id, 'freehand'); }} className={`ml-1 p-1 ${p.mirrored ? 'text-emerald-500' : 'text-slate-300'}`}><IconMirror active={p.mirrored} /></button></div>}
                                    <button onClick={(e) => { e.stopPropagation(); removeLayer(p.id, 'freehand'); }} className="text-red-400 hover:text-red-600 font-bold px-2 py-1 text-xs">✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                  </div>
                </div>
            )}
        </div>
      </div>

      <div className="flex-1 bg-slate-200/50 flex flex-col items-center justify-center relative p-4 overflow-hidden">
        <div className="bg-white rounded-xl shadow-2xl p-1 w-full max-w-[600px] aspect-square relative z-10 ring-1 ring-slate-900/5" style={{ cursor: activeMode === 'freehand' ? 'crosshair' : 'default' }}>
            <canvas ref={canvasRef} width={600} height={600} className="w-full h-full object-contain rounded-lg" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} style={{ touchAction: 'none' }} />
        </div>
        <div className="mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex gap-3 flex-wrap justify-center">
            {activeMode === 'vector' ? (<><span><span className="text-blue-500 text-lg leading-none">●</span> Anchors</span><span><span className="text-red-500 text-lg leading-none">●</span> Controls</span><span><span className="text-green-500 text-lg leading-none">●</span> Center Snap</span><span><span className="text-amber-500 text-lg leading-none">●</span> Node Snap</span></>) : (<span>Sketch accessory layers. {freehandSnapEnabled ? "Snapping is ON." : "Snapping is OFF."}</span>)}
        </div>
      </div>

      {showImport && <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"><div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50"><h2 className="font-bold text-slate-800">Resume Workspace</h2><button onClick={() => setShowImport(false)} className="text-slate-400 hover:text-slate-800 text-xl font-bold">&times;</button></div><div className="p-4 flex-1"><p className="text-xs text-slate-500 mb-2">Paste previously exported code including the <code>// STATE_JSON:...</code> line, or raw canvas legacy commands.</p><textarea className="w-full h-80 p-4 font-mono text-[11px] bg-slate-900 text-blue-400 resize-none focus:outline-none rounded-xl" placeholder="Paste code here..." value={importCode} onChange={(e) => setImportCode(e.target.value)} /></div><div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3"><button onClick={() => { setShowImport(false); setImportCode(''); }} className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button><button onClick={handleImportAction} className="px-6 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-md">Load Workspace</button></div></div></div>}
      {showExport && <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"><div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50"><h2 className="font-bold text-slate-800">Exported Canvas Formula</h2><button onClick={() => setShowExport(false)} className="text-slate-400 hover:text-slate-800 text-xl font-bold">&times;</button></div><div className="p-0 flex-1"><textarea className="w-full h-96 p-4 font-mono text-[11px] bg-slate-900 text-green-400 resize-none focus:outline-none leading-relaxed" readOnly value={exportedCode} /></div><div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3"><button onClick={() => setShowExport(false)} className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg">Close</button><button onClick={() => { navigator.clipboard.writeText(exportedCode); alert("Copied!"); }} className="px-6 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-md">Copy Code</button></div></div></div>}
    </div>
  );
}

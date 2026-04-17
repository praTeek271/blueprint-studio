"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- ICONS ---
const IconImport = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const IconExport = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const IconMenu = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>;
const IconSidebarLeft = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>;
const IconSidebarRight = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line></svg>;
const IconUndo = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>;
const IconRedo = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 14 20 9 15 4"></polyline><path d="M4 20v-7a4 4 0 0 1 4-4h12"></path></svg>;
const IconNext = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="5 12 19 12"></polyline><polyline points="12 5 19 12 12 19"></polyline></svg>;
const IconPlus = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconLogo = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
const IconAudioOn = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg>;
const IconAudioOff = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>;
const IconChevron = ({ open }: { open: boolean }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>;

// --- TYPES & PARSERS ---
type Point = { x: number; y: number };
type Curve = { id: string; type: 'bezier' | 'quadratic' | 'line'; name: string; mirrored: boolean; p0: Point; p1: Point; cp1?: Point; cp2?: Point; };
type Stroke = { points: Point[]; size: number; isEraser: boolean; };
type LayerTransform = { x: number; y: number; scale: number; rotation: number; };
type FreehandLayer = { id: string; name: string; mirrored: boolean; strokes: Stroke[]; transform?: LayerTransform; };

const getTag = (name: string): string => {
    if (!name) return 'head';
    const match = name.match(/--(body|head|hair|glasses|beard|clothes)/i);
    if (match) return match[1].toLowerCase();
    const ln = name.toLowerCase();
    if (['neck', 'shoulder', 't-shirt', 'sleeve', 'arm', 'collar', 'trapezius', 'deltoid', 'chest', 'clothes'].some(kw => ln.includes(kw))) return 'clothes';
    if (['hair', 'bangs', 'mullet'].some(kw => ln.includes(kw))) return 'hair';
    if (['glass', 'spectacle', 'goggle'].some(kw => ln.includes(kw))) return 'glasses';
    if (['beard', 'stubble', 'mustache', 'goatee'].some(kw => ln.includes(kw))) return 'beard';
    return 'head';
};

// --- DATA SETS ---
const INITIAL_BASE_FACE: Curve[] = [
  { id: 'c1', type: 'bezier', name: 'head curve --head', mirrored: true, p0: {x: 299, y: 54}, cp1: {x: 254, y: 46}, cp2: {x: 162, y: 110}, p1: {x: 197, y: 215} },
  { id: 'c2', type: 'quadratic', name: 'jawline --head', mirrored: true, p0: {x: 197, y: 216}, cp1: {x: 205, y: 350}, p1: {x: 300, y: 385} },
  { id: 'c3', type: 'bezier', name: 'upper cheekbone --head', mirrored: true, p0: {x: 299, y: 162}, cp1: {x: 213, y: 116}, cp2: {x: 217, y: 184}, p1: {x: 195, y: 215} },
  { id: 'c4', type: 'bezier', name: 'lower cheekbone --head', mirrored: true, p0: {x: 195, y: 218}, cp1: {x: 154, y: 197}, cp2: {x: 200, y: 298}, p1: {x: 205, y: 278} },
  { id: 'c5', type: 'bezier', name: 'trapezius --clothes', mirrored: true, p0: {x: 235, y: 337}, cp1: {x: 263, y: 510}, cp2: {x: 100, y: 469}, p1: {x: 80, y: 512} },
  { id: 'c6', type: 'quadratic', name: 'deltoid --clothes', mirrored: true, p0: {x: 91, y: 501}, cp1: {x: 56, y: 526}, p1: {x: 60, y: 584} },
];

const ASSET_SHOP: FreehandLayer[] = [
    // GLASSES
    {
      id: "shop_glasses_1", name: "Classic Specs --glasses", mirrored: false, transform: {x:0, y:0, scale:1, rotation:0},
      strokes: [
        {"size":3,"isEraser":false,"points":[{"x":234,"y":204},{"x":245,"y":203},{"x":260,"y":194},{"x":277,"y":190},{"x":288,"y":193},{"x":295,"y":205},{"x":294,"y":216},{"x":286,"y":226},{"x":271,"y":227},{"x":258,"y":222},{"x":253,"y":209},{"x":255,"y":198}]},
        {"size":3,"isEraser":false,"points":[{"x":358,"y":196},{"x":349,"y":192},{"x":336,"y":188},{"x":323,"y":190},{"x":315,"y":198},{"x":313,"y":209},{"x":318,"y":221},{"x":330,"y":227},{"x":344,"y":224},{"x":354,"y":215},{"x":357,"y":202},{"x":358,"y":199}]},
        {"size":3,"isEraser":false,"points":[{"x":325,"y":191},{"x":336,"y":190},{"x":347,"y":192},{"x":337,"y":190},{"x":326,"y":191},{"x":318,"y":196}]},
        {"size":3,"isEraser":false,"points":[{"x":315,"y":198},{"x":303,"y":198},{"x":294,"y":200},{"x":304,"y":197},{"x":313,"y":198},{"x":301,"y":198},{"x":293,"y":199}]}
      ]
    },
    {
      id: "shop_glasses_2", name: "Square Frames --glasses", mirrored: true, transform: {x:0, y:0, scale:1, rotation:0},
      strokes: [
        {"size":4,"isEraser":false,"points":[{"x":290,"y":190}, {"x":230,"y":190}, {"x":220,"y":200}, {"x":220,"y":230}, {"x":240,"y":240}, {"x":280,"y":240}, {"x":290,"y":230}, {"x":290,"y":190}]},
        {"size":4,"isEraser":false,"points":[{"x":290,"y":200}, {"x":300,"y":200}]}
      ]
    },
    // HAIR
    {
      id: "shop_hair_1", name: "Textured Hair --hair", mirrored: false, transform: {x:0, y:0, scale:1, rotation:0},
      strokes: [
        {"size":4,"isEraser":false,"points":[{"x":209,"y":204},{"x":202,"y":193},{"x":202,"y":169},{"x":196,"y":162},{"x":205,"y":147},{"x":210,"y":138},{"x":198,"y":140},{"x":197,"y":134},{"x":211,"y":125},{"x":225,"y":122},{"x":220,"y":114},{"x":220,"y":104},{"x":225,"y":116},{"x":227,"y":105},{"x":234,"y":94},{"x":231,"y":103},{"x":230,"y":114},{"x":223,"y":114},{"x":217,"y":106},{"x":219,"y":104},{"x":220,"y":115},{"x":225,"y":122},{"x":229,"y":125},{"x":229,"y":116},{"x":226,"y":133},{"x":232,"y":122},{"x":233,"y":122},{"x":234,"y":126},{"x":239,"y":116},{"x":237,"y":113},{"x":229,"y":109},{"x":237,"y":102},{"x":242,"y":98},{"x":251,"y":93},{"x":260,"y":90},{"x":270,"y":88},{"x":278,"y":94},{"x":283,"y":103},{"x":286,"y":113},{"x":281,"y":122},{"x":274,"y":130},{"x":266,"y":136},{"x":257,"y":142},{"x":249,"y":148},{"x":245,"y":158},{"x":241,"y":167},{"x":234,"y":176},{"x":234,"y":192},{"x":231,"y":210},{"x":213,"y":204}]},
        {"size":4,"isEraser":false,"points":[{"x":346,"y":142},{"x":351,"y":151},{"x":355,"y":160},{"x":357,"y":175},{"x":362,"y":187},{"x":365,"y":168},{"x":365,"y":148},{"x":365,"y":136}]},
        {"size":4,"isEraser":false,"points":[{"x":252,"y":147},{"x":260,"y":153},{"x":270,"y":156},{"x":279,"y":152},{"x":288,"y":146},{"x":284,"y":155},{"x":300,"y":156},{"x":313,"y":149},{"x":321,"y":143},{"x":326,"y":135},{"x":336,"y":138},{"x":346,"y":141},{"x":357,"y":140},{"x":366,"y":137},{"x":370,"y":128},{"x":363,"y":121},{"x":357,"y":113},{"x":347,"y":110},{"x":341,"y":108},{"x":342,"y":100},{"x":332,"y":96},{"x":321,"y":94},{"x":313,"y":89},{"x":300,"y":86},{"x":287,"y":88},{"x":277,"y":90},{"x":274,"y":92}]}
      ]
    },
    {
      id: "shop_hair_2", name: "Spiky Anime --hair", mirrored: true, transform: {x:0, y:0, scale:1, rotation:0},
      strokes: [
        {"size":4,"isEraser":false,"points":[{"x":300,"y":60}, {"x":280,"y":20}, {"x":260,"y":50}, {"x":230,"y":30}, {"x":220,"y":70}, {"x":180,"y":60}, {"x":190,"y":100}, {"x":150,"y":110}, {"x":170,"y":150}, {"x":140,"y":180}, {"x":180,"y":190}, {"x":190,"y":220}, {"x":220,"y":180}, {"x":240,"y":140}, {"x":280,"y":100}, {"x":300,"y":100}]}
      ]
    },
    // BEARD
    {
      id: "shop_beard_1", name: "Heavy Beard --beard", mirrored: true, transform: {x:0, y:0, scale:1, rotation:0},
      strokes: [
        {"size":12,"isEraser":false,"points":[{"x":300,"y":322}, {"x":280,"y":320}, {"x":260,"y":305}, {"x":245,"y":280}, {"x":240,"y":245}, {"x":235,"y":215}]}
      ]
    },
    {
      id: "shop_beard_2", name: "Goatee --beard", mirrored: true, transform: {x:0, y:0, scale:1, rotation:0},
      strokes: [
        {"size":8,"isEraser":false,"points":[{"x":300,"y":335}, {"x":285,"y":330}, {"x":275,"y":315}, {"x":275,"y":300}, {"x":285,"y":290}, {"x":300,"y":288}]}
      ]
    },
    // CLOTHES
    {
      id: "shop_clothes_1", name: "V-Neck Shirt --clothes", mirrored: true, transform: {x:0, y:0, scale:1, rotation:0},
      strokes: [
        {"size":5,"isEraser":false,"points":[{"x":300,"y":390}, {"x":260,"y":340}, {"x":235,"y":337}]},
        {"size":5,"isEraser":false,"points":[{"x":260,"y":340}, {"x":240,"y":360}, {"x":180,"y":400}]}
      ]
    },
    {
      id: "shop_clothes_2", name: "Crew Neck --clothes", mirrored: true, transform: {x:0, y:0, scale:1, rotation:0},
      strokes: [
        {"size":6,"isEraser":false,"points":[{"x":300,"y":355}, {"x":270,"y":350}, {"x":245,"y":335}, {"x":235,"y":337}]}
      ]
    }
];

type AppState = {
    avatarData: { curves: Curve[], freehandLayers: FreehandLayer[] };
    activeAccessories: Record<string, string | null>;
    config: {
        eyeSpacing: number, eyeYOffset: number, showSclera: boolean, 
        mouthXOffset: number, mouthYOffset: number, mouthWidth: number, 
        micGain: number, smoothing: number, mouthSensitivity: number,
        blinkIntervalMs: number, hairColor: string, fillHair: boolean
    };
};

const INITIAL_APP_STATE: AppState = {
    avatarData: { curves: INITIAL_BASE_FACE, freehandLayers: [] },
    activeAccessories: { hair: null, beard: null, glasses: null, clothes: null },
    config: {
        eyeSpacing: 38, eyeYOffset: 0, showSclera: true, mouthXOffset: 0, mouthYOffset: 15, mouthWidth: 40,
        micGain: 1.5, smoothing: 0.4, mouthSensitivity: 0.8, blinkIntervalMs: 3500, hairColor: '#1c1e21', fillHair: true
    }
};

// --- REUSABLE ACCORDION ---
const Accordion = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shrink-0">
            <button onClick={() => setOpen(!open)} className="w-full p-4 flex justify-between items-center hover:bg-slate-100 transition-colors">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</h3>
                <IconChevron open={open} />
            </button>
            {open && <div className="p-4 pt-0 border-t border-slate-200 mt-2">{children}</div>}
        </div>
    );
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
      if (!offscreenCanvasRef.current && typeof document !== 'undefined') {
          offscreenCanvasRef.current = document.createElement('canvas');
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
  const [leftTab, setLeftTab] = useState<'shop' | 'editor'>('shop');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [showImport, setShowImport] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [customImportCategory, setCustomImportCategory] = useState<string | null>(null);
  
  const [showExport, setShowExport] = useState(false);
  const [exportPayload, setExportPayload] = useState({ json: '', env: '' });

  const [activeMode, setActiveMode] = useState<'vector' | 'freehand'>('vector');
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null); 
  const [activeNode, setActiveNode] = useState<{ curveId: string, nodeKey: string } | null>(null); 
  
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [freehandTool, setFreehandTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState(3);
  const [freehandSnapEnabled, setFreehandSnapEnabled] = useState(true);

  const [puppeteer, setPuppeteer] = useState({ lookX: 0, lookY: 0, mouthOpen: 5, headTilt: 0, isBlinking: false });
  const [isListening, setIsListening] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const autoLookRef = useRef({ x: 0, y: 0 });

  const renderRef = useRef({ puppeteer, appState, activeMode, selectedLayerId, currentStroke, freehandTool, brushSize, freehandSnapEnabled, activeNode });
  useEffect(() => { renderRef.current = { puppeteer, appState, activeMode, selectedLayerId, currentStroke, freehandTool, brushSize, freehandSnapEnabled, activeNode }; }, 
  [puppeteer, appState, activeMode, selectedLayerId, currentStroke, freehandTool, brushSize, freehandSnapEnabled, activeNode]);

  // --- AUTONOMOUS BEHAVIOR ---
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const triggerBlink = () => {
      setPuppeteer(p => ({ ...p, isBlinking: true })); 
      setTimeout(() => setPuppeteer(p => ({ ...p, isBlinking: false })), 150); 
      blinkTimeout = setTimeout(triggerBlink, appState.config.blinkIntervalMs + (Math.random() * 2000 - 1000));
    };
    blinkTimeout = setTimeout(triggerBlink, appState.config.blinkIntervalMs);

    const dartInterval = setInterval(() => {
      autoLookRef.current = { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 };
    }, 2000 + Math.random() * 3000); 

    return () => { clearTimeout(blinkTimeout); clearInterval(dartInterval); };
  }, [appState.config.blinkIntervalMs]);

  const toggleAudio = async () => {
    if (isListening) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioCtxRef.current) audioCtxRef.current.close();
      setIsListening(false);
      setPuppeteer(p => ({ ...p, mouthOpen: 5, headTilt: 0 }));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser(); analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream); source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const renderAudioFrame = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0; for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        let average = sum / dataArray.length;
        
        setPuppeteer(prev => {
            const conf = renderRef.current.appState.config;
            const scaledAvg = average * conf.micGain;
            const targetOpenness = Math.min(Math.max(scaledAvg * conf.mouthSensitivity - 5, 0), 60);
            return {
                ...prev,
                mouthOpen: prev.mouthOpen + (targetOpenness - prev.mouthOpen) * conf.smoothing,
                headTilt: prev.headTilt + (((scaledAvg > 10) ? 3 : 0) - prev.headTilt) * 0.1,
                lookX: prev.lookX + (autoLookRef.current.x - prev.lookX) * 0.1,
                lookY: prev.lookY + (autoLookRef.current.y - prev.lookY) * 0.1
            };
        });
        animationRef.current = requestAnimationFrame(renderAudioFrame);
      };
      setIsListening(true);
      renderAudioFrame();
    } catch (err) {
      console.error(err); alert("Microphone access required.");
    }
  };

  // --- ACTIONS ---
  const handleNextPhase = () => {
      setLeftSidebarOpen(false);
      setRightSidebarOpen(true);
  };

  const handleConfigChange = (key: keyof AppState['config'], value: any) => {
      setAppState(prev => ({ ...prev, config: { ...prev.config, [key]: value } }));
  };

  const handleTransformChange = (layerId: string, key: keyof LayerTransform, value: number) => {
      setAppState(prev => ({
          ...prev,
          avatarData: {
              ...prev.avatarData,
              freehandLayers: prev.avatarData.freehandLayers.map(l => 
                  l.id === layerId ? { ...l, transform: { ...(l.transform || {x:0,y:0,scale:1,rotation:0}), [key]: value } } : l
              )
          }
      }));
  };

  const handleSliderCommit = () => saveHistory(appState);

  const setAccessory = (category: string, id: string) => {
      const newState = {
          ...appState,
          activeAccessories: {
              ...appState.activeAccessories,
              [category]: appState.activeAccessories[category] === id ? null : id // Toggle off if clicked again
          }
      };
      setAppState(newState);
      saveHistory(newState);
  };

  const injectShopAsset = (asset: FreehandLayer) => {
      const clonedAsset = JSON.parse(JSON.stringify(asset));
      clonedAsset.id = Date.now().toString() + Math.random().toString();
      if (!clonedAsset.transform) clonedAsset.transform = { x: 0, y: 0, scale: 1, rotation: 0 };
      const cat = getTag(clonedAsset.name);
      
      const newState = {
          ...appState,
          avatarData: { ...appState.avatarData, freehandLayers: [...appState.avatarData.freehandLayers, clonedAsset] },
          activeAccessories: { ...appState.activeAccessories, [cat]: clonedAsset.id }
      };
      setAppState(newState);
      saveHistory(newState);
  };

  const removeLayer = (id: string, type: 'vector' | 'freehand') => {
      const newState = { ...appState };
      if (type === 'vector') {
          newState.avatarData.curves = newState.avatarData.curves.filter(c => c.id !== id);
      } else {
          newState.avatarData.freehandLayers = newState.avatarData.freehandLayers.filter(p => p.id !== id);
          // If active, remove from activeAccessories
          Object.keys(newState.activeAccessories).forEach(k => {
              if (newState.activeAccessories[k] === id) newState.activeAccessories[k] = null;
          });
      }
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
            if (s.freehandLayers) parsedLayers = s.freehandLayers.map((l: FreehandLayer) => ({ ...l, transform: l.transform || {x:0, y:0, scale:1, rotation:0} }));
        } catch (e) { alert("Failed to restore state from JSON."); return; }
    } else {
        try {
            let currentSection = 'none'; let currentName = 'Legacy Shape'; let lastMoveTo: Point | null = null;
            let currentLayer: FreehandLayer | null = null; let currentStroke: Stroke | null = null; let currentSize = 3;

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
                        if (currentLayer && currentStroke && currentStroke.points.length > 0) currentLayer.strokes.push(currentStroke);
                        if (currentLayer && currentLayer.strokes.length > 0) parsedLayers.push(currentLayer);
                        currentLayer = { id: Date.now() + Math.random().toString(), name: currentName, mirrored: false, strokes: [], transform: {x:0,y:0,scale:1,rotation:0} };
                        currentStroke = null;
                    }
                    continue;
                }

                const sizeMatch = line.match(/lineWidth\s*=\s*(\d+)/);
                if (sizeMatch) currentSize = parseInt(sizeMatch[1], 10);

                const moveMatch = line.match(/moveTo\(([^,]+),\s*([^)]+)\)/);
                if (moveMatch) {
                    const pt = { x: parseCoord(moveMatch[1]), y: parseCoord(moveMatch[2]) };
                    if (currentSection === 'vector') { lastMoveTo = pt; } 
                    else if (currentSection === 'freehand') {
                        if (currentStroke && currentStroke.points.length > 0 && currentLayer) currentLayer.strokes.push(currentStroke);
                        currentStroke = { points: [pt], size: currentSize, isEraser: false };
                        if (!currentLayer) currentLayer = { id: Date.now() + Math.random().toString(), name: currentName, mirrored: false, strokes: [], transform: {x:0,y:0,scale:1,rotation:0} };
                    }
                }

                if (currentSection === 'vector' && lastMoveTo) {
                    const bezMatch = line.match(/bezierCurveTo\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
                    if (bezMatch) { parsedCurves.push({ id: Date.now() + Math.random().toString(), type: 'bezier', name: currentName, mirrored: false, p0: lastMoveTo, cp1: { x: parseCoord(bezMatch[1]), y: parseCoord(bezMatch[2]) }, cp2: { x: parseCoord(bezMatch[3]), y: parseCoord(bezMatch[4]) }, p1: { x: parseCoord(bezMatch[5]), y: parseCoord(bezMatch[6]) } }); lastMoveTo = null; }
                    const quadMatch = line.match(/quadraticCurveTo\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
                    if (quadMatch) { parsedCurves.push({ id: Date.now() + Math.random().toString(), type: 'quadratic', name: currentName, mirrored: false, p0: lastMoveTo, cp1: { x: parseCoord(quadMatch[1]), y: parseCoord(quadMatch[2]) }, p1: { x: parseCoord(quadMatch[3]), y: parseCoord(quadMatch[4]) } }); lastMoveTo = null; }
                    const lineMatch = line.match(/lineTo\(([^,]+),\s*([^)]+)\)/);
                    if (lineMatch) { parsedCurves.push({ id: Date.now() + Math.random().toString(), type: 'line', name: currentName, mirrored: false, p0: lastMoveTo, p1: { x: parseCoord(lineMatch[1]), y: parseCoord(lineMatch[2]) } }); lastMoveTo = null; }
                }

                if (currentSection === 'freehand' && currentStroke) {
                    const lineMatch = line.match(/lineTo\(([^,]+),\s*([^)]+)\)/);
                    if (lineMatch) currentStroke.points.push({ x: parseCoord(lineMatch[1]), y: parseCoord(lineMatch[2]) });
                }
            }

            if (currentLayer && currentStroke && currentStroke.points.length > 0) currentLayer.strokes.push(currentStroke);
            if (currentLayer && currentLayer.strokes.length > 0) parsedLayers.push(currentLayer);
        } catch (e) { alert("Failed to parse code."); return; }
    }

    if (customImportCategory) {
        const combinedStrokes = parsedLayers.flatMap(l => l.strokes);
        if (combinedStrokes.length > 0) {
            const newLayer: FreehandLayer = { id: Date.now().toString(), name: `Custom --${customImportCategory}`, mirrored: false, strokes: combinedStrokes, transform: {x:0,y:0,scale:1,rotation:0} };
            const newState = {
                ...appState,
                avatarData: { ...appState.avatarData, freehandLayers: [...appState.avatarData.freehandLayers, newLayer] },
                activeAccessories: { ...appState.activeAccessories, [customImportCategory]: newLayer.id }
            };
            setAppState(newState); saveHistory(newState);
            alert(`Custom ${customImportCategory} loaded!`);
        } else { alert("No freehand strokes found to import."); }
    } else {
        const newState = { ...appState, avatarData: { curves: parsedCurves, freehandLayers: parsedLayers } };
        setAppState(newState); saveHistory(newState);
        alert("Full Blueprint loaded!");
    }
    
    setShowImport(false); setImportCode(''); setCustomImportCategory(null);
  };

  const handleExportAction = () => {
      const activeIds = Object.values(appState.activeAccessories).filter(id => id !== null);
      const filteredAccessories = appState.avatarData.freehandLayers.filter(a => activeIds.includes(a.id));
      
      const playerJson = { geometry: { curves: appState.avatarData.curves, freehandLayers: filteredAccessories }, config: appState.config };
      const envString = Object.entries(appState.config).map(([k, v]) => `NEXT_PUBLIC_AVATAR_${k.replace(/([A-Z])/g, '_$1').toUpperCase()}=${v}`).join('\n');
      
      setExportPayload({ json: JSON.stringify(playerJson, null, 2), env: envString });
      setShowExport(true);
      setMenuOpen(false);
  };

  // --- RENDERING ENGINE ---
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !offscreenCanvasRef.current) return;
    const ctx = canvas.getContext('2d');
    const offCtx = offscreenCanvasRef.current.getContext('2d');
    if (!ctx || !offCtx) return;

    const { 
        puppeteer: pup, 
        appState: { avatarData: ad, config: conf, activeAccessories: accs },
        activeMode, selectedLayerId, currentStroke, freehandTool, brushSize, freehandSnapEnabled, activeNode 
    } = renderRef.current;
    
    const { curves, freehandLayers } = ad;

    const isBodyPart = (name: string) => ['body', 'clothes'].includes(getTag(name));

    const headCurves = curves.filter(c => !isBodyPart(c.name));
    const bodyCurves = curves.filter(c => isBodyPart(c.name));
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const drawCurve = (c: Curve) => {
        const isSelected = selectedLayerId === c.id && activeMode === 'vector';
        const vectorAlpha = activeMode === 'vector' ? 1.0 : 0.4;
        ctx.beginPath();
        ctx.strokeStyle = isSelected ? '#2563eb' : `rgba(15, 23, 42, ${vectorAlpha})`;
        ctx.lineWidth = 3;
        ctx.moveTo(c.p0.x, c.p0.y);
        if (c.type === 'bezier') ctx.bezierCurveTo(c.cp1!.x, c.cp1!.y, c.cp2!.x, c.cp2!.y, c.p1.x, c.p1.y);
        else if (c.type === 'quadratic') ctx.quadraticCurveTo(c.cp1!.x, c.cp1!.y, c.p1.x, c.p1.y);
        else if (c.type === 'line') ctx.lineTo(c.p1.x, c.p1.y);
        ctx.stroke();

        if (c.mirrored) {
            ctx.beginPath();
            ctx.strokeStyle = isSelected ? `rgba(37, 99, 235, ${0.4 * vectorAlpha})` : `rgba(15, 23, 42, ${0.3 * vectorAlpha})`;
            ctx.moveTo(600 - c.p0.x, c.p0.y);
            if (c.type === 'bezier') ctx.bezierCurveTo(600 - c.cp1!.x, c.cp1!.y, 600 - c.cp2!.x, c.cp2!.y, 600 - c.p1.x, c.p1.y);
            else if (c.type === 'quadratic') ctx.quadraticCurveTo(600 - c.cp1!.x, c.cp1!.y, 600 - c.p1.x, c.p1.y);
            else if (c.type === 'line') ctx.lineTo(600 - c.p1.x, c.p1.y);
            ctx.stroke();
        }

        if (isSelected && activeMode === 'vector') {
            ctx.lineWidth = 1;
            const drawNode = (point: Point, isControl = false, nodeKey: string) => {
                const isNodeActive = activeNode?.curveId === c.id && activeNode?.nodeKey === nodeKey;
                ctx.beginPath(); ctx.arc(point.x, point.y, isNodeActive ? 6 : 5, 0, Math.PI * 2);
                ctx.fillStyle = isControl ? (isNodeActive ? '#ef4444' : '#fca5a5') : (isNodeActive ? '#3b82f6' : '#93c5fd'); 
                ctx.strokeStyle = isControl ? '#b91c1c' : '#1d4ed8';
                ctx.fill(); ctx.stroke();
            };
            const drawGuideline = (pA: Point, pB: Point) => { ctx.beginPath(); ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)'; ctx.setLineDash([4, 4]); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.stroke(); ctx.setLineDash([]); };
            if (c.type === 'bezier') { drawGuideline(c.p0, c.cp1!); drawGuideline(c.p1, c.cp2!); drawNode(c.cp1!, true, 'cp1'); drawNode(c.cp2!, true, 'cp2'); }
            else if (c.type === 'quadratic') { drawGuideline(c.p0, c.cp1!); drawGuideline(c.p1, c.cp1!); drawNode(c.cp1!, true, 'cp1'); }
            drawNode(c.p0, false, 'p0'); drawNode(c.p1, false, 'p1');
        }
    };

    const renderAccessoryGroupToOffscreen = (layers: FreehandLayer[], renderActiveStroke: boolean = false) => {
        offCtx.clearRect(0, 0, 600, 600);
        offCtx.lineCap = 'round'; offCtx.lineJoin = 'round';

        layers.forEach(layer => {
            const cat = getTag(layer.name);
            // In editing mode, we might want to see all layers, but for standard playback we filter.
            // Let's enforce active accessories filter to avoid clutter.
            if (accs[cat] !== layer.id) return;
            
            const isHair = cat === 'hair';
            const tr = layer.transform || { x: 0, y: 0, scale: 1, rotation: 0 };
            
            offCtx.save();
            // Pivot around face center for transformations
            offCtx.translate(300 + tr.x, 250 + tr.y);
            offCtx.rotate((tr.rotation * Math.PI) / 180);
            offCtx.scale(tr.scale, tr.scale);
            offCtx.translate(-300, -250);

            if (conf.fillHair && isHair) {
                offCtx.beginPath();
                layer.strokes.forEach(s => {
                    if (s.isEraser) return;
                    offCtx.moveTo(s.points[0].x, s.points[0].y);
                    for (let i = 1; i < s.points.length; i++) offCtx.lineTo(s.points[i].x, s.points[i].y);
                    if (layer.mirrored) {
                        offCtx.moveTo(600 - s.points[0].x, s.points[0].y);
                        for (let i = 1; i < s.points.length; i++) offCtx.lineTo(600 - s.points[i].x, s.points[i].y);
                    }
                });
                offCtx.globalCompositeOperation = 'source-over';
                offCtx.fillStyle = conf.hairColor; offCtx.fill();
            }

            layer.strokes.forEach(s => {
                offCtx.globalCompositeOperation = s.isEraser ? 'destination-out' : 'source-over';
                offCtx.beginPath(); offCtx.lineWidth = s.size;
                offCtx.strokeStyle = s.isEraser ? '#000' : (isHair && conf.fillHair ? conf.hairColor : '#1a1a1a'); 
                offCtx.moveTo(s.points[0].x, s.points[0].y);
                for (let i = 1; i < s.points.length; i++) offCtx.lineTo(s.points[i].x, s.points[i].y);
                offCtx.stroke();

                if (layer.mirrored) {
                    offCtx.beginPath(); offCtx.moveTo(600 - s.points[0].x, s.points[0].y);
                    for (let i = 1; i < s.points.length; i++) offCtx.lineTo(600 - s.points[i].x, s.points[i].y);
                    offCtx.stroke();
                }
            });
            offCtx.restore();
        });

        if (renderActiveStroke && currentStroke.length > 0 && activeMode === 'freehand') {
            const activeLayer = freehandLayers.find(l => l.id === selectedLayerId);
            const isMirrored = activeLayer ? activeLayer.mirrored : true;
            const isHair = getTag(activeLayer?.name || '') === 'hair';
            
            offCtx.globalCompositeOperation = freehandTool === 'eraser' ? 'destination-out' : 'source-over';
            offCtx.beginPath(); offCtx.lineWidth = brushSize;
            offCtx.strokeStyle = freehandTool === 'eraser' ? '#000' : (isHair && conf.fillHair ? conf.hairColor : '#3b82f6');
            
            offCtx.moveTo(currentStroke[0].x, currentStroke[0].y);
            for (let i = 1; i < currentStroke.length; i++) offCtx.lineTo(currentStroke[i].x, currentStroke[i].y);
            offCtx.stroke();

            if (isMirrored) {
                offCtx.beginPath(); offCtx.moveTo(600 - currentStroke[0].x, currentStroke[0].y);
                for (let i = 1; i < currentStroke.length; i++) offCtx.lineTo(600 - currentStroke[i].x, currentStroke[i].y);
                offCtx.stroke();
            }

            if (!freehandTool.includes('eraser') && freehandSnapEnabled) {
                const lastPoint = currentStroke[currentStroke.length - 1];
                if (lastPoint.x === 300) {
                    ctx.beginPath(); ctx.arc(lastPoint.x, lastPoint.y, 6, 0, Math.PI * 2);
                    ctx.fillStyle = '#22c55e'; ctx.strokeStyle = '#14532d'; ctx.lineWidth = 2;
                    ctx.fill(); ctx.stroke();
                }
            }
        }
    };

    // 1. Draw STATIC BODY
    bodyCurves.forEach(drawCurve);
    
    const isDrawingBody = activeMode === 'freehand' && (!selectedLayerId || isBodyPart(freehandLayers.find(l => l.id === selectedLayerId)?.name || ''));
    renderAccessoryGroupToOffscreen(freehandLayers.filter(l => isBodyPart(l.name)), isDrawingBody);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(offscreenCanvasRef.current, 0, 0);

    // 2. Draw DYNAMIC HEAD
    ctx.save();
    const pivotX = 300; const pivotY = 330;
    ctx.translate(pivotX, pivotY); ctx.rotate((pup.headTilt * Math.PI) / 180); ctx.translate(-pivotX, -pivotY);

    headCurves.forEach(drawCurve);

    // Eyes
    const fX = pup.lookX; const fY = pup.lookY;
    const cx = 300; const cy = 200 + conf.eyeYOffset; const eDist = conf.eyeSpacing;
    if (pup.isBlinking) {
        ctx.lineWidth = 4; ctx.strokeStyle = '#1a1a1a';
        ctx.beginPath(); ctx.moveTo(cx - eDist - 15, cy); ctx.quadraticCurveTo(cx - eDist, cy + 5, cx - eDist + 15, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + eDist - 15, cy); ctx.quadraticCurveTo(cx + eDist, cy + 5, cx + eDist + 15, cy); ctx.stroke();
    } else {
        if (conf.showSclera) {
            ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx - eDist, cy, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(cx + eDist, cy, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
        ctx.fillStyle = '#1a1a1a'; 
        ctx.beginPath(); ctx.arc(cx - eDist + fX, cy + fY, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + eDist + fX, cy + fY, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; 
        ctx.beginPath(); ctx.arc(cx - eDist + fX - 2, cy + fY - 2, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + eDist + fX - 2, cy + fY - 2, 2, 0, Math.PI * 2); ctx.fill();
    }

    // Mouth
    ctx.fillStyle = '#780000'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3; ctx.beginPath();
    const mouthCenterY = 260 + conf.mouthYOffset;
    const mX = conf.mouthXOffset;
    const mW = conf.mouthWidth / 2;
    ctx.moveTo(cx - mW + mX, mouthCenterY); 
    ctx.quadraticCurveTo(cx + mX, mouthCenterY - 5, cx + mW + mX, mouthCenterY); 
    ctx.bezierCurveTo(cx + mW + mX, mouthCenterY + pup.mouthOpen, cx - mW + mX, mouthCenterY + pup.mouthOpen, cx - mW + mX, mouthCenterY); 
    ctx.fill(); ctx.stroke();

    // Head Accessories
    const isDrawingHead = activeMode === 'freehand' && (!selectedLayerId || !isBodyPart(freehandLayers.find(l => l.id === selectedLayerId)?.name || ''));
    renderAccessoryGroupToOffscreen(freehandLayers.filter(l => !isBodyPart(l.name)), isDrawingHead);
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(offscreenCanvasRef.current, 0, 0);

    ctx.restore(); 

  }, []);

  useEffect(() => {
    let animId: number;
    const loop = () => { renderCanvas(); animId = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [renderCanvas]);

  // --- DRAWING HANDLERS ---
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const coords = { x: Math.round((e.clientX - rect.left) * (600/rect.width)), y: Math.round((e.clientY - rect.top) * (600/rect.height)) };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (activeMode === 'freehand') {
        setIsDrawing(true); setCurrentStroke([coords]);
    } else {
        if (!selectedLayerId) return;
        const { curves } = appState.avatarData;
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
    let tx = Math.round((e.clientX - rect.left) * (600/rect.width)); 
    let ty = Math.round((e.clientY - rect.top) * (600/rect.height));
    
    if (activeMode === 'freehand' && isDrawing) {
        if (freehandSnapEnabled && Math.abs(tx - 300) < 10 && freehandTool !== 'eraser') tx = 300;
        setCurrentStroke(p => (Math.hypot(tx-p[p.length-1].x, ty-p[p.length-1].y)>3 || tx===300) ? [...p, {x:tx, y:ty}] : p);
    } else if (activeMode === 'vector' && activeNode) {
        if (Math.abs(tx - 300) < 10) tx = 300;
        const newState = {
            ...appState,
            avatarData: {
                ...appState.avatarData,
                curves: appState.avatarData.curves.map(c => c.id === activeNode.curveId ? { ...c, [activeNode.nodeKey]: { x: tx, y: ty } } : c)
            }
        };
        setAppState(newState);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    if (activeMode === 'freehand' && isDrawing) {
        setIsDrawing(false);
        if (currentStroke.length > 1) {
            const s: Stroke = { points: currentStroke, size: brushSize, isEraser: freehandTool === 'eraser' };
            const { freehandLayers } = appState.avatarData;
            let newState;
            if (selectedLayerId && freehandLayers.some(l => l.id === selectedLayerId)) {
                newState = {
                    ...appState,
                    avatarData: { ...appState.avatarData, freehandLayers: freehandLayers.map(l => l.id === selectedLayerId ? { ...l, strokes: [...l.strokes, s] } : l) }
                };
            } else {
                const newId = Date.now().toString();
                const newLayer: FreehandLayer = { id: newId, name: `Accessory --head`, mirrored: true, strokes: [s], transform: {x:0, y:0, scale:1, rotation:0} };
                newState = {
                    ...appState,
                    avatarData: { ...appState.avatarData, freehandLayers: [...freehandLayers, newLayer] },
                    activeAccessories: { ...appState.activeAccessories, 'head': newLayer.id }
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
          <div className="fixed inset-0 bg-slate-900/90 z-[100] flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
                  <div className="flex justify-center mb-4"><IconLogo /></div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Avatar Studio V3</h2>
                  <p className="text-sm text-slate-500 mb-8 leading-relaxed">Welcome! Import a custom blueprint, or start with the default rig.</p>
                  <div className="flex flex-col gap-3">
                      <button onClick={() => { setShowStartup(false); setShowImport(true); }} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">Import Custom Blueprint</button>
                      <button onClick={() => setShowStartup(false)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">Use Default Avatar 1</button>
                  </div>
              </div>
          </div>
      );
  }

  const shopCategories = ['hair', 'glasses', 'beard', 'clothes'];

  return (
    <div className="flex flex-col h-screen bg-slate-200 font-sans text-slate-800 overflow-hidden selection:bg-blue-100">
      
      {/* UNIVERSAL NAVBAR */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                  <IconLogo />
                  <span className="font-black tracking-tight text-slate-800 hidden sm:inline">Avatar Studio</span>
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest rounded-md">V3</span>
              </div>
              <div className="h-6 w-px bg-slate-200"></div>
              <button onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} className={`p-2 rounded-lg transition-colors ${leftSidebarOpen ? 'bg-slate-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}><IconSidebarLeft /></button>
          </div>

          <div className="flex items-center gap-2">
              <button onClick={undo} disabled={historyIdx <= 0} className="p-2 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 rounded-lg transition-colors" title="Undo"><IconUndo /></button>
              <button onClick={redo} disabled={historyIdx >= history.length - 1} className="p-2 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 rounded-lg transition-colors" title="Redo"><IconRedo /></button>
          </div>

          <div className="flex items-center gap-3">
              <button onClick={handleNextPhase} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors shadow-sm">
                  Next <IconNext />
              </button>
              <div className="h-6 w-px bg-slate-200"></div>
              <button onClick={() => setRightSidebarOpen(!rightSidebarOpen)} className={`p-2 rounded-lg transition-colors ${rightSidebarOpen ? 'bg-slate-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}><IconSidebarRight /></button>
              <div className="relative">
                  <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"><IconMenu /></button>
                  {menuOpen && (
                      <>
                          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                              <button onClick={() => { setShowImport(true); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"><IconImport /> Import Blueprint</button>
                              <button onClick={() => { handleExportAction(); }} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"><IconExport /> Export Player Script</button>
                          </div>
                      </>
                  )}
              </div>
          </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
          
          {/* LEFT SIDEBAR */}
          <div className={`absolute lg:relative top-0 left-0 h-full w-full md:w-[360px] bg-white border-r border-slate-200 flex flex-col z-20 shadow-2xl lg:shadow-none transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:-ml-[360px]'}`}>
              
              <div className="flex border-b border-slate-200 shrink-0">
                  <button onClick={() => setLeftTab('shop')} className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase transition-colors ${leftTab === 'shop' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}>Shop</button>
                  <button onClick={() => setLeftTab('editor')} className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase transition-colors ${leftTab === 'editor' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}>Editor</button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  
                  {leftTab === 'shop' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                          {shopCategories.map(cat => {
                              const items = ASSET_SHOP.filter(s => getTag(s.name) === cat);
                              const activeId = appState.activeAccessories[cat];
                              return (
                                  <Accordion key={cat} title={`${cat} Wardrobe`} defaultOpen={true}>
                                      <div className="flex overflow-x-auto gap-3 pb-2 pt-2 scrollbar-thin">
                                          <button onClick={() => { setCustomImportCategory(cat); setShowImport(true); }} className="shrink-0 w-24 h-28 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 transition-all group">
                                              <span className="mb-1 transform group-hover:scale-110 transition-transform"><IconPlus /></span>
                                              <span className="text-[10px] font-bold">Custom</span>
                                          </button>
                                          {appState.avatarData.freehandLayers.filter(l => getTag(l.name) === cat && !ASSET_SHOP.find(s => s.id === l.id)).map(acc => (
                                              <button key={acc.id} onClick={() => setAccessory(cat, acc.id)} className={`shrink-0 w-24 h-28 rounded-xl border p-2 flex flex-col justify-end text-[10px] font-bold transition-all relative overflow-hidden ${activeId === acc.id ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-inner' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                                  {activeId === acc.id && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500"></div>}
                                                  <span className="truncate w-full text-center">{acc.name.split('--')[0]}</span>
                                              </button>
                                          ))}
                                          {items.map(item => (
                                              <button key={item.id} onClick={() => injectShopAsset(item)} className="shrink-0 w-24 h-28 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-2 flex flex-col justify-end text-[10px] font-bold text-slate-500 transition-all">
                                                  <span className="truncate w-full text-center">+ {item.name.split('--')[0]}</span>
                                              </button>
                                          ))}
                                      </div>
                                  </Accordion>
                              );
                          })}
                      </div>
                  )}

                  {leftTab === 'editor' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                          
                          <Accordion title="Base Face Proportions" defaultOpen={true}>
                              <div className="space-y-4 pt-2">
                                  <div className="flex items-center gap-3 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-200" onClick={() => { handleConfigChange('showSclera', !appState.config.showSclera); handleSliderCommit(); }}>
                                      <div className={`w-8 h-5 rounded-full p-1 transition-colors ${appState.config.showSclera ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                          <div className={`w-3 h-3 bg-white rounded-full transition-transform ${appState.config.showSclera ? 'translate-x-3' : 'translate-x-0'}`}/>
                                      </div>
                                      <span className="text-xs font-bold text-slate-700">Show Eye Whites</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div><label className="text-[10px] font-bold text-slate-500 flex justify-between">Eye Gap <span>{appState.config.eyeSpacing}</span></label><input type="range" min="15" max="70" value={appState.config.eyeSpacing} onChange={e => handleConfigChange('eyeSpacing', Number(e.target.value))} onPointerUp={handleSliderCommit} className="w-full mt-1 accent-blue-600" /></div>
                                      <div><label className="text-[10px] font-bold text-slate-500 flex justify-between">Eye Y <span>{appState.config.eyeYOffset}</span></label><input type="range" min="-50" max="50" value={appState.config.eyeYOffset} onChange={e => handleConfigChange('eyeYOffset', Number(e.target.value))} onPointerUp={handleSliderCommit} className="w-full mt-1 accent-blue-600" /></div>
                                      <div><label className="text-[10px] font-bold text-slate-500 flex justify-between">Mouth X <span>{appState.config.mouthXOffset}</span></label><input type="range" min="-50" max="50" value={appState.config.mouthXOffset} onChange={e => handleConfigChange('mouthXOffset', Number(e.target.value))} onPointerUp={handleSliderCommit} className="w-full mt-1 accent-blue-600" /></div>
                                      <div><label className="text-[10px] font-bold text-slate-500 flex justify-between">Mouth Y <span>{appState.config.mouthYOffset}</span></label><input type="range" min="-50" max="50" value={appState.config.mouthYOffset} onChange={e => handleConfigChange('mouthYOffset', Number(e.target.value))} onPointerUp={handleSliderCommit} className="w-full mt-1 accent-blue-600" /></div>
                                  </div>
                                  <div><label className="text-[10px] font-bold text-slate-500 flex justify-between">Mouth Width <span>{appState.config.mouthWidth}</span></label><input type="range" min="10" max="80" value={appState.config.mouthWidth} onChange={e => handleConfigChange('mouthWidth', Number(e.target.value))} onPointerUp={handleSliderCommit} className="w-full mt-1 accent-blue-600" /></div>
                              </div>
                          </Accordion>

                          <Accordion title="Active Layers" defaultOpen={true}>
                              <div className="space-y-2 pt-2">
                                  {Object.values(appState.activeAccessories).filter(id => id !== null).map(id => {
                                      const layer = appState.avatarData.freehandLayers.find(l => l.id === id);
                                      if (!layer) return null;
                                      const tr = layer.transform || {x:0, y:0, scale:1, rotation:0};
                                      return (
                                          <div key={layer.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                                              <div className="flex justify-between items-center mb-2">
                                                  <span className="text-xs font-bold text-slate-700 truncate pr-2">{layer.name}</span>
                                                  <button onClick={() => removeLayer(layer.id, 'freehand')} className="text-red-400 hover:text-red-600 font-bold text-[10px] bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">Remove</button>
                                              </div>
                                              <div className="grid grid-cols-2 gap-3">
                                                  <div><label className="text-[9px] font-bold text-slate-400 flex justify-between">X Offset <span>{tr.x}</span></label><input type="range" min="-100" max="100" value={tr.x} onChange={e => handleTransformChange(layer.id, 'x', Number(e.target.value))} onPointerUp={handleSliderCommit} className="w-full mt-1 accent-slate-600" /></div>
                                                  <div><label className="text-[9px] font-bold text-slate-400 flex justify-between">Y Offset <span>{tr.y}</span></label><input type="range" min="-100" max="100" value={tr.y} onChange={e => handleTransformChange(layer.id, 'y', Number(e.target.value))} onPointerUp={handleSliderCommit} className="w-full mt-1 accent-slate-600" /></div>
                                                  <div><label className="text-[9px] font-bold text-slate-400 flex justify-between">Scale <span>{tr.scale.toFixed(2)}</span></label><input type="range" min="0.5" max="2" step="0.05" value={tr.scale} onChange={e => handleTransformChange(layer.id, 'scale', Number(e.target.value))} onPointerUp={handleSliderCommit} className="w-full mt-1 accent-slate-600" /></div>
                                                  <div><label className="text-[9px] font-bold text-slate-400 flex justify-between">Rotation <span>{tr.rotation}°</span></label><input type="range" min="-180" max="180" value={tr.rotation} onChange={e => handleTransformChange(layer.id, 'rotation', Number(e.target.value))} onPointerUp={handleSliderCommit} className="w-full mt-1 accent-slate-600" /></div>
                                              </div>
                                          </div>
                                      );
                                  })}
                                  {Object.values(appState.activeAccessories).every(id => id === null) && (
                                      <p className="text-[10px] text-slate-400 italic text-center py-2">No accessories equipped.</p>
                                  )}
                              </div>
                          </Accordion>

                      </div>
                  )}
              </div>
          </div>

          {/* CENTER WORKSPACE */}
          <div className="flex-1 flex flex-col items-center justify-center relative p-4 overflow-hidden">
              {(leftSidebarOpen || rightSidebarOpen) && <div className="absolute inset-0 z-10 lg:hidden bg-slate-900/20 backdrop-blur-sm" onClick={() => {setLeftSidebarOpen(false); setRightSidebarOpen(false);}}></div>}
              <div className="bg-white rounded-[2rem] shadow-2xl p-2 w-full max-w-[600px] aspect-square relative z-10 ring-1 ring-slate-900/5 transition-transform hover:scale-[1.01] duration-300">
                  <canvas ref={canvasRef} width={600} height={600} className="w-full h-full object-contain rounded-[1.5rem]" />
              </div>
          </div>

          {/* RIGHT SIDEBAR (Puppeteer) */}
          <div className={`absolute lg:relative top-0 right-0 h-full w-full md:w-[320px] bg-white border-l border-slate-200 flex flex-col z-20 shadow-2xl lg:shadow-none transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:-mr-[320px]'}`}>
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                  <div>
                      <h2 className="text-sm font-bold text-slate-800 tracking-tight">Puppeteer Rig</h2>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-blue-600">Live Animation</p>
                  </div>
                  <button onClick={toggleAudio} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-md ${isListening ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-slate-800 hover:bg-slate-900 text-white'}`}>
                      {isListening ? <IconAudioOn /> : <IconAudioOff />}
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-blue-800 text-xs leading-relaxed font-medium">
                      Click the microphone icon above to test lip-sync and live head tilt driven by your voice.
                  </div>

                  <Accordion title="Audio Calibration" defaultOpen={true}>
                      <div className="space-y-4 pt-2">
                          <div><label className="text-[10px] font-bold text-slate-500 flex justify-between">Mic Gain <span>{appState.config.micGain.toFixed(1)}x</span></label><input type="range" min="0.5" max="5" step="0.1" value={appState.config.micGain} onChange={e => handleConfigChange('micGain', Number(e.target.value))} onPointerUp={handleSliderCommit} className="w-full mt-1 accent-blue-600" /></div>
                          <div><label className="text-[10px] font-bold text-slate-500 flex justify-between">Mouth Sensitivity <span>{appState.config.mouthSensitivity.toFixed(2)}x</span></label><input type="range" min="0.1" max="2" step="0.1" value={appState.config.mouthSensitivity} onChange={e => handleConfigChange('mouthSensitivity', Number(e.target.value))} onPointerUp={handleSliderCommit} className="w-full mt-1 accent-blue-600" /></div>
                          <div><label className="text-[10px] font-bold text-slate-500 flex justify-between">Animation Smoothing <span>{appState.config.smoothing.toFixed(2)}</span></label><input type="range" min="0.05" max="0.9" step="0.05" value={appState.config.smoothing} onChange={e => handleConfigChange('smoothing', Number(e.target.value))} onPointerUp={handleSliderCommit} className="w-full mt-1 accent-blue-600" /></div>
                      </div>
                  </Accordion>

                  <Accordion title="Autonomous Motion" defaultOpen={true}>
                      <div className="space-y-4 pt-2">
                          <div><label className="text-[10px] font-bold text-slate-500 flex justify-between">Blink Interval <span>{(appState.config.blinkIntervalMs / 1000).toFixed(1)}s</span></label><input type="range" min="1000" max="10000" step="500" value={appState.config.blinkIntervalMs} onChange={e => handleConfigChange('blinkIntervalMs', Number(e.target.value))} onPointerUp={handleSliderCommit} className="w-full mt-1 accent-blue-600" /></div>
                      </div>
                  </Accordion>
                  
                  {isListening && (
                      <div className="bg-slate-900 p-4 rounded-xl text-white space-y-2">
                          <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live Engine Data</h3>
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                              <div><div className="text-slate-500 text-[9px]">Mouth Open</div><div className="text-green-400">{puppeteer.mouthOpen.toFixed(1)}</div></div>
                              <div><div className="text-slate-500 text-[9px]">Head Tilt</div><div className="text-blue-400">{puppeteer.headTilt.toFixed(1)}°</div></div>
                          </div>
                      </div>
                  )}
              </div>
          </div>

      </div>

      {/* MODALS */}
      {showImport && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                      <h2 className="font-bold text-slate-800">{customImportCategory ? `Import Custom ${customImportCategory.charAt(0).toUpperCase() + customImportCategory.slice(1)}` : 'Load Blueprint'}</h2>
                      <button onClick={() => { setShowImport(false); setCustomImportCategory(null); setImportCode(''); }} className="text-slate-400 hover:text-slate-800 text-xl font-bold">&times;</button>
                  </div>
                  <div className="p-4 flex-1">
                      <p className="text-xs text-slate-500 mb-2">Paste code exported from Blueprint Studio.</p>
                      <textarea className="w-full h-80 p-4 font-mono text-[11px] bg-slate-900 text-blue-400 resize-none focus:outline-none rounded-xl" placeholder="Paste Blueprint Code here..." value={importCode} onChange={(e) => setImportCode(e.target.value)} />
                  </div>
                  <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                      <button onClick={() => { setShowImport(false); setCustomImportCategory(null); setImportCode(''); }} className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                      <button onClick={handleImportAction} className="px-6 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-md">Load Blueprint</button>
                  </div>
              </div>
          </div>
      )}
      
      {showExport && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh]">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                      <h2 className="font-bold text-slate-800">Export Player Assets</h2>
                      <button onClick={() => setShowExport(false)} className="text-slate-400 hover:text-slate-800 text-xl font-bold">&times;</button>
                  </div>
                  <div className="flex flex-1 min-h-0 flex-col md:flex-row">
                      <div className="flex-1 flex flex-col border-r border-slate-200">
                          <div className="p-2 bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4">avatar-config.json</div>
                          <textarea className="w-full flex-1 p-4 font-mono text-[11px] bg-slate-900 text-green-400 resize-none focus:outline-none" readOnly value={exportPayload.json} />
                      </div>
                      <div className="w-full md:w-1/3 flex flex-col bg-slate-50">
                          <div className="p-2 bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4">.env Variables</div>
                          <textarea className="w-full flex-1 p-4 font-mono text-[11px] bg-slate-800 text-blue-300 resize-none focus:outline-none" readOnly value={exportPayload.env} />
                      </div>
                  </div>
                  <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 hidden sm:block">Save JSON file and add ENV variables to your Next.js Player</span>
                      <button onClick={() => setShowExport(false)} className="px-6 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors ml-auto">Done</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}